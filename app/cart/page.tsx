'use client';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { finalPrice } from '@/lib/discount';
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const EMOJI: Record<string,string> = {vasos:'🥤',termos:'♨️',mates:'🧉',accesorios:'🔩'};

function buildWA(items: ReturnType<typeof useCart>['items'], user: {name:string;phone?:string|null}|null) {
  const lines = items.map(i => {
    const sale = finalPrice(i.product.price, i.product.discountPct);
    const disc = i.product.discountPct > 0 ? ` (-${i.product.discountPct}%)` : '';
    return `• ${i.product.name} ×${i.quantity}${disc} — $${(sale * i.quantity).toLocaleString('es-AR')}`;
  });
  const total = items.reduce((s,i) => s + finalPrice(i.product.price, i.product.discountPct) * i.quantity, 0);
  const greet = user ? `Hola! Soy ${user.name} ${user.phone ? ` (${user.phone})` : ''}.` : 'Hola CHILLZONE!';
  const msg = [`${greet} Quiero hacer un pedido:`,'', ...lines,'', `*Total: $${total.toLocaleString('es-AR')}*`,'','Por favor confirmá disponibilidad. ¡Gracias!'].join('\n');
  return `https://wa.me/+5491122544953?text=${encodeURIComponent(msg)}`;
}

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, totalItems, totalPrice } = useCart();
  const { user, loading } = useAuth();

  if (items.length === 0) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',paddingTop:64,background:'var(--bg)'}}>
      <div style={{textAlign:'center',maxWidth:340}}>
        <ShoppingBag size={48} strokeWidth={1} style={{margin:'0 auto 16px',color:'var(--text-dim)'}}/>
        <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:30,letterSpacing:'0.06em',color:'var(--text)',marginBottom:10}}>Tu carrito está vacío</h2>
        <p style={{color:'var(--text-muted)',fontSize:13,marginBottom:24}}>Agregá productos del catálogo para continuar.</p>
        <Link href="/" style={{display:'inline-flex',alignItems:'center',gap:8,background:'var(--ember)',color:'#fff',padding:'10px 22px',borderRadius:5,fontSize:12,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase'}}>
          <ArrowLeft size={13}/> Ver catálogo
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',paddingTop:64,background:'var(--bg)'}}>
      <div className="container" style={{paddingTop:36,paddingBottom:80}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:32,paddingBottom:16,borderBottom:'1px solid var(--border)'}}>
          <div>
            <Link href="/" style={{display:'inline-flex',alignItems:'center',gap:5,color:'var(--text-muted)',fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:6}}><ArrowLeft size={12}/> Catálogo</Link>
            <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(30px,5vw,44px)',letterSpacing:'0.06em',color:'var(--text)'}}>
              Carrito <span style={{color:'var(--text-dim)',fontSize:'0.55em'}}>({totalItems} {totalItems===1?'item':'items'})</span>
            </h1>
          </div>
          <button onClick={clearCart} style={{display:'flex',alignItems:'center',gap:5,color:'var(--text-dim)',fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em',transition:'color 0.2s'}}
            onMouseEnter={e=>(e.currentTarget.style.color='var(--ember)')} onMouseLeave={e=>(e.currentTarget.style.color='var(--text-dim)')}>
            <Trash2 size={12}/> Vaciar
          </button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:24,alignItems:'start'}}>
          <div>
            {items.map(({product,quantity}) => {
              const sale = finalPrice(product.price, product.discountPct);
              const disc = product.discountPct > 0;
              return (
                <div key={product.slug} style={{display:'grid',gridTemplateColumns:'52px 1fr auto',gap:12,alignItems:'center',padding:'14px 0',borderBottom:'1px solid var(--border)'}}>
                  <div style={{width:52,height:52,borderRadius:6,background:'var(--bg-card)',border:'1px solid var(--border)',overflow:'hidden',position:'relative',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>
                    {product.image_url ? <Image src={product.image_url} alt={product.name} fill style={{objectFit:'cover'}}/> : EMOJI[product.category]||'📦'}
                  </div>
                  <div>
                    <div style={{fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--ember)',marginBottom:2}}>{product.category}{product.capacity?` · ${product.capacity}`:''}</div>
                    <Link href={`/product/${product.slug}`} style={{fontWeight:500,fontSize:13,color:'var(--text)'}}>{product.name}</Link>
                    {product.color && <div style={{fontSize:11,color:'var(--text-muted)',marginTop:1}}>{product.color}</div>}
                    <div style={{display:'flex',alignItems:'center',gap:7,marginTop:7}}>
                      <div style={{display:'flex',alignItems:'center',border:'1px solid var(--border)',borderRadius:4,overflow:'hidden'}}>
                        <button onClick={()=>updateQty(product.slug,quantity-1)} style={{padding:'4px 8px',color:'var(--text-muted)',background:'var(--bg-card)'}}><Minus size={10}/></button>
                        <span style={{padding:'4px 12px',fontSize:13,fontWeight:600,borderLeft:'1px solid var(--border)',borderRight:'1px solid var(--border)',color:'var(--text)'}}>{quantity}</span>
                        <button onClick={()=>updateQty(product.slug,quantity+1)} disabled={quantity>=product.stock} style={{padding:'4px 8px',color:'var(--text-muted)',background:'var(--bg-card)',opacity:quantity>=product.stock?0.4:1}}><Plus size={10}/></button>
                      </div>
                      <button onClick={()=>removeItem(product.slug)} style={{color:'var(--text-dim)',padding:3,transition:'color 0.18s'}} onMouseEnter={e=>(e.currentTarget.style.color='var(--ember)')} onMouseLeave={e=>(e.currentTarget.style.color='var(--text-dim)')}><Trash2 size={12}/></button>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    {disc && <div style={{fontSize:10,color:'var(--text-muted)',textDecoration:'line-through'}}>${(product.price*quantity).toLocaleString('es-AR')}</div>}
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:19,color:disc?'var(--ember)':'var(--text)'}}>${(sale*quantity).toLocaleString('es-AR')}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div style={{position:'sticky',top:80,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,padding:20}}>
            <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:19,letterSpacing:'0.06em',color:'var(--text)',marginBottom:14}}>Resumen</h3>
            <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:14}}>
              {items.map(({product,quantity})=>{
                const sale=finalPrice(product.price,product.discountPct);
                return <div key={product.slug} style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
                  <span style={{color:'var(--text-muted)',flex:1,marginRight:8,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{product.name} ×{quantity}</span>
                  <span style={{color:'var(--text)',fontWeight:500,whiteSpace:'nowrap'}}>${(sale*quantity).toLocaleString('es-AR')}</span>
                </div>;
              })}
            </div>
            <div style={{borderTop:'1px solid var(--border)',paddingTop:12,marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:11,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase'}}>Total</span>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:'var(--text)'}}>${totalPrice.toLocaleString('es-AR')}</span>
            </div>

            {!loading && !user ? (
              <div>
                <div style={{background:'rgba(196,87,26,0.08)',border:'1px solid rgba(196,87,26,0.22)',borderRadius:7,padding:'12px 14px',marginBottom:12,textAlign:'center'}}>
                  <User size={20} color="var(--ember)" style={{margin:'0 auto 7px'}}/>
                  <p style={{fontSize:12,color:'var(--text)',fontWeight:500,marginBottom:3}}>Iniciá sesión para pedir</p>
                  <p style={{fontSize:11,color:'var(--text-muted)',lineHeight:1.5}}>Necesitamos tus datos para el pedido por WhatsApp.</p>
                </div>
                <Link href="/login" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:7,background:'var(--ember)',color:'#fff',padding:'11px',borderRadius:6,fontSize:12,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase'}}>
                  <User size={13}/> Ingresar / Registrarse
                </Link>
              </div>
            ) : user ? (
              <div>
                <div style={{background:'rgba(45,74,62,0.15)',border:'1px solid rgba(45,74,62,0.3)',borderRadius:6,padding:'9px 12px',marginBottom:12,display:'flex',alignItems:'center',gap:9}}>
                  <User size={13} color="var(--success)"/>
                  <div><div style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{user.name}</div><div style={{fontSize:10,color:'var(--text-muted)'}}>{user.email}</div></div>
                </div>
                <a href={buildWA(items,user)} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:7,background:'#25D366',color:'#fff',padding:'12px',borderRadius:6,fontSize:12,fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',transition:'background 0.2s'}}
                  onMouseEnter={e=>(e.currentTarget.style.background='#1faf58')} onMouseLeave={e=>(e.currentTarget.style.background='#25D366')}>
                  <MessageCircle size={15}/> Pedir por WhatsApp
                </a>
                <p style={{fontSize:10,color:'var(--text-dim)',textAlign:'center',marginTop:8,lineHeight:1.5}}>Se abrirá WhatsApp con tu pedido listo.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 300px"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
