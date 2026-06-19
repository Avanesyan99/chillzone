import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function isAdmin(req: NextRequest) {
  const token = req.cookies.get('chillzone-token')?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  if (!payload) return false;
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { isAdmin: true } });
  return user?.isAdmin ?? false;
}

/** GET /api/admin/users — list all users for admin panel */
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const users = await prisma.user.findMany({
    orderBy: [{ createdAt: 'desc' }],
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ users });
}
