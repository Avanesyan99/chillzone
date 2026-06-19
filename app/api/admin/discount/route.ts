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

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  const { slug, discountPct, discountLabel } = await req.json();
  if (!slug || typeof discountPct !== 'number' || discountPct < 0 || discountPct > 100)
    return NextResponse.json({ error: 'Parámetros inválidos.' }, { status: 400 });
  const product = await prisma.product.update({
    where: { slug },
    data: { discountPct, discountLabel: discountPct > 0 ? (discountLabel || `${discountPct}% OFF`) : null },
  });
  return NextResponse.json({ product });
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  return NextResponse.json({ products: await prisma.product.findMany({ where: { discountPct: { gt: 0 } } }) });
}
