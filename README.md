# CHILLZONE — Web Store

**Outdoor & Lifestyle Gear · Stay Refreshed. Go Anywhere.**

---

## Stack
- **Next.js 15** + TypeScript
- **Prisma ORM** + **Supabase** (PostgreSQL)
- **Vercel Blob** — image storage
- **JWT** auth (`jose` + `bcryptjs`, httpOnly cookies)
- **GDPR-compliant** cookie consent banner

---

## Deployment Guide (Vercel + Supabase)

### Step 1 — Supabase (database)

1. Go to [supabase.com](https://supabase.com) → New project
2. Once created: **Project Settings → Database → Connection string**
3. Copy two strings:
   - **Transaction pooler** (port 6543) → `DATABASE_URL`
   - **Session pooler / Direct** (port 5432) → `DIRECT_URL`
4. Add `?pgbouncer=true&connection_limit=1` to the end of `DATABASE_URL`

### Step 2 — Vercel (hosting + images)

1. Push this project to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repository
3. **Storage tab → Create Blob store** → name it `chillzone-images`
4. Vercel auto-adds `BLOB_READ_WRITE_TOKEN` to your environment variables
5. Add the remaining env vars in **Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Supabase pooled URL (port 6543) |
| `DIRECT_URL` | Supabase direct URL (port 5432) |
| `JWT_SECRET` | Any long random string |
| `ADMIN_KEY` | Secret key for the admin panel |

6. Deploy — the build command (`prisma generate && prisma migrate deploy && next build`) runs migrations automatically.
7. After first deploy, seed the products: run `npm run db:seed` locally pointing to your Supabase URL.

### Step 3 — Seed products

```bash
# In your local .env, set the real Supabase DATABASE_URL and DIRECT_URL, then:
npm run db:seed
```

---

## Admin Panel

Visit `/admin` on your deployed site. Enter your `ADMIN_KEY` to:

- ➕ Add new products with name, price, category, modelo, capacity, color, stock
- 🖼️ **Upload photos** — drag or click "Subir foto" → uploads to Vercel Blob automatically
- ✏️ Edit any product
- 🏷️ Set discounts (% + label) with live price preview
- 🗑️ Delete products

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
| `chillzone-token` | Required | JWT auth session (httpOnly) |
| `chillzone-cart` | Required | Cart persistence (localStorage) |
| `chillzone-cookie-consent` | Required | Stores consent choice |
| `chillzone-theme` | Functional | Dark/light mode preference |

---

## Local development

```bash
# 1. Fill in .env with real Supabase credentials
cp .env.example .env

# 2. Install + generate Prisma client
npm install

# 3. Run migrations + seed
npm run db:setup

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
| `/reset-password?token=...` | Set new password |
| `/cuenta` | Profile management |
| `/contacto` | Contact page |
| `/admin` | **Admin panel** — manage products + upload photos |
| `/cookies` | Cookie policy + consent settings |
| `/privacidad` | Privacy policy |

---

## Before going live checklist

- [ ] Replace `5491100000000` with your real number in `app/cart/page.tsx` and `app/contacto/page.tsx`
- [ ] Set a strong `JWT_SECRET` (32+ random chars)
- [ ] Set a strong `ADMIN_KEY`  
- [ ] Update Instagram handle in `app/contacto/page.tsx`
- [ ] Update company name/email in `app/privacidad/page.tsx` and `app/cookies/page.tsx`
- [ ] Seed products via `npm run db:seed`
- [ ] Add product photos via `/admin` panel
