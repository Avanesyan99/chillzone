import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email y contraseña son requeridos.' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, select: { id: true, email: true, name: true, phone: true, password: true, isAdmin: true } });
    if (!user || !user.password || !(await comparePassword(password, user.password))) return NextResponse.json({ error: 'Email o contraseña incorrectos.' }, { status: 401 });
    const token = await signToken({ userId: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin });
    const res = NextResponse.json({ user: { userId: user.id, email: user.email, name: user.name, phone: user.phone, isAdmin: user.isAdmin } });
    res.cookies.set('chillzone-token', token, { httpOnly: true, sameSite: 'lax', maxAge: 604800, path: '/' });
    return res;
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Error interno.' }, { status: 500 }); }
}
