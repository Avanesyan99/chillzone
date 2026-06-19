'use client';

import { MessageCircle, Instagram, Mail, MapPin, Clock, Send, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ContactoPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  function handleWA(e: React.FormEvent) {
    e.preventDefault();
    const text = `Hola CHILLZONE! \n\nSoy ${form.name}\nEmail ${form.email}\n\n${form.message}`;
    window.open(`https://wa.me/5491122544953?text=${encodeURIComponent(text)}`, '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: 64, background: 'var(--bg)' }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 36, transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--ember)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
          <ChevronLeft size={14}/> Catálogo
        </Link>

        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(44px,8vw,80px)', letterSpacing: '0.06em', color: 'var(--text)', lineHeight: 1 }}>CONTACTO</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, maxWidth: 460 }}>
            ¿Tenés alguna pregunta sobre un producto, querés hacer un pedido mayorista o simplemente saludar? Escribinos — respondemos rápido.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ContactCard icon={<MessageCircle size={20} color="#25D366"/>} title="WhatsApp" subtitle="Respondemos en minutos" action="Escribinos" href="https://wa.me/5491122544953" accent="#25D366"/>
            <ContactCard icon={<Instagram size={20} color="#E1306C"/>} title="Instagram" subtitle="@chillzonestore_" action="Ver perfil" href="https://instagram.com/chillzonestore_" accent="#E1306C"/>
            <ContactCard icon={<Mail size={20} color="var(--ember)"/>} title="Email" subtitle="chillzonestore1@gmail.com" action="Enviar mail" href="mailto:chillzonestore1@gmail.com" accent="var(--ember)"/>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <InfoLine icon={<MapPin size={14}/>} text="Capital Federal, Argentina"/>
              <InfoLine icon={<Clock size={14}/>} text="Lun – Vie · 10:00 – 19:00 hs"/>
              <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  Hacemos envíos a todo el país vía Andreani y OCA. Consultanos por costos y tiempos según tu zona.
                </p>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 28 }}>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: '0.06em', color: 'var(--text)', marginBottom: 6 }}>MANDANOS UN MENSAJE</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>Se abrirá WhatsApp con tu mensaje listo para enviar.</p>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: 'var(--text)', letterSpacing: '0.08em' }}>¡MENSAJE ENVIADO!</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Revisá WhatsApp para completar el envío.</p>
              </div>
            ) : (
              <form onSubmit={handleWA} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Tu nombre</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Juan Pérez" required style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Tu email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="tu@email.com" style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Mensaje</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Hola, quería consultar sobre..." required rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}/>
                </div>
                <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#25D366', color: '#fff', padding: '12px', borderRadius: 6, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1faf58')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#25D366')}>
                  <Send size={15}/> Enviar por WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:700px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

function ContactCard({ icon, title, subtitle, action, href, accent }: { icon: React.ReactNode; title: string; subtitle: string; action: string; href: string; accent: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px', transition: 'border-color 0.2s, transform 0.18s', textDecoration: 'none' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{subtitle}</div>
        </div>
      </div>
      <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent, fontWeight: 600, padding: '5px 10px', border: `1px solid ${accent}33`, borderRadius: 4 }}>{action}</span>
    </a>
  );
}

function InfoLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ color: 'var(--ember)' }}>{icon}</span>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{text}</span>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', fontSize: 13, background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 5, outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' };
