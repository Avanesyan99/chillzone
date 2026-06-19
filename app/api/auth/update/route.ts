import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
export async function PATCH(req: NextRequest) {
  const token = req.cookies.get('chillzone-token')?.value;
  if (!token) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  const { name, phone } = await req.json();
  if (!name) return NextResponse.json({ error: 'El nombre es requerido.' }, { status: 400 });
  const user = await prisma.user.update({ where: { id: payload.userId }, data: { name, phone: phone || null } });
  return NextResponse.json({ user: { userId: user.id, name: user.name, email: user.email, phone: user.phone } });
}
