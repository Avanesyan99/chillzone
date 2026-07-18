import { getProductBySlug, getAllProducts } from '@/lib/products';
import { finalPrice, hasDiscount } from '@/lib/discount';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Tag } from 'lucide-react';

export async function generateStaticParams() {
  return (await getAllProducts()).map(p => ({ slug: p.slug }));
}

const EMOJI: Record<string, string> = { vasos: '🥤', termos: '♨️', mates: '🧉', accesorios: '🔩' };
const COLORS: Record<string, string> = {
  'Safe Grey': '#8a9587', 'Black': '#2a2a2a', 'Peony': '#e8738a',
  'Verde': '#4a7c59', 'Negro': '#2a2a2a', 'Blanco': '#c8c4bc',
  'Beige/Marrón': '#a07850', 'Verde/Plateado': '#6a8f72',
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string | string[] | undefined }> }) {
  const resolvedParams = await params;
  const slug = Array.isArray(resolvedParams.slug) ? resolvedParams.slug[0] : resolvedParams.slug;
  const product = await getProductBySlug(slug || '');
  if (!product) notFound();

  const bg = COLORS[product.color || ''] || '#2a2a2a';
  const isLow = product.stock > 0 && product.stock <= 3;
  const discounted = hasDiscount(product.discountPct);
  const sale = finalPrice(product.price, product.discountPct);

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 36 }}>
          <ChevronLeft size={14}/> Catálogo
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 48, alignItems: 'start' }}>
          {/* Image */}
          <div style={{ aspectRatio: '1/1', position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', background: product.image_url ? 'var(--bg-2)' : `linear-gradient(145deg,${bg}20,${bg}50)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill style={{ objectFit: 'cover' }}/>
            ) : (
              <span style={{ fontSize: 100, filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))' }}>{EMOJI[product.category] || '📦'}</span>
            )}
            {discounted && product.discountLabel && (
              <div style={{ position: 'absolute', top: 14, left: 14, background: 'var(--ember)', color: '#fff', borderRadius: 4, padding: '5px 12px', fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', zIndex: 2 }}>
                {product.discountLabel}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ember)', marginBottom: 6, fontWeight: 500 }}>
              {product.modelo || product.category}{product.capacity ? ` · ${product.capacity}` : ''}{product.color ? ` · ${product.color}` : ''}
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(32px,4vw,50px)', letterSpacing: '0.04em', color: 'var(--text)', lineHeight: 1.1, marginBottom: 14 }}>
              {product.name}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 22 }}>
              {product.description}
            </p>

            {/* Price */}
            <div style={{ marginBottom: 10 }}>
              {discounted && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 16, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    ${product.price.toLocaleString('es-AR')}
                  </span>
                  <span style={{ background: 'rgb(24 69 128 / 15%)', color: 'var(--ember)', border: '1px solid rgb(24 69 128 / 15%)', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Tag size={11}/> {product.discountPct}% OFF
                  </span>
                </div>
              )}
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, letterSpacing: '0.04em', color: discounted ? 'var(--ember)' : 'var(--text)' }}>
                ${sale.toLocaleString('es-AR')}
              </div>
              {discounted && (
                <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 2 }}>
                  Ahorrás ${(product.price - sale).toLocaleString('es-AR')}
                </div>
              )}
            </div>

            <div style={{ fontSize: 12, color: isLow ? 'var(--ember)' : 'var(--success)', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: isLow ? 'var(--ember)' : 'var(--success)' }}/>
              {product.stock === 0 ? 'Sin stock' : isLow ? `Solo ${product.stock} en stock` : `En stock (${product.stock} unidades)`}
            </div>

            <AddToCartButton product={product}/>

            <div style={{ marginTop: 32, padding: 18, border: '1px solid var(--border)', borderRadius: 8 }}>
              <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: '0.08em', color: 'var(--text)', marginBottom: 12 }}>CARACTERÍSTICAS</h3>
              {([
                ['Modelo', product.modelo || '—'],
                ['Categoría', product.category.charAt(0).toUpperCase() + product.category.slice(1)],
                ...(product.capacity ? [['Capacidad', product.capacity]] : []),
                ...(product.color ? [['Color', product.color]] : []),
              ] as [string,string][]).map(([k,v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:640px){div[style*="grid-template-columns: 1fr 1.2fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
