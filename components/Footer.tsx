'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 0', textAlign: 'center' }}>
      <div className="container">
        <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: '0.12em', color: 'var(--text)', marginBottom: 5 }}>CHILLZONE</p>
        <p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>OUTDOOR & LIFESTYLE GEAR · STAY REFRESHED. GO ANYWHERE.</p>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12 }}>
          <Link key="/privacidad" href="/privacidad" style={{ fontSize: 11, color: 'var(--text-dim)', textDecoration: 'underline', letterSpacing: '0.06em' }}>Privacidad</Link>
          <Link key="/cookies" href="/cookies" style={{ fontSize: 11, color: 'var(--text-dim)', textDecoration: 'underline', letterSpacing: '0.06em' }}>Cookies</Link>
          <Link key="/contacto" href="/contacto" style={{ fontSize: 11, color: 'var(--text-dim)', textDecoration: 'underline', letterSpacing: '0.06em' }}>Contacto</Link>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 12 }}>
          <span>© 2026 CHILLZONE</span>
          <span style={{ margin: '0 6px' }}>·</span>
          <span>Desarrollado por <a href="https://ar.linkedin.com/in/david-avanesyan-a80249343" style={{ color: 'var(--text-dim)', textDecoration: 'underline' }}>David Avanesyan</a></span>
        </div>
      </div>
    </footer>
  );
}
