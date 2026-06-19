'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Lock, Eye, EyeOff, CheckCircle, Flame } from 'lucide-react';
import Link from 'next/link';

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    if (password.length < 6) { setError('Mínimo 6 caracteres.'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error desconocido.'); return; }
      await refresh();
      setDone(true);
      setTimeout(() => router.push('/'), 2500);
    } catch {
      setError('Error de conexión. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <p style={{ color: 'var(--ember)', marginBottom: 16, fontSize: 14 }}>Enlace inválido o incompleto.</p>
        <Link href="/login" style={{ color: 'var(--ember)', textDecoration: 'underline', fontSize: 13 }}>Volver a iniciar sesión</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 16px' }}/>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: '0.08em', color: 'var(--text)', marginBottom: 8 }}>¡CONTRASEÑA ACTUALIZADA!</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Redirigiendo al inicio...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={labelStyle}><Lock size={13}/> Nueva contraseña</label>
        <div style={{ position: 'relative' }}>
          <input type={showPass ? 'text' : 'password'} value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder="Mínimo 6 caracteres" required style={{ ...inputStyle, paddingRight: 40 }}/>
          <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', background: 'none', border: 'none', padding: 0 }}>
            {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
          </button>
        </div>
        {password.length > 0 && (
          <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
            {[1,2,3,4].map(i => {
              const strength = password.length >= 10 ? 4 : password.length >= 8 ? 3 : password.length >= 6 ? 2 : 1;
              const colors = ['#ef4444','#f97316','#eab308','#22c55e'];
              return <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? colors[strength-1] : 'var(--border)', transition: 'background 0.2s' }}/>;
            })}
          </div>
        )}
      </div>

      <div>
        <label style={labelStyle}><Lock size={13}/> Confirmar contraseña</label>
        <input type={showPass ? 'text' : 'password'} value={confirm}
          onChange={e => { setConfirm(e.target.value); setError(''); }}
          placeholder="Repetí la contraseña" required
          style={{ ...inputStyle, borderColor: confirm.length > 0 ? (confirm === password ? 'var(--success)' : 'var(--ember)') : 'var(--border)' }}/>
      </div>

      {error && (
        <div style={{ background: 'rgba(196,87,26,0.1)', border: '1px solid rgba(196,87,26,0.3)', borderRadius: 5, padding: '10px 14px', fontSize: 13, color: 'var(--ember)' }}>{error}</div>
      )}

      <button type="submit" disabled={loading} style={{
        marginTop: 4, padding: '13px', borderRadius: 6, background: loading ? 'var(--forest)' : 'var(--ember)',
        color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'background 0.2s', opacity: loading ? 0.8 : 1,
      }}>
        {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Flame size={30} color="var(--ember)" style={{ margin: '0 auto 10px' }}/>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, letterSpacing: '0.1em', color: 'var(--text)' }}>NUEVA CONTRASEÑA</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Elegí una contraseña segura para tu cuenta</p>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 28 }}>
          <Suspense fallback={<div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Cargando...</div>}>
            <ResetForm />
          </Suspense>
        </div>
        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <Link href="/login" style={{ fontSize: 12, color: 'var(--text-dim)', textDecoration: 'underline' }}>Volver a iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', fontSize: 14, background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 5, outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' };
