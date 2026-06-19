import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('chillzone-token')?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ user: null }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, name: true, email: true, phone: true, isAdmin: true } });
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: { userId: user.id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin } });
}
