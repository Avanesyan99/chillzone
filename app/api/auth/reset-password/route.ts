import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token y contraseña son requeridos.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
    }

    const record = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!record || record.used) {
      return NextResponse.json({ error: 'El enlace no es válido o ya fue utilizado.' }, { status: 400 });
    }
    if (new Date() > record.expiresAt) {
      return NextResponse.json({ error: 'El enlace expiró. Solicitá uno nuevo.' }, { status: 400 });
    }

    const hashed = await hashPassword(password);

    // Update user password and mark token as used
    const user = await prisma.user.update({
      where: { id: record.userId },
      data: { password: hashed },
      select: { id: true, email: true, name: true, phone: true, isAdmin: true },
    });
    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });

    // Auto-login
    const jwt = await signToken({ userId: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin });
    const res = NextResponse.json({
      ok: true,
      user: { userId: user.id, email: user.email, name: user.name, phone: user.phone, isAdmin: user.isAdmin },
    });
    res.cookies.set('chillzone-token', jwt, { httpOnly: true, sameSite: 'lax', maxAge: 604800, path: '/' });
    return res;
  } catch (e) {
    console.error('[reset-password]', e);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
