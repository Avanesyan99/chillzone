import { NextRequest, NextResponse } from 'next/server';
import { createSession, getUserDoc, resetPasswordWithOobCode, signInWithPassword, SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE_SECONDS } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { oobCode, password } = await req.json();

    if (!oobCode || !password) {
      return NextResponse.json({ error: 'Enlace y contraseña son requeridos.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
    }

    let email;
    try {
      ({ email } = await resetPasswordWithOobCode(oobCode, password));
    } catch {
      return NextResponse.json({ error: 'El enlace no es válido o ya fue utilizado, o expiró.' }, { status: 400 });
    }

    // Auto-login
    const signIn = await signInWithPassword(email, password);
    const userDoc = await getUserDoc(signIn.localId);
    const session = await createSession(signIn.idToken);

    const res = NextResponse.json({
      ok: true,
      user: { userId: signIn.localId, email, name: userDoc?.name, phone: userDoc?.phone ?? null, isAdmin: userDoc?.isAdmin ?? false },
    });
    res.cookies.set(SESSION_COOKIE_NAME, session, { httpOnly: true, sameSite: 'lax', maxAge: SESSION_COOKIE_MAX_AGE_SECONDS, path: '/' });
    return res;
  } catch (e) {
    console.error('[reset-password]', e);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
