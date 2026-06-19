'use client';

import { useConsent } from '@/lib/consent-context';
import { Cookie, ChevronLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function CookiesPage() {
  const { consent, resetConsent } = useConsent();

  return (
    <div style={{ minHeight: '100vh', paddingTop: 64, background: 'var(--bg)' }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 720 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
          color: 'var(--text-muted)', fontSize: 11, letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: 36 }}>
          <ChevronLeft size={14}/> Volver
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          <Cookie size={32} color="var(--ember)"/>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(36px,6vw,56px)',
            letterSpacing: '0.06em', color: 'var(--text)' }}>
            POLÍTICA DE COOKIES
          </h1>
        </div>

        <PolicySection title="¿Qué son las cookies?">
          Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo
          al visitarlos. Nos ayudan a recordar tus preferencias y a que el carrito y tu sesión
          funcionen correctamente entre visitas.
        </PolicySection>

        <PolicySection title="Cookies que utilizamos">
          <CookieTable rows={[
            { name: 'chillzone-token', type: 'Necesaria', duration: '7 días', purpose: 'Sesión de usuario autenticado. Almacena el JWT httpOnly para mantenerte logueado.' },
            { name: 'chillzone-cart', type: 'Necesaria', duration: 'Persistente (localStorage)', purpose: 'Carrito de compras. Guarda los productos seleccionados entre sesiones.' },
            { name: 'chillzone-cookie-consent', type: 'Necesaria', duration: 'Persistente (localStorage)', purpose: 'Guarda tu elección sobre el uso de cookies para no volver a mostrarte el banner.' },
            { name: 'chillzone-theme', type: 'Funcional', duration: 'Persistente (localStorage)', purpose: 'Preferencia de tema claro u oscuro.' },
          ]}/>
        </PolicySection>

        <PolicySection title="Base legal">
          Las cookies necesarias (sesión y carrito) son utilizadas en base al Art. 6(1)(b) del
          RGPD — ejecución de un contrato — ya que son estrictamente necesarias para prestar el
          servicio de venta online solicitado. Las cookies funcionales (tema) se procesan en base a
          tu consentimiento (Art. 6(1)(a)).
        </PolicySection>

        <PolicySection title="Cookies de terceros">
          Este sitio no instala cookies de terceros por defecto. Al hacer clic en "Pedir por
          WhatsApp", se abre la aplicación de WhatsApp (Meta) que puede establecer sus propias
          cookies sujetas a su propia política de privacidad.
        </PolicySection>

        <PolicySection title="Tus derechos">
          Tenés derecho a acceder, rectificar, suprimir y portar tus datos personales, así como
          a oponerte a su tratamiento. Para ejercerlos, escribinos a{' '}
          <a href="mailto:chillzonestore1@gmail.com" style={{ color: 'var(--ember)' }}>chillzonestore1@gmail.com</a>.
        </PolicySection>

        {/* Current consent status + reset */}
        <div style={{ marginTop: 40, padding: 20, background: 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: 8 }}>
          <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18,
            letterSpacing: '0.06em', color: 'var(--text)', marginBottom: 14 }}>
            TU CONFIGURACIÓN ACTUAL
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            {[
              { label: 'Cookies necesarias', value: true },
              { label: 'Cookies analíticas / funcionales', value: consent.analytics },
              { label: 'Decisión registrada', value: consent.decided },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontWeight: 600, color: value ? 'var(--success)' : 'var(--ember)' }}>
                  {value ? 'Activado' : 'Desactivado'}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={resetConsent}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px',
              borderRadius: 5, border: '1px solid var(--border)', color: 'var(--text-muted)',
              fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', transition: 'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--ember)'; e.currentTarget.style.color='var(--ember)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-muted)'; }}
          >
            <RotateCcw size={13}/> Restablecer mi elección de cookies
          </button>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 10, lineHeight: 1.5 }}>
            Al restablecer, el banner volverá a aparecer en tu próxima visita.
          </p>
        </div>

        <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 24, lineHeight: 1.6 }}>
          Última actualización: {new Date().getFullYear()}. CHILLZONE — Outdoor & Lifestyle Gear.
        </p>
      </div>
    </div>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid var(--border)' }}>
      <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: '0.06em',
        color: 'var(--text)', marginBottom: 10 }}>{title}</h2>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

function CookieTable({ rows }: { rows: { name: string; type: string; duration: string; purpose: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
      {rows.map(r => (
        <div key={r.name} style={{ padding: '12px 14px', background: 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <code style={{ fontSize: 12, fontWeight: 700, color: 'var(--ember)',
              background: 'rgb(24 69 128 / 15%)', padding: '1px 6px', borderRadius: 3 }}>
              {r.name}
            </code>
            <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--text-muted)', border: '1px solid var(--border)',
              padding: '1px 6px', borderRadius: 3 }}>
              {r.type}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-dim)' }}>Duración:</strong> {r.duration}<br/>
            <strong style={{ color: 'var(--text-dim)' }}>Propósito:</strong> {r.purpose}
          </div>
        </div>
      ))}
    </div>
  );
}
