import { NextRequest } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';

const SESSION_COOKIE = 'chillzone-token';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const IDENTITY_TOOLKIT = 'https://identitytoolkit.googleapis.com/v1';

function apiKey() {
  const key = process.env.FIREBASE_WEB_API_KEY;
  if (!key) throw new Error('FIREBASE_WEB_API_KEY no configurado.');
  return key;
}

async function identityToolkit<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${IDENTITY_TOOLKIT}/accounts:${endpoint}?key=${apiKey()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `${endpoint} failed`);
  return data as T;
}

export interface SignInResult { idToken: string; localId: string; email: string; isNewUser?: boolean }

/** Verifies email+password via the Identity Toolkit REST API (replaces bcrypt compare). */
export async function signInWithPassword(email: string, password: string): Promise<SignInResult> {
  return identityToolkit<SignInResult>('signInWithPassword', { email, password, returnSecureToken: true });
}

/** Exchanges a Google id_token (from our own OAuth code-exchange flow) for a Firebase session. */
export async function signInWithGoogleIdToken(googleIdToken: string, appUrl: string): Promise<SignInResult> {
  return identityToolkit<SignInResult>('signInWithIdp', {
    postBody: `id_token=${googleIdToken}&providerId=google.com`,
    requestUri: appUrl,
    returnIdpCredential: true,
    returnSecureToken: true,
  });
}

/** Completes a password reset given the oobCode from a Firebase reset-password link. */
export async function resetPasswordWithOobCode(oobCode: string, newPassword: string): Promise<{ email: string }> {
  return identityToolkit<{ email: string }>('resetPassword', { oobCode, newPassword });
}

/** Mints a long-lived, httpOnly session cookie from a fresh Firebase ID token. */
export async function createSession(idToken: string): Promise<string> {
  return auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
}

export interface Session { uid: string; email: string }

/** Verifies the session cookie from the request, returning null if absent/invalid/revoked. */
export async function verifySession(req: NextRequest): Promise<Session | null> {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await auth.verifySessionCookie(cookie, true);
    return { uid: decoded.uid, email: decoded.email ?? '' };
  } catch {
    return null;
  }
}

export interface UserDoc { name: string; email: string; phone: string | null; isAdmin: boolean; createdAt: string }

export async function getUserDoc(uid: string): Promise<UserDoc | null> {
  const doc = await db.collection('users').doc(uid).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    name: data.name,
    email: data.email,
    phone: data.phone ?? null,
    isAdmin: data.isAdmin ?? false,
    createdAt: (data.createdAt?.toDate?.() ?? new Date()).toISOString(),
  };
}

/** Verifies the session and that the user is an admin. Returns the uid, or null if not authorized. */
export async function requireAdmin(req: NextRequest): Promise<string | null> {
  const session = await verifySession(req);
  if (!session) return null;
  const userDoc = await getUserDoc(session.uid);
  return userDoc?.isAdmin ? session.uid : null;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_COOKIE_MAX_AGE_SECONDS = SESSION_MAX_AGE_MS / 1000;
