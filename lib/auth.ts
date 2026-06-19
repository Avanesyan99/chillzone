import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'chillzone-secret-change-in-production'
);

export interface JWTPayload { userId: number; email: string; name: string; isAdmin: boolean; }

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JWTPayload;
  } catch { return null; }
}
export async function hashPassword(password: string) { return bcrypt.hash(password, 12); }
export async function comparePassword(password: string, hash: string) { return bcrypt.compare(password, hash); }
