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

function resolveId(rawId: string | string[] | undefined) {
  const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
  return Number.isInteger(id) ? id : null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string | string[] | undefined }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const resolvedParams = await params;
  const id = resolveId(resolvedParams.id);
  if (!id) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

  const body = await req.json();
  const allowed: Record<string, unknown> = {};
  if ('isAdmin' in body) allowed.isAdmin = Boolean(body.isAdmin);

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: 'No hay campos para actualizar.' }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({ where: { id }, data: allowed });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string | string[] | undefined }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const resolvedParams = await params;
  const id = resolveId(resolvedParams.id);
  if (!id) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
  }
}
