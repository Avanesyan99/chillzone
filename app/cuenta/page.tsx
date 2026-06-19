'use client';

import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Mail, Phone, ShoppingBag, LogOut, Edit2, Check, X } from 'lucide-react';
import Link from 'next/link';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function CuentaPage() {
  const { user, loading, logout, refresh } = useAuth();
  const { totalItems, totalPrice } = useCart();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);
  useEffect(() => { if (user) setForm({ name: user.name, phone: user.phone || '' }); }, [user]);

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch('/api/auth/update', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone }),
      });
      if (res.ok) { await refresh(); setEditing(false); setMsg('¡Perfil actualizado!'); setTimeout(() => setMsg(''), 3000); }
    } finally { setSaving(false); }
  }

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid var(--border)', borderTopColor: 'var(--ember)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: 64, background: 'var(--bg)' }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 680 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, letterSpacing: '0.06em', color: 'var(--text)' }}>MI CUENTA</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Gestioná tu perfil y preferencias</p>
        </div>

        {msg && (
          <div style={{ background: 'rgba(45,74,62,0.2)', border: '1px solid var(--forest)', borderRadius: 6, padding: '10px 16px', fontSize: 13, color: 'var(--success)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check size={14}/> {msg}
          </div>
        )}

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 26, marginBottom: 18 }}>
          <div className="user-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(24, 69, 128, 0.15)', border: '2px solid var(--ember)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={21} color="var(--ember)"/>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text)' }}>{user.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{user.email}</div>
              </div>
            </div>
            {!editing && (
              <button className="profile-edit-button" onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 12, color: 'var(--text-muted)', transition: 'all 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--ember)'; e.currentTarget.style.color='var(--ember)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-muted)'; }}>
                <Edit2 size={13}/> Editar
              </button>
            )}
          </div>
          <style>{`@media (max-width: 425px) {
            .user-card-header { flex-direction: column; align-items: stretch; gap: 12px; }
            .profile-edit-button { width: 100%; justify-content: center; }
          }`}</style>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}><User size={13}/> Nombre</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}><Phone size={13}/> Teléfono</label>
                <PhoneInput
                    international
                    defaultCountry="AR"
                    countryCallingCodeEditable={false}
                    value={form.phone}
                    onChange={(value) => setForm(f => ({ ...f, phone: value || '' }))}
                    placeholder="+54 11 0000-0000"
                    style={{ ...inputStyle, paddingRight: 40 }}
                  />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={saveProfile} disabled={saving} style={{ flex: 1, padding: '9px', borderRadius: 5, background: 'var(--ember)', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button onClick={() => { setEditing(false); setForm({ name: user.name, phone: user.phone || '' }); }} style={{ padding: '9px 16px', borderRadius: 5, border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12 }}>
                  <X size={14}/>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <InfoRow icon={<Mail size={14}/>} label="Email" value={user.email}/>
              <InfoRow icon={<Phone size={14}/>} label="Teléfono" value={user.phone || 'No cargado'}/>
            </div>
          )}
        </div>

        {totalItems > 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 22, marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShoppingBag size={18} color="var(--ember)"/>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Carrito activo — {totalItems} {totalItems === 1 ? 'producto' : 'productos'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Total: ${totalPrice.toLocaleString('es-AR')}</div>
                </div>
              </div>
              <Link href="/cart" style={{ padding: '7px 16px', borderRadius: 5, background: 'var(--ember)', color: '#fff', fontSize: 12, fontWeight: 600 }}>Ver carrito</Link>
            </div>
          </div>
        )}

        <button onClick={() => { logout(); router.push('/'); }} style={{
          width: '100%', padding: '12px', borderRadius: 8, border: '1px solid rgba(21, 89, 179, 0.30)', background: 'transparent',
          color: 'var(--ember)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.18s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(22, 83, 163, 0.42)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <LogOut size={15}/> Salir de cuenta
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--ember)', display: 'flex' }}>{icon}</span>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 70, letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--text)' }}>{value}</span>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', fontSize: 14, background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 5 };
