import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { auth, db } from '@/lib/firebase-admin';

export async function PATCH(req: NextRequest) {
  const session = await verifySession(req);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  const { name, phone } = await req.json();
  if (!name) return NextResponse.json({ error: 'El nombre es requerido.' }, { status: 400 });

  await db.collection('users').doc(session.uid).update({ name, phone: phone || null });
  await auth.updateUser(session.uid, { displayName: name });

  return NextResponse.json({ user: { userId: session.uid, name, email: session.email, phone: phone || null } });
}
