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

/** PATCH /api/admin/products/[id] — update any product field */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string | string[] | undefined }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const resolvedParams = await params;
  const rawId = resolvedParams.id;
  const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

  const body = await req.json();
  const data: Record<string, unknown> = {};

  const allowed = ['slug', 'name', 'description', 'price', 'category', 'modelo', 'capacity', 'color', 'image_url', 'stock', 'discountPct', 'discountLabel'];
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No hay campos para actualizar.' }, { status: 400 });
  }

  try {
    const product = await prisma.product.update({ where: { id }, data });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });
  }
}

/** DELETE /api/admin/products/[id] */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string | string[] | undefined }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const resolvedParams = await params;
  const rawId = resolvedParams.id;
  const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });
  }
}
