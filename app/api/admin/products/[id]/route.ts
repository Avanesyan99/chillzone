import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';

/** PATCH /api/admin/products/[id] — update any product field. [id] is the product's slug (Firestore doc id). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string | string[] | undefined }> }) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const resolvedParams = await params;
  const rawId = resolvedParams.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

  const body = await req.json();
  const data: Record<string, unknown> = {};

  const allowed = ['name', 'description', 'price', 'category', 'modelo', 'capacity', 'color', 'image_url', 'stock', 'discountPct', 'discountLabel'];
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  if (Object.keys(data).length === 0 && !(typeof body.slug === 'string' && body.slug !== id)) {
    return NextResponse.json({ error: 'No hay campos para actualizar.' }, { status: 400 });
  }

  const ref = db.collection('products').doc(id);
  const existing = await ref.get();
  if (!existing.exists) return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });

  // Renaming the slug means moving to a new doc id, since slug == doc id.
  if (typeof body.slug === 'string' && body.slug !== id) {
    const newRef = db.collection('products').doc(body.slug);
    if ((await newRef.get()).exists) return NextResponse.json({ error: 'Ya existe un producto con ese slug.' }, { status: 409 });
    const merged = { ...existing.data(), ...data };
    await newRef.set(merged);
    await ref.delete();
    const updated = await newRef.get();
    return NextResponse.json({ product: { id: newRef.id, slug: newRef.id, ...updated.data() } });
  }

  await ref.update(data);
  const updated = await ref.get();
  return NextResponse.json({ product: { id: ref.id, slug: ref.id, ...updated.data() } });
}

/** DELETE /api/admin/products/[id] */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string | string[] | undefined }> }) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const resolvedParams = await params;
  const rawId = resolvedParams.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

  const ref = db.collection('products').doc(id);
  const existing = await ref.get();
  if (!existing.exists) return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });

  await ref.delete();
  return NextResponse.json({ ok: true });
}
