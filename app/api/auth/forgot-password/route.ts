import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email) {
      return NextResponse.json({ error: 'Email requerido.' }, { status: 400 });
    }

    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch {
      // Always 200 to prevent email enumeration
      return NextResponse.json({ ok: true });
    }

    const hasPasswordProvider = userRecord.providerData.some(p => p.providerId === 'password');
    if (!hasPasswordProvider) {
      return NextResponse.json({ ok: true, googleAccount: true });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const link = await auth.generatePasswordResetLink(email, { url: `${appUrl}/reset-password` });
    const oobCode = new URL(link).searchParams.get('oobCode');
    if (!oobCode) throw new Error('No se pudo generar el código de restablecimiento.');

    try {
      await sendPasswordResetEmail({ to: userRecord.email!, userName: userRecord.displayName || 'Usuario', oobCode });
    } catch (emailErr) {
      console.error('[forgot-password] Email failed:', emailErr);
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          ok: true,
          dev_resetUrl: `/reset-password?oobCode=${oobCode}`,
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
