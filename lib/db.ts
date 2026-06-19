import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export type { Product, User } from '@prisma/client';

export async function getAllProducts() {
  return prisma.product.findMany({ orderBy: [{ category: 'asc' }, { price: 'asc' }] });
}
export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({ where: { slug } });
}
export async function getCategories(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    select: { category: true }, distinct: ['category'], orderBy: { category: 'asc' },
  });
  return rows.map(r => r.category);
}
export async function getModelos(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { modelo: { not: null } },
    select: { modelo: true }, distinct: ['modelo'], orderBy: { modelo: 'asc' },
  });
  return rows.map(r => r.modelo).filter(Boolean) as string[];
}
