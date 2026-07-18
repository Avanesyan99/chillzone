import { NextRequest, NextResponse } from 'next/server';
import { verifySession, getUserDoc } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await verifySession(req);
  if (!session) return NextResponse.json({ user: null }, { status: 401 });
  const userDoc = await getUserDoc(session.uid);
  if (!userDoc) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: { userId: session.uid, name: userDoc.name, email: userDoc.email, phone: userDoc.phone, isAdmin: userDoc.isAdmin } });
}
