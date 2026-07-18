import { db } from '@/lib/firebase-admin';

export interface Product {
  id: string; // Firestore doc id == slug
  slug: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  modelo: string | null;
  capacity: string | null;
  color: string | null;
  image_url: string | null;
  stock: number;
  discountPct: number;
  discountLabel: string | null;
  createdAt: string;
}

const PRODUCTS = 'products';

function toProduct(doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot): Product {
  const data = doc.data()!;
  return {
    id: doc.id,
    slug: doc.id,
    name: data.name,
    description: data.description ?? null,
    price: data.price,
    category: data.category,
    modelo: data.modelo ?? null,
    capacity: data.capacity ?? null,
    color: data.color ?? null,
    image_url: data.image_url ?? null,
    stock: data.stock ?? 0,
    discountPct: data.discountPct ?? 0,
    discountLabel: data.discountLabel ?? null,
    createdAt: (data.createdAt?.toDate?.() ?? new Date()).toISOString(),
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const snap = await db.collection(PRODUCTS).get();
  return snap.docs.map(toProduct).sort((a, b) =>
    a.category.localeCompare(b.category) || a.price - b.price
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const doc = await db.collection(PRODUCTS).doc(slug).get();
  return doc.exists ? toProduct(doc) : null;
}

export async function getCategories(): Promise<string[]> {
  const snap = await db.collection(PRODUCTS).select('category').get();
  const categories = new Set(snap.docs.map(d => d.data().category as string));
  return [...categories].sort();
}

export async function getModelos(): Promise<string[]> {
  const snap = await db.collection(PRODUCTS).select('modelo').get();
  const modelos = new Set(
    snap.docs.map(d => d.data().modelo as string | undefined).filter((m): m is string => !!m)
  );
  return [...modelos].sort();
}
