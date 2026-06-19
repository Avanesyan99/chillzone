import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/db';

async function isAdmin(req: NextRequest) {
  const token = req.cookies.get('chillzone-token')?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  if (!payload) return false;
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { isAdmin: true } });
  return user?.isAdmin ?? false;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/admin/upload
 * multipart/form-data with a "file" field.
 *
 * Returns: { url: "https://<blob>.public.blob.vercel-storage.com/..." }
 * Use that URL directly as the product's image_url.
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'BLOB_READ_WRITE_TOKEN no configurado. Agregalo en .env o en las variables de entorno de Vercel.' },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No se recibió ningún archivo (campo "file").' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Usá JPG, PNG, WEBP o AVIF.' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'El archivo supera 5MB.' }, { status: 400 });
    }

    // Sanitize filename and prefix with timestamp to avoid collisions
    const ext = file.name.split('.').pop() || 'jpg';
    const safeName = file.name
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60);
    const filename = `products/${Date.now()}-${safeName}.${ext}`;

    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error('[upload]', e);
    return NextResponse.json({ error: 'Error al subir el archivo.' }, { status: 500 });
  }
}
