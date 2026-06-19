import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: 'Nombre, email y contraseña son requeridos.' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return NextResponse.json({ error: 'Ya existe una cuenta con ese email.' }, { status: 409 });
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), phone: phone || null, password: hashed },
      select: { id: true, email: true, name: true, phone: true, isAdmin: true },
    });
    const token = await signToken({ userId: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin });
    const res = NextResponse.json({ user: { userId: user.id, email: user.email, name: user.name, phone: user.phone, isAdmin: user.isAdmin } });
    res.cookies.set('chillzone-token', token, { httpOnly: true, sameSite: 'lax', maxAge: 604800, path: '/' });
    // Send welcome email (non-blocking)
    sendWelcomeEmail({ to: user.email, userName: user.name }).catch(console.error);
    return res;
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Error interno.' }, { status: 500 }); }
}
