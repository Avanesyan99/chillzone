import { NextRequest, NextResponse } from 'next/server';
import { createSession, signInWithGoogleIdToken, SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE_SECONDS } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendWelcomeEmail } from '@/lib/email';

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

interface GoogleUserInfo {
  sub: string;        // Google user ID
  name: string;
  email: string;
  picture: string;
  email_verified: boolean;
}

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const { searchParams } = new URL(req.url);

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // User denied access
  if (error) {
    return NextResponse.redirect(`${appUrl}/login?error=google_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/login?error=missing_params`);
  }

  // CSRF check
  const storedState = req.cookies.get('google_oauth_state')?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}/login?error=invalid_state`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('[google-callback] Token exchange failed:', await tokenRes.text());
      return NextResponse.redirect(`${appUrl}/login?error=token_exchange`);
    }

    const tokens: GoogleTokenResponse = await tokenRes.json();

    // Get user info from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.redirect(`${appUrl}/login?error=userinfo_failed`);
    }

    const googleUser: GoogleUserInfo = await userInfoRes.json();

    if (!googleUser.email_verified) {
      return NextResponse.redirect(`${appUrl}/login?error=email_not_verified`);
    }

    // Create/link the Firebase Auth user via the Google id_token and get a Firebase session
    const signIn = await signInWithGoogleIdToken(tokens.id_token, appUrl);
    const isNewUser = !!signIn.isNewUser;

    if (isNewUser) {
      await db.collection('users').doc(signIn.localId).set({
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        phone: null,
        isAdmin: false,
        createdAt: FieldValue.serverTimestamp(),
      });
      sendWelcomeEmail({ to: googleUser.email, userName: googleUser.name }).catch(console.error);
    }

    const session = await createSession(signIn.idToken);
    const res = NextResponse.redirect(`${appUrl}/`);

    res.cookies.set(SESSION_COOKIE_NAME, session, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
      path: '/',
    });

    // Clear the OAuth state cookie
    res.cookies.set('google_oauth_state', '', { maxAge: 0, path: '/' });

    return res;
  } catch (e) {
    console.error('[google-callback] Error:', e);
    return NextResponse.redirect(`${appUrl}/login?error=server_error`);
  }
}
