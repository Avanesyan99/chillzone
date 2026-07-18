import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  const { slug, discountPct, discountLabel } = await req.json();
  if (!slug || typeof discountPct !== 'number' || discountPct < 0 || discountPct > 100)
    return NextResponse.json({ error: 'Parámetros inválidos.' }, { status: 400 });

  const ref = db.collection('products').doc(slug);
  const existing = await ref.get();
  if (!existing.exists) return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });

  const data = { discountPct, discountLabel: discountPct > 0 ? (discountLabel || `${discountPct}% OFF`) : null };
  await ref.update(data);
  const updated = await ref.get();
  return NextResponse.json({ product: { id: ref.id, slug: ref.id, ...updated.data() } });
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  const snap = await db.collection('products').where('discountPct', '>', 0).get();
  const products = snap.docs.map(d => ({ id: d.id, slug: d.id, ...d.data() }));
  return NextResponse.json({ products });
}
