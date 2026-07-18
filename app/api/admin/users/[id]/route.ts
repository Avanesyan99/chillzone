import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { auth, db } from '@/lib/firebase-admin';

function resolveId(rawId: string | string[] | undefined) {
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  return id || null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string | string[] | undefined }> }) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const resolvedParams = await params;
  const id = resolveId(resolvedParams.id);
  if (!id) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

  const body = await req.json();
  const allowed: Record<string, unknown> = {};
  if ('isAdmin' in body) allowed.isAdmin = Boolean(body.isAdmin);

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: 'No hay campos para actualizar.' }, { status: 400 });
  }

  const ref = db.collection('users').doc(id);
  const existing = await ref.get();
  if (!existing.exists) return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });

  await ref.update(allowed);
  const updated = await ref.get();
  return NextResponse.json({ user: { id: ref.id, ...updated.data() } });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string | string[] | undefined }> }) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const resolvedParams = await params;
  const id = resolveId(resolvedParams.id);
  if (!id) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

  const ref = db.collection('users').doc(id);
  const existing = await ref.get();
  if (!existing.exists) return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });

  await ref.delete();
  await auth.deleteUser(id).catch(() => {}); // Firestore doc is the source of truth for the admin list; ignore if already gone

  return NextResponse.json({ ok: true });
}
