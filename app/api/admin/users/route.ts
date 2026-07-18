import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';

/** GET /api/admin/users — list all users for admin panel */
export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const snap = await db.collection('users').get();
  const users = snap.docs
    .map(d => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        isAdmin: data.isAdmin ?? false,
        createdAt: (data.createdAt?.toDate?.() ?? new Date()).toISOString(),
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json({ users });
}
