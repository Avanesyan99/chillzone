import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email) {
      return NextResponse.json({ error: 'Email requerido.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always 200 to prevent email enumeration
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    // Google-only account — no password to reset
    if (!user.password && user.googleId) {
      return NextResponse.json({ ok: true, googleAccount: true });
    }

    // Invalidate existing tokens
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt, used: false },
    });

    try {
      await sendPasswordResetEmail({ to: user.email, userName: user.name, token });
    } catch (emailErr) {
      console.error('[forgot-password] Email failed:', emailErr);
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          ok: true,
          dev_resetUrl: `/reset-password?token=${token}`,
        });
      }
      return NextResponse.json({ error: 'No se pudo enviar el email. Intentá de nuevo.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[forgot-password]', e);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
