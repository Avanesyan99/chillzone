import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/products';
export const dynamic = 'force-dynamic';
export async function GET() {
  try { return NextResponse.json({ products: await getAllProducts() }); }
  catch { return NextResponse.json({ error: 'Error' }, { status: 500 }); }
}
