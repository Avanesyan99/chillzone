/**
 * One-time migration: copy existing Supabase/Postgres data (products + users)
 * into Firestore + Firebase Auth. Run once, then this script and prisma/schema.prisma
 * can be deleted, and DATABASE_URL/DIRECT_URL removed.
 *
 * Requires both the legacy DATABASE_URL/DIRECT_URL and the new FIREBASE_* env vars
 * to be set at the same time.
 */
import { Client } from 'pg';
import { Timestamp } from 'firebase-admin/firestore';
import type { UserImportRecord } from 'firebase-admin/auth';
import { auth, db } from '../lib/firebase-admin';

interface LegacyProduct {
  slug: string; name: string; description: string | null; price: number; category: string;
  modelo: string | null; capacity: string | null; color: string | null; image_url: string | null;
  stock: number; discount_pct: number; discount_label: string | null; created_at: Date;
}

interface LegacyUser {
  id: number; name: string; email: string; phone: string | null; password: string | null;
  google_id: string | null; is_admin: boolean; created_at: Date;
}

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL/DIRECT_URL not set — nothing to migrate from.');

  const client = new Client({ connectionString });
  await client.connect();

  // ── Products ──────────────────────────────────────────────────────────────
  const { rows: products } = await client.query<LegacyProduct>('SELECT * FROM products');
  console.log(`Migrating ${products.length} products...`);
  for (const p of products) {
    await db.collection('products').doc(p.slug).set({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      modelo: p.modelo,
      capacity: p.capacity,
      color: p.color,
      image_url: p.image_url,
      stock: p.stock,
      discountPct: p.discount_pct,
      discountLabel: p.discount_label,
      createdAt: Timestamp.fromDate(new Date(p.created_at)),
    });
    console.log(`  ✓ ${p.slug}`);
  }

  // ── Users ─────────────────────────────────────────────────────────────────
  const { rows: users } = await client.query<LegacyUser>('SELECT * FROM users');
  console.log(`Migrating ${users.length} users...`);

  const importRecords: UserImportRecord[] = users.map(u => {
    const uid = `legacy_${u.id}`;
    const record: UserImportRecord = { uid, email: u.email, emailVerified: true };
    if (u.password) record.passwordHash = Buffer.from(u.password, 'utf8');
    if (u.google_id) record.providerData = [{ providerId: 'google.com', uid: u.google_id, email: u.email }];
    return record;
  });

  // importUsers caps at 1000 per call; this store's user base is well under that.
  const importResult = await auth.importUsers(importRecords, {
    hash: { algorithm: 'BCRYPT' },
  });
  if (importResult.failureCount > 0) {
    console.error('Some users failed to import:', importResult.errors);
  }
  console.log(`  ✓ Imported ${importResult.successCount}/${users.length} auth users`);

  for (const u of users) {
    const uid = `legacy_${u.id}`;
    await db.collection('users').doc(uid).set({
      name: u.name,
      email: u.email,
      phone: u.phone,
      isAdmin: u.is_admin,
      createdAt: Timestamp.fromDate(new Date(u.created_at)),
    });
  }
  console.log(`  ✓ Wrote ${users.length} Firestore user docs`);

  await client.end();
  console.log('✅ Migration complete. Verify the data in Firestore before deleting the Supabase project.');
}

main().catch(e => { console.error(e); process.exit(1); });
