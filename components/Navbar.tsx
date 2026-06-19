'use client';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { ShoppingBag, Menu, X, Sun, Moon, User, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setUserMenuOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', transition: 'background 0.3s' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg version="1.0" xmlns="http://www.w3.org/2000/svg" className="logo-svg" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet"> 
            <g transform="translate(-75,225) scale(0.100000,-0.100000)" fill="var(--text)" stroke="none"> <path d="M1670 2148 c-24 -35 -58 -78 -76 -96 -18 -19 -38 -47 -44 -63 -7 -16 -15 -29 -19 -29 -4 0 -25 18 -46 40 -21 22 -45 40 -52 40 -7 0 -45 -43 -83 -95 -55 -74 -80 -98 -114 -114 -33 -14 -55 -35 -87 -82 -24 -35 -65 -88 -93 -117 l-50 -53 -16 42 -17 41 -18 -58 c-11 -33 -18 -63 -17 -68 2 -4 -2 -14 -8 -21 -6 -7 -8 -19 -4 -28 3 -8 1 -18 -5 -21 -6 -4 -8 -13 -4 -21 3 -9 0 -22 -7 -29 -9 -12 -5 -15 22 -18 l33 -4 -30 -13 c-51 -23 -9 -24 77 -2 45 12 101 21 125 21 61 0 172 -27 256 -61 39 -16 89 -32 111 -34 45 -6 44 -5 -68 38 -67 25 -76 31 -60 40 10 6 61 11 114 11 52 0 82 2 66 5 -31 6 -41 19 -52 66 l-7 30 -12 -39 c-12 -42 -35 -61 -35 -29 0 10 -5 36 -11 58 -10 34 -13 37 -20 20 -4 -11 -10 -37 -14 -57 -5 -30 -11 -39 -30 -43 -14 -3 -36 -7 -48 -10 -28 -5 -59 15 -63 41 -15 102 -28 114 -44 38 -14 -67 -22 -65 -34 11 -2 11 -4 20 -6 20 -1 0 -3 9 -4 20 -6 45 -18 85 -26 85 -8 0 -32 -85 -35 -124 -3 -41 -22 -25 -34 29 -15 66 -27 77 -36 33 -10 -46 -15 -52 -30 -32 -17 24 -9 41 34 78 19 17 61 67 94 111 59 79 76 96 110 108 16 6 15 0 -8 -39 -48 -82 -10 -38 68 78 111 165 117 171 117 118 0 -20 -11 -42 -34 -67 -18 -21 -41 -56 -50 -77 -9 -21 -34 -58 -56 -82 -52 -56 -52 -68 0 -18 22 22 50 59 61 84 12 25 37 62 55 83 25 27 34 46 34 72 0 19 4 35 8 35 4 0 23 -15 40 -33 l32 -33 -36 -70 c-20 -38 -58 -91 -84 -119 -76 -80 -78 -103 -2 -28 54 53 82 92 127 178 32 61 73 127 91 147 18 20 45 55 60 78 15 22 30 40 34 40 4 0 10 -32 14 -70 5 -60 2 -82 -20 -151 l-26 -81 -22 21 c-31 29 -40 27 -70 -19 -15 -23 -38 -51 -52 -63 -15 -12 -41 -52 -59 -88 -23 -44 -53 -84 -92 -119 -62 -56 -55 -56 21 0 35 25 57 53 81 100 18 36 45 76 59 89 l26 24 0 -22 c0 -12 -5 -32 -12 -44 -15 -29 -58 -151 -54 -155 2 -1 9 11 16 28 15 37 20 37 61 3 l34 -28 -25 34 c-14 18 -29 39 -34 46 -6 8 -2 30 12 63 12 28 22 60 22 72 0 11 7 35 16 52 l17 32 36 -41 c20 -22 51 -58 69 -79 30 -35 29 -33 -7 23 l-41 61 20 44 c11 24 20 36 20 27 0 -9 13 -35 30 -57 16 -23 36 -56 45 -74 10 -23 13 -26 9 -8 -3 14 -12 36 -20 50 -53 97 -57 113 -45 158 8 31 8 54 0 86 -6 24 -9 54 -7 67 3 22 7 19 33 -25 17 -27 47 -66 68 -88 21 -21 50 -64 63 -96 59 -135 68 -153 82 -164 8 -7 5 5 -7 29 -12 22 -26 54 -31 72 l-9 31 35 -26 c19 -15 53 -50 75 -78 22 -28 59 -66 81 -84 23 -17 52 -47 65 -64 13 -18 30 -36 38 -41 17 -9 14 2 -34 107 -17 38 -31 78 -31 89 0 20 1 19 26 -4 26 -23 26 -23 15 -2 -6 13 -25 33 -41 45 -23 17 -30 30 -30 57 l0 35 51 -67 c28 -36 60 -69 70 -72 10 -3 41 -37 69 -75 28 -38 80 -92 116 -121 35 -29 64 -55 64 -59 0 -8 -22 -30 -31 -30 -4 0 -10 16 -14 36 -8 44 -19 36 -37 -29 -14 -48 -31 -63 -35 -30 -3 29 -13 76 -22 108 l-8 30 -11 -26 c-12 -29 -24 -85 -23 -111 0 -9 -7 -22 -15 -28 -15 -13 -17 -11 -28 43 -9 39 -20 27 -36 -38 l-13 -56 -46 7 c-85 13 -95 18 -102 53 -9 44 -17 49 -24 15 -4 -16 -9 -35 -11 -42 -7 -23 -21 -4 -28 39 -8 48 -17 44 -31 -13 -6 -23 -17 -44 -25 -49 -8 -4 -26 -12 -40 -18 l-25 -12 25 6 c58 12 161 17 206 10 l49 -7 -40 -19 c-22 -11 -76 -33 -120 -49 -56 -20 -72 -29 -52 -29 16 -1 81 20 145 46 104 41 128 47 212 50 66 4 116 0 163 -11 38 -9 78 -16 90 -16 20 1 19 3 -8 18 l-30 17 33 3 c26 3 31 6 22 17 -6 7 -10 17 -8 21 1 5 -3 19 -10 32 -9 16 -10 22 -1 22 8 0 8 4 1 13 -5 6 -13 32 -17 57 -4 25 -12 56 -17 70 -10 25 -10 25 -23 -13 -7 -21 -16 -41 -18 -44 -11 -10 -100 74 -154 145 -30 40 -66 78 -79 85 -14 6 -44 38 -68 71 -74 104 -72 103 -136 46 -30 -27 -58 -49 -62 -50 -15 -1 -70 55 -103 103 -18 29 -43 58 -54 64 -11 7 -30 32 -42 55 -25 49 -68 108 -79 108 -4 0 -27 -28 -50 -62z m464 -328 c10 -30 29 -79 42 -109 l25 -54 -68 69 c-38 38 -78 83 -91 100 l-22 32 43 48 42 48 6 -40 c3 -21 14 -64 23 -94z m356 -324 c0 -3 -5 -8 -12 -12 -7 -4 -8 -3 -4 4 7 12 16 16 16 8z"/> <path d="M1786 2013 c6 -4 19 -23 28 -41 10 -19 20 -31 23 -28 8 8 -30 69 -47 73 -10 3 -11 2 -4 -4z"/> <path d="M1634 1988 c-23 -26 -47 -78 -40 -86 3 -2 11 8 18 24 6 16 23 41 37 57 13 15 20 27 15 27 -6 0 -19 -10 -30 -22z"/> <path d="M1928 1674 c-75 -66 -77 -68 -38 -49 19 10 53 34 74 53 45 40 30 49 119 -67 27 -35 51 -61 53 -58 3 3 -22 41 -56 86 -39 52 -68 81 -80 81 -11 0 -43 -21 -72 -46z"/> <path d="M2259 1702 c5 -10 18 -25 28 -33 12 -10 11 -5 -6 19 -24 35 -38 43 -22 14z"/> <path d="M1737 1624 c-4 -4 -7 -25 -7 -46 0 -21 -4 -38 -10 -38 -5 0 -10 6 -11 13 0 6 -9 -12 -19 -41 -19 -54 -18 -74 7 -104 13 -14 11 -16 -19 -15 -29 2 -33 -1 -34 -23 0 -14 -4 -33 -8 -43 -5 -10 -3 -23 4 -32 10 -12 18 -11 60 5 45 18 52 18 84 5 53 -22 76 -20 76 8 0 13 -3 27 -7 31 -4 4 -8 17 -8 29 0 24 -15 26 -87 12 -38 -8 -38 -8 -38 26 0 19 5 41 10 49 8 13 10 13 10 -1 0 -9 9 -27 21 -40 l21 -24 19 24 c10 13 19 33 18 45 -1 31 -22 86 -33 85 -6 0 -17 18 -26 41 -9 22 -19 38 -23 34z m33 -113 c0 -33 1 -34 15 -15 13 18 14 16 15 -23 0 -24 -4 -43 -10 -43 -5 0 -10 5 -10 10 0 6 -7 10 -15 10 -10 0 -15 10 -15 26 0 22 -2 25 -15 14 -8 -7 -19 -27 -24 -44 -7 -25 -10 -28 -16 -13 -10 23 4 95 15 77 11 -17 30 18 30 57 l1 28 14 -25 c8 -14 14 -40 15 -59z m-70 -135 c24 -10 28 -15 16 -19 -9 -4 -16 -2 -16 4 0 6 -5 7 -10 4 -15 -9 -43 3 -35 15 8 13 6 13 45 -4z m107 -3 c-4 -3 -10 -3 -14 0 -3 4 0 7 7 7 7 0 10 -3 7 -7z m33 3 c0 -3 -4 -8 -10 -11 -5 -3 -10 -1 -10 4 0 6 5 11 10 11 6 0 10 -2 10 -4z m-83 -23 c-4 -3 -10 -3 -14 0 -3 4 0 7 7 7 7 0 10 -3 7 -7z m49 -17 c10 -8 16 -18 11 -22 -4 -4 -7 -2 -7 4 0 6 -7 9 -17 5 -10 -4 -14 -2 -10 4 4 6 1 14 -5 16 -7 3 -8 6 -2 6 5 1 19 -5 30 -13z m-119 -3 c-4 -3 -10 -3 -14 0 -3 4 0 7 7 7 7 0 10 -3 7 -7z m0 -20 c-4 -3 -10 -3 -14 0 -3 4 0 7 7 7 7 0 10 -3 7 -7z"/> <path d="M2155 1540 c3 -5 8 -10 11 -10 3 0 2 5 -1 10 -3 6 -8 10 -11 10 -3 0 -2 -4 1 -10z"/> <path d="M1235 1346 c44 -13 82 -23 84 -21 7 8 -76 36 -119 41 -37 4 -31 0 35 -20z"/> <path d="M2253 1355 c-18 -8 -33 -16 -33 -19 0 -5 112 23 119 30 11 10 -57 2 -86 -11z"/> </g> </svg>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: '0.12em', color: 'var(--text)' }} >CHILLZONE</span>
          </Link>

          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {[['/', 'Catálogo'], ['/contacto', 'Contacto']].map(([href, label]) => (
              <Link key={href} href={href} style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>{label}</Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button onClick={toggle} style={{ padding: 9, color: 'var(--text-muted)', borderRadius: 6, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--ember)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
              {theme === 'dark' ? <Sun size={17} strokeWidth={1.5}/> : <Moon size={17} strokeWidth={1.5}/>}
            </button>

            <Link href="/cart" style={{ position: 'relative', padding: 9, color: 'var(--text-muted)', borderRadius: 6, display: 'flex', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--ember)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
              <ShoppingBag size={17} strokeWidth={1.5}/>
              {totalItems > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 4, background: 'var(--ember)', color: '#fff', width: 16, height: 16, borderRadius: '50%', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{totalItems}</span>
              )}
            </Link>

            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center' }}>
              {user ? (
                <div ref={ref} style={{ position: 'relative' }}>
                  <button onClick={() => setUserMenuOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 6, background: userMenuOpen ? 'var(--bg-card)' : 'transparent', border: `1px solid ${userMenuOpen ? 'var(--border-active)' : 'transparent'}`, color: 'var(--text)', fontSize: 12, fontWeight: 500, transition: 'all 0.2s' }}>
                    <User size={14} strokeWidth={1.5}/><span className="desktop-nav" style={{ display: 'block' }}>{user.name.split(' ')[0]}</span>
                    <ChevronDown size={12} style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}/>
                  </button>
                  {userMenuOpen && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 175, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                      <div style={{ padding: '11px 15px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{user.email}</div>
                      </div>
                      {[{ href: '/cuenta', label: 'Mi cuenta', icon: <User size={13}/> }].map(item => (
                        <Link key={item.href} href={item.href} onClick={() => setUserMenuOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 15px', fontSize: 13, color: 'var(--text)', transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          {item.icon} {item.label}
                        </Link>
                      ))}
                      <button onClick={() => { logout(); setUserMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 15px', width: '100%', textAlign: 'left', fontSize: 13, color: 'var(--ember)', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <LogOut size={13}/> Salir de cuenta
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ember)'; e.currentTarget.style.color = 'var(--ember)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                  <User size={13}/> Ingresar
                </Link>
              )}
            </div>

            <button onClick={() => setMenuOpen(o => !o)} className="mobile-only" style={{ padding: 8, color: 'var(--text-muted)', display: 'none' }}>
              {menuOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '14px 24px 18px', background: 'var(--nav-bg)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[['/', 'Catálogo'], ['/contacto', 'Contacto']].map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</Link>
            ))}
            {user ? (
              <>
                <Link href="/cuenta" onClick={() => setMenuOpen(false)} style={{ fontSize: 13, color: 'var(--text-muted)' }}>Mi cuenta</Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} style={{ textAlign: 'left', fontSize: 13, color: 'var(--ember)' }}>Salir</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ fontSize: 13, color: 'var(--text-muted)' }}>Ingresar / Crear cuenta</Link>
            )}
          </div>
        )}
      </nav>
      <style>{`@media(max-width:640px){.desktop-nav{display:none!important}.desktop-only{display:none!important}.mobile-only{display:flex!important}}`}</style>
    </>
  );
}
