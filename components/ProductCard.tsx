'use client';

import { useCart } from '@/lib/cart-context';
import type { Product } from '@/lib/db';
import { finalPrice, hasDiscount } from '@/lib/discount';
import { Plus, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const FALLBACK_BG: Record<string, string> = {
  'Safe Grey': '#8a9587', 'Black': '#2a2a2a', 'Peony': '#e8738a',
  'Verde': '#4a7c59', 'Negro': '#2a2a2a', 'Blanco': '#c8c4bc',
  'Beige/Marrón': '#a07850', 'Verde/Plateado': '#6a8f72',
};
const EMOJI: Record<string, string> = { vasos: '🥤', termos: '♨️', mates: '🧉', accesorios: '🔩' };

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const inCart = items.find(i => i.product.slug === product.slug);
  const isLow = product.stock > 0 && product.stock <= 3;
  const discounted = hasDiscount(product.discountPct);
  const sale = finalPrice(product.price, product.discountPct);
  const bg = FALLBACK_BG[product.color || ''] || '#2a2a2a';

  function handleAdd() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const showImage = product.image_url && !imgError;

  return (
    <div
      data-category={product.category}
      data-modelo={product.modelo || ''}
      data-discount={discounted ? 'true' : 'false'}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transition: 'transform 0.18s, border-color 0.18s, box-shadow 0.18s',
      }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-3px)'; el.style.borderColor = 'var(--border-active)'; el.style.boxShadow = 'var(--shadow)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'none'; el.style.borderColor = 'var(--border)'; el.style.boxShadow = 'none'; }}
    >
      {/* Image area */}
      <Link href={`/product/${product.slug}`}>
        <div style={{
          aspectRatio: '1/1', position: 'relative', overflow: 'hidden',
          background: showImage ? 'var(--bg-2)' : `linear-gradient(135deg,${bg}28,${bg}55)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {showImage ? (
            <Image
              src={product.image_url!}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              style={{ objectFit: 'cover', transition: 'transform 0.3s' }}
              onError={() => setImgError(true)}
            />
          ) : (
            <span style={{ fontSize: 64, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}>
              {EMOJI[product.category] || '📦'}
            </span>
          )}

          {/* Hover zoom overlay for images */}
          {showImage && (
            <div style={{ position: 'absolute', inset: 0, background: 'transparent', transition: 'background 0.2s' }}
              onMouseEnter={e => { const img = (e.currentTarget.previousSibling as HTMLElement); if (img) img.style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => { const img = (e.currentTarget.previousSibling as HTMLElement); if (img) img.style.transform = 'scale(1)'; }}
            />
          )}

          {/* Discount badge */}
          {discounted && product.discountLabel && (
            <div style={{
              position: 'absolute', top: 8, left: 8, zIndex: 2,
              background: 'var(--ember)', color: '#fff',
              borderRadius: 3, padding: '3px 8px',
              fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
              boxShadow: '0 2px 8px rgba(26, 100, 196, 0.4)',
            }}>
              {product.discountLabel}
            </div>
          )}

          {/* Low stock badge */}
          {isLow && !discounted && (
            <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 2, background: '#0e3c92',
              borderRadius: 3, padding: '2px 7px', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff' }}>
              Últimos
            </div>
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
              Sin stock
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Modelo + category */}
        <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--ember)', fontWeight: 500, lineHeight: 1.4 }}>
          {product.modelo || product.category}
          {product.capacity ? ` · ${product.capacity}` : ''}
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 style={{ fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
            lineHeight: 1.35, color: 'var(--text)', marginTop: 2 }}>
            {product.name}
          </h3>
        </Link>

        {/* Price row */}
        <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex',
          alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {discounted && (
              <span style={{
                fontFamily: "'DM Sans',sans-serif", fontSize: 11,
                color: 'var(--text-muted)', textDecoration: 'line-through',
                letterSpacing: '0.02em',
              }}>
                ${product.price.toLocaleString('es-AR')}
              </span>
            )}
            <span style={{
              fontFamily: "'Bebas Neue',sans-serif", fontSize: 22,
              letterSpacing: '0.04em',
              color: discounted ? 'var(--ember)' : 'var(--text)',
            }}>
              ${sale.toLocaleString('es-AR')}
            </span>
            {discounted && (
              <span style={{ fontSize: 10, color: 'var(--success)', fontWeight: 500 }}>
                Ahorrás ${(product.price - sale).toLocaleString('es-AR')}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            style={{
              flexShrink: 0,
              background: added ? 'rgba(45,74,62,0.3)' : 'rgb(24 69 128 / 15%)',
              border: `1px solid ${added ? 'var(--forest)' : 'var(--border-active)'}`,
              borderRadius: 4, padding: '7px 11px',
              display: 'flex', alignItems: 'center', gap: 5,
              color: added ? 'var(--success)' : 'var(--ember)',
              fontSize: 11, fontWeight: 500, letterSpacing: '0.05em',
              transition: 'all 0.18s', cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              opacity: product.stock === 0 ? 0.4 : 1,
            }}>
            {added ? <Check size={13}/> : <Plus size={13}/>}
            {added ? 'Agregado' : 'Agregar'}
          </button>
        </div>

        {inCart && (
          <div style={{ fontSize: 10, color: 'var(--success)', letterSpacing: '0.04em', marginTop: 2 }}>
            {inCart.quantity} en tu carrito
          </div>
        )}
      </div>
    </div>
  );
}
