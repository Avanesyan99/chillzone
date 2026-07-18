import { NextRequest, NextResponse } from 'next/server';
import { createSession, getUserDoc, signInWithPassword, SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE_SECONDS } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email y contraseña son requeridos.' }, { status: 400 });

    let signIn;
    try {
      signIn = await signInWithPassword(email.toLowerCase(), password);
    } catch {
      return NextResponse.json({ error: 'Email o contraseña incorrectos.' }, { status: 401 });
    }

    const userDoc = await getUserDoc(signIn.localId);
    if (!userDoc) return NextResponse.json({ error: 'Email o contraseña incorrectos.' }, { status: 401 });

    const session = await createSession(signIn.idToken);
    const res = NextResponse.json({ user: { userId: signIn.localId, email: userDoc.email, name: userDoc.name, phone: userDoc.phone, isAdmin: userDoc.isAdmin } });
    res.cookies.set(SESSION_COOKIE_NAME, session, { httpOnly: true, sameSite: 'lax', maxAge: SESSION_COOKIE_MAX_AGE_SECONDS, path: '/' });
    return res;
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Error interno.' }, { status: 500 }); }
}
