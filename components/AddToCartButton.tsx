'use client';
import { useCart } from '@/lib/cart-context';
import type { Product } from '@/lib/db';
import { ShoppingBag, Plus, Minus, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem, items, updateQty } = useCart();
  const [added, setAdded] = useState(false);
  const cartItem = items.find(i => i.product.slug === product.slug);

  if (product.stock === 0) return (
    <div style={{ padding: '12px 20px', textAlign: 'center', border: '1px solid var(--border)', borderRadius: 5, color: 'var(--text-muted)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sin stock</div>
  );

  return cartItem ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-active)', borderRadius: 5, overflow: 'hidden' }}>
        <button onClick={() => updateQty(product.slug, cartItem.quantity - 1)} style={{ padding: '11px 14px', color: 'var(--ember)', background: 'rgba(24, 69, 128, 0.15)', borderRight: '1px solid var(--border)' }}><Minus size={13}/></button>
        <span style={{ padding: '11px 18px', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{cartItem.quantity}</span>
        <button onClick={() => updateQty(product.slug, cartItem.quantity + 1)} disabled={cartItem.quantity >= product.stock} style={{ padding: '11px 14px', color: 'var(--ember)', background: 'rgba(24, 69, 128, 0.15)', borderLeft: '1px solid var(--border)', opacity: cartItem.quantity >= product.stock ? 0.4 : 1 }}><Plus size={13}/></button>
      </div>
      <Link href="/cart" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'var(--ember)', color: '#fff', padding: '11px 20px', borderRadius: 5, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        <ShoppingBag size={14}/> Ver carrito
      </Link>
    </div>
  ) : (
    <button onClick={() => { addItem(product); setAdded(true); setTimeout(() => setAdded(false), 2000); }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: added ? 'var(--forest)' : 'var(--ember)', color: '#fff', padding: '13px 28px', borderRadius: 5, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'background 0.2s', width: '100%' }}>
      {added ? <Check size={14}/> : <ShoppingBag size={14}/>}
      {added ? '¡Agregado!' : 'Agregar al carrito'}
    </button>
  );
}
