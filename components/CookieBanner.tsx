'use client';

import { useState } from 'react';
import { useConsent } from '@/lib/consent-context';
import { Cookie, ChevronDown, ChevronUp, X, Shield } from 'lucide-react';

export default function CookieBanner() {
  const { consent, acceptAll, acceptRequired, reject } = useConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [visible, setVisible] = useState(true);

  // Don't show if user already decided, or banner was manually closed this session
  if (consent.decided || !visible) return null;

  return (
    <>
      {/* Backdrop blur on mobile */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(2px)',
        pointerEvents: 'none',
      }} aria-hidden />

      <div role="dialog" aria-label="Política de cookies" aria-modal="true" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9001,
        background: 'var(--bg-2)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
        padding: '20px 0',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <div className="container" style={{ maxWidth: 820 }}>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
            <div style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 8,
              background: 'rgba(24, 69, 128, 0.15)', border: '1px solid rgba(26, 78, 146, 0.30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cookie size={18} color="var(--ember)"/>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18,
                letterSpacing: '0.06em', color: 'var(--text)', marginBottom: 4 }}>
                USAMOS COOKIES
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 600 }}>
                Usamos cookies necesarias para que el carrito y la sesión funcionen.
                Podés aceptar todas, solo las necesarias, o conocer más detalles antes de decidir.
              </p>
            </div>
            {/* Close without deciding = same as "required only" after 30 days or on next visit */}
            <button
              onClick={() => setVisible(false)}
              aria-label="Cerrar banner (decidir más tarde)"
              style={{ flexShrink: 0, padding: 6, color: 'var(--text-dim)',
                borderRadius: 4, transition: 'color 0.18s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
            >
              <X size={16}/>
            </button>
          </div>

          {/* Expandable details */}
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => setShowDetails(d => !d)}
              style={{ display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 11, color: 'var(--ember)', letterSpacing: '0.06em',
                textTransform: 'uppercase', textDecoration: 'underline', marginBottom: showDetails ? 12 : 0 }}
            >
              {showDetails ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
              {showDetails ? 'Ocultar detalle' : 'Ver detalle de cookies'}
            </button>

            {showDetails && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                <CookieRow
                  icon={<Shield size={14}/>}
                  name="Cookies necesarias"
                  description="Sesión de usuario (chillzone-token) y carrito de compras (chillzone-cart). Sin estas cookies el sitio no funciona correctamente. No se pueden desactivar."
                  required
                  active
                />
                <CookieRow
                  icon={<Cookie size={14}/>}
                  name="Cookies analíticas"
                  description="Métricas de uso y preferencias (tema claro/oscuro, idioma). Opcionales — mejoran tu experiencia pero no son estrictamente necesarias."
                  required={false}
                  active={false}
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={acceptAll}
              style={{
                flex: '1 1 160px', padding: '10px 20px', borderRadius: 5,
                background: 'var(--ember)', color: '#fff',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                transition: 'opacity 0.18s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Aceptar todas
            </button>
            <button
              onClick={acceptRequired}
              style={{
                flex: '1 1 160px', padding: '10px 20px', borderRadius: 5,
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
                transition: 'border-color 0.18s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--ember)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              Solo necesarias
            </button>
            <button
              onClick={reject}
              style={{
                flex: '0 1 auto', padding: '10px 16px', borderRadius: 5,
                background: 'transparent', color: 'var(--text-dim)',
                fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                textDecoration: 'underline',
              }}
            >
              Rechazar opcionales
            </button>
          </div>

          {/* Legal note */}
          <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 12, lineHeight: 1.6 }}>
            Al usar este sitio aceptás nuestra{' '}
            <a href="/privacidad" style={{ color: 'var(--ember)', textDecoration: 'underline' }}>
              Política de Privacidad
            </a>
            {' '}y{' '}
            <a href="/cookies" style={{ color: 'var(--ember)', textDecoration: 'underline' }}>
              Política de Cookies
            </a>
            . Las cookies necesarias son utilizadas para el funcionamiento del carrito de compras y la sesión de usuario conforme al Art. 6(1)(b) del RGPD.
          </p>
        </div>
      </div>
    </>
  );
}

function CookieRow({ icon, name, description, required, active }: {
  icon: React.ReactNode; name: string; description: string; required: boolean; active: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 14px',
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6 }}>
      <div style={{ flexShrink: 0, marginTop: 2, color: 'var(--ember)' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{name}</span>
          {required && (
            <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
              background: 'rgba(24, 69, 128, 0.15)', color: 'var(--ember)',
              border: '1px solid rgba(24, 69, 128, 0.30)', borderRadius: 3, padding: '2px 6px' }}>
              Obligatoria
            </span>
          )}
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>{description}</p>
      </div>
      {/* Toggle indicator */}
      <div style={{ flexShrink: 0, alignSelf: 'center' }}>
        <div style={{
          width: 36, height: 20, borderRadius: 10,
          background: (active || required) ? 'var(--ember)' : 'var(--border)',
          position: 'relative', transition: 'background 0.2s',
          opacity: required ? 0.6 : 1,
        }}>
          <div style={{
            position: 'absolute', top: 3, left: (active || required) ? 19 : 3,
            width: 14, height: 14, borderRadius: '50%', background: '#fff',
            transition: 'left 0.2s',
          }}/>
        </div>
      </div>
    </div>
  );
}
