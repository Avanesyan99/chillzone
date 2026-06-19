import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signToken } from '@/lib/auth';
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

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.sub },
          { email: googleUser.email.toLowerCase() },
        ],
      },
      select: { id: true, name: true, email: true, googleId: true, isAdmin: true },
    });

    let isNewUser = false;

    if (user) {
      // Existing user — link Google ID if not already linked
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.sub },
          select: { id: true, name: true, email: true, googleId: true, isAdmin: true },
        });
      }
    } else {
      // New user — create account
      user = await prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email.toLowerCase(),
          googleId: googleUser.sub,
          password: null, // Google users have no password
        },
        select: { id: true, name: true, email: true, googleId: true, isAdmin: true },
      });
      isNewUser = true;
    }

    // Send welcome email to new users (non-blocking)
    if (isNewUser) {
      sendWelcomeEmail({ to: user.email, userName: user.name }).catch(console.error);
    }

    // Issue JWT and redirect
    const jwt = await signToken({ userId: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin });

    const res = NextResponse.redirect(`${appUrl}/`);

    res.cookies.set('chillzone-token', jwt, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 604800, // 7 days
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
