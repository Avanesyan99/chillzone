import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';
import { createSession, signInWithPassword, SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE_SECONDS } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: 'Nombre, email y contraseña son requeridos.' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });

    const normalizedEmail = email.toLowerCase();

    let userRecord;
    try {
      userRecord = await auth.createUser({ email: normalizedEmail, password, displayName: name });
    } catch (e: unknown) {
      if ((e as { code?: string })?.code === 'auth/email-already-exists') {
        return NextResponse.json({ error: 'Ya existe una cuenta con ese email.' }, { status: 409 });
      }
      throw e;
    }

    await db.collection('users').doc(userRecord.uid).set({
      name, email: normalizedEmail, phone: phone || null, isAdmin: false, createdAt: FieldValue.serverTimestamp(),
    });

    const signIn = await signInWithPassword(normalizedEmail, password);
    const session = await createSession(signIn.idToken);
    const res = NextResponse.json({ user: { userId: userRecord.uid, email: normalizedEmail, name, phone: phone || null, isAdmin: false } });
    res.cookies.set(SESSION_COOKIE_NAME, session, { httpOnly: true, sameSite: 'lax', maxAge: SESSION_COOKIE_MAX_AGE_SECONDS, path: '/' });

    sendWelcomeEmail({ to: normalizedEmail, userName: name }).catch(console.error);
    return res;
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Error interno.' }, { status: 500 }); }
}
