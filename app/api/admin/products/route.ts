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

/** GET /api/admin/products — list all products (admin view, includes 0-stock) */
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  const products = await prisma.product.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
  return NextResponse.json({ products });
}

/**
 * POST /api/admin/products — create a new product
 * Body: { slug, name, description?, price, category, modelo?, capacity?, color?, image_url?, stock?, discountPct?, discountLabel? }
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const body = await req.json();
  const { slug, name, price, category } = body;

  if (!slug || !name || typeof price !== 'number' || !category) {
    return NextResponse.json({ error: 'slug, name, price y category son requeridos.' }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: 'Ya existe un producto con ese slug.' }, { status: 409 });

  const product = await prisma.product.create({
    data: {
      slug,
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
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
