# CHILLZONE — Web Store

**Outdoor & Lifestyle Gear · Stay Refreshed. Go Anywhere.**

---

## Stack
- **Next.js 16** + TypeScript
- **Firebase** — Cloud Firestore (database) + Firebase Authentication (email/password + Google)
- **Vercel Blob** — image storage
- **GDPR-compliant** cookie consent banner

---

## Deployment Guide (Vercel + Firebase)

### Step 1 — Firebase (auth + database)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → Create a project
2. **Build → Firestore Database** → Create database (Native mode)
3. **Build → Authentication → Sign-in method** → enable **Email/Password** and **Google**
   - Under the Google provider's "Web SDK configuration," add your `GOOGLE_CLIENT_ID` (see Step 2) as an additional authorized client ID
4. **Authentication → Templates → Password reset** → set the Action URL to `https://yourdomain.com/reset-password`
5. **Project Settings → Service accounts** → Generate new private key → gives `project_id`, `client_email`, `private_key`
6. **Project Settings → General** → copy the **Web API Key**
7. **Firestore → Rules** → set to `allow read, write: if false;` (only the server-side Admin SDK touches Firestore)

### Step 2 — Google OAuth (for the custom Google login flow)

1. [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client
2. Authorized redirect URI: `https://yourdomain.com/api/auth/google/callback`

### Step 3 — Vercel (hosting + images)

1. Push this project to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repository
3. **Storage tab → Create Blob store** → name it `chillzone-images`
4. Vercel auto-adds `BLOB_READ_WRITE_TOKEN` to your environment variables
5. Add the remaining env vars in **Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `FIREBASE_PROJECT_ID` | From the service account JSON |
| `FIREBASE_CLIENT_EMAIL` | From the service account JSON |
| `FIREBASE_PRIVATE_KEY` | From the service account JSON (keep the `\n` escapes) |
| `FIREBASE_WEB_API_KEY` | Project Settings → General → Web API Key |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | From Step 2 |
| `RESEND_API_KEY` / `RESEND_FROM` | For transactional emails |

6. Deploy.
7. After first deploy, seed the products: run `npm run db:seed` locally pointing at your Firebase project.

### Step 4 — Seed products

```bash
# In your local .env, set the real FIREBASE_* credentials, then:
npm run db:seed
```

---

## Migrating from an older Supabase/Prisma setup

If you're upgrading an existing deployment that still has data in Supabase Postgres, run the
one-time migration script instead of (or before) seeding:

```bash
npm install pg @types/pg  # only needed for this script
# Set both the legacy DATABASE_URL/DIRECT_URL and the new FIREBASE_* vars in .env, then:
npm run db:migrate-legacy
```

This copies all products and users (preserving bcrypt password hashes and Google account links)
into Firestore/Firebase Auth. Verify the data, then delete `scripts/migrate-to-firebase.ts`,
remove `DATABASE_URL`/`DIRECT_URL`, and decommission the Supabase project.

---

## Admin Panel

Visit `/dashboard` while logged in as an admin user to:

- ➕ Add new products with name, price, category, modelo, capacity, color, stock
- 🖼️ **Upload photos** — drag or click "Subir foto" → uploads to Vercel Blob automatically
- ✏️ Edit any product
- 🏷️ Set discounts (% + label) with live price preview
- 🗑️ Delete products
- 👤 Manage users (promote to admin, delete)

No code changes needed to manage the catalog.

---

## Cookie Consent

GDPR-compliant banner appears on first visit with three options:
- **Aceptar todas** — functional + analytics cookies
- **Solo necesarias** — session + cart only (required for the store)
- **Rechazar opcionales** — same as "Solo necesarias"

Users can review and reset their choice at `/cookies`.

Cookie categories:
| Cookie | Type | Purpose |
|---|---|---|
| `chillzone-token` | Required | Firebase session cookie (httpOnly) |
| `chillzone-cart` | Required | Cart persistence (localStorage) |
| `chillzone-cookie-consent` | Required | Stores consent choice |
| `chillzone-theme` | Functional | Dark/light mode preference |

---

## Local development

```bash
# 1. Fill in .env with real Firebase credentials
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Seed the catalog + admin user
npm run db:seed

# 4. Start dev server
npm run dev
```

---

## Pages

| Route | Description |
|---|---|
| `/` | Hero + catalog with filters |
| `/product/[slug]` | Product detail |
| `/cart` | Cart + WhatsApp checkout (login required) |
| `/login` | Login / Register / Forgot password |
| `/reset-password?oobCode=...` | Set new password |
| `/cuenta` | Profile management |
| `/contacto` | Contact page |
| `/dashboard` | **Admin panel** — manage products, discounts, users + upload photos |
| `/cookies` | Cookie policy + consent settings |
| `/privacidad` | Privacy policy |

---

## Before going live checklist

- [ ] Replace `5491100000000` with your real number in `app/cart/page.tsx` and `app/contacto/page.tsx`
- [ ] Update Instagram handle in `app/contacto/page.tsx`
- [ ] Update company name/email in `app/privacidad/page.tsx` and `app/cookies/page.tsx`
- [ ] Seed products via `npm run db:seed`
- [ ] Add product photos via `/dashboard` panel
- [ ] Lock down Firestore security rules (deny-all, Admin SDK only)
