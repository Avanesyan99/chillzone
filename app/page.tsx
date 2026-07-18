import { getAllProducts, getCategories } from '@/lib/products';
import HomeClient from '@/components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  try {
    const [products, categories] = await Promise.all([
      getAllProducts(), getCategories(),
    ]);

    return <HomeClient products={products} categories={categories} />;
  } catch (error) {
    console.error('HomePage data load error:', error);
    return (
      <main style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 16, marginBottom: 12, color: 'var(--ember)' }}>
          Error de conexión
        </div>
        <p style={{ maxWidth: 560, margin: '0 auto', color: 'var(--text-muted)' }}>
          No se pudo cargar el catálogo. Revisa que tu base de datos esté disponible y que la variable
          <code style={{ display: 'block', marginTop: 8 }}>DATABASE_URL</code>
          esté configurada correctamente en <strong>.env</strong>.
        </p>
      </main>
    );
  }
}
