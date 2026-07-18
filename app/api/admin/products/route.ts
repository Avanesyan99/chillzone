import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getAllProducts } from '@/lib/products';

/** GET /api/admin/products — list all products (admin view, includes 0-stock) */
export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  const products = await getAllProducts();
  return NextResponse.json({ products });
}

/**
 * POST /api/admin/products — create a new product
 * Body: { slug, name, description?, price, category, modelo?, capacity?, color?, image_url?, stock?, discountPct?, discountLabel? }
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const body = await req.json();
  const { slug, name, price, category } = body;

  if (!slug || !name || typeof price !== 'number' || !category) {
    return NextResponse.json({ error: 'slug, name, price y category son requeridos.' }, { status: 400 });
  }

  const ref = db.collection('products').doc(slug);
  const existing = await ref.get();
  if (existing.exists) return NextResponse.json({ error: 'Ya existe un producto con ese slug.' }, { status: 409 });

  const data = {
    name,
    description: body.description ?? null,
    price,
    category,
    modelo: body.modelo ?? null,
    capacity: body.capacity ?? null,
    color: body.color ?? null,
    image_url: body.image_url ?? null,
    stock: typeof body.stock === 'number' ? body.stock : 10,
    discountPct: typeof body.discountPct === 'number' ? body.discountPct : 0,
    discountLabel: body.discountLabel ?? null,
    createdAt: FieldValue.serverTimestamp(),
  };
  await ref.set(data);

  return NextResponse.json({ product: { id: slug, slug, ...data, createdAt: new Date().toISOString() } }, { status: 201 });
}
