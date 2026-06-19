'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, User, Mail, Phone, Lock, Flame, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { isValidPhoneNumber } from 'react-phone-number-input';

type Mode = 'login' | 'register' | 'forgot';

// Google SVG icon
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, refresh } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get('error') === 'google_denied' ? 'Acceso con Google cancelado.' : '');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  // Forgot password result
  const [forgotDone, setForgotDone] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');
  const [googleAccount, setGoogleAccount] = useState(false);

  function set(field: string, value: string) { setForm(f => ({ ...f, [field]: value })); setError(''); }
  function switchMode(m: Mode) { setMode(m); setError(''); setForgotDone(false); setDevResetUrl(''); setGoogleAccount(false); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Error desconocido.'); return; }
        if (data.googleAccount) { setGoogleAccount(true); return; }
        if (data.dev_resetUrl) setDevResetUrl(data.dev_resetUrl);
        setForgotDone(true);
        return;
      }

      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, phone: form.phone, password: form.password };

      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error desconocido.'); return; }
      login('', data.user);
      await refresh();
      router.push('/');
    } catch { setError('Error de conexión. Intentá de nuevo.'); }
    finally { setLoading(false); }
  }

  // ── Forgot done screen ─────────────────────────────────────
  if (mode === 'forgot' && forgotDone) {
    return (
      <PageWrapper>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <CheckCircle size={40} color="var(--success)" style={{ margin: '0 auto 12px' }}/>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: '0.1em', color: 'var(--text)' }}>
            {devResetUrl ? 'MODO DESARROLLO' : '¡EMAIL ENVIADO!'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.6 }}>
            {devResetUrl
              ? 'Resend no está configurado. Usá el enlace de abajo para testear.'
              : 'Revisá tu email. Si la cuenta existe, recibirás el enlace en los próximos minutos.'}
          </p>
        </div>
        {devResetUrl && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Enlace de desarrollo</p>
            <Link href={devResetUrl} style={{ fontSize: 12, color: 'var(--ember)', wordBreak: 'break-all', textDecoration: 'underline' }}>
              {typeof window !== 'undefined' ? `${window.location.origin}${devResetUrl}` : devResetUrl}
            </Link>
          </div>
        )}
        <button onClick={() => switchMode('login')} style={{ display: 'flex', alignItems: 'center', gap: 5, margin: '0 auto', fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={13}/> Volver al inicio de sesión
        </button>
      </PageWrapper>
    );
  }

  // ── Google account warning ─────────────────────────────────
  if (mode === 'forgot' && googleAccount) {
    return (
      <PageWrapper>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <GoogleIcon/>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: '0.1em', color: 'var(--text)', marginTop: 12 }}>CUENTA DE GOOGLE</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.7 }}>
            Esta cuenta se creó con Google. No tiene contraseña — ingresá usando el botón de Google.
          </p>
        </div>
        <button onClick={() => switchMode('login')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', padding: '11px', borderRadius: 6, background: 'var(--ember)', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Ingresar con Google
        </button>
        <button onClick={() => switchMode('login')} style={{ display: 'flex', alignItems: 'center', gap: 5, margin: '14px auto 0', fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={13}/> Volver
        </button>
      </PageWrapper>
    );
  }

  // ── Main form ──────────────────────────────────────────────
  return (
    <PageWrapper>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Flame size={28} color="var(--ember)" style={{ margin: '0 auto 10px' }}/>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: '0.1em', color: 'var(--text)' }}>
          {mode === 'login' ? 'BIENVENIDO' : mode === 'register' ? 'CREAR CUENTA' : 'RECUPERAR CONTRASEÑA'}
        </h1>
      </div>

      {/* Tabs */}
      {mode !== 'forgot' && (
        <div style={{ display: 'flex', marginBottom: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }}>
          {(['login', 'register'] as Mode[]).map(m => (
            <button key={m} onClick={() => switchMode(m)} style={{
              flex: 1, padding: '8px 0', borderRadius: 5, fontSize: 12,
              letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500,
              background: mode === m ? 'var(--ember)' : 'transparent',
              color: mode === m ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s',
            }}>
              {m === 'login' ? 'Ingresar' : 'Crear cuenta'}
            </button>
          ))}
        </div>
      )}

      {mode === 'forgot' && (
        <button onClick={() => switchMode('login')} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 18, fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={13}/> Volver
        </button>
      )}

      {/* Google button — only on login/register */}
      {mode !== 'forgot' && (
        <>
          <a href="/api/auth/google" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '11px', borderRadius: 6, border: '1px solid var(--border)',
            background: 'var(--bg-card)', color: 'var(--text)',
            fontSize: 13, fontWeight: 500, textDecoration: 'none',
            transition: 'border-color 0.18s, background 0.18s', marginBottom: 14,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--ember)'; e.currentTarget.style.background='var(--bg-card-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-card)'; }}
          >
            <GoogleIcon/>
            {mode === 'login' ? 'Ingresar con Google' : 'Registrarse con Google'}
          </a>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>o</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
          </div>
        </>
      )}

      {/* Form */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 22 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {mode === 'register' && (
            <Field label="Nombre" icon={<User size={13}/>}>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Juan Pérez" required style={inputStyle}/>
            </Field>
          )}
          <Field label="Email" icon={<Mail size={13}/>}>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="tu@email.com" required style={inputStyle}/>
          </Field>
          {mode === 'register' && (
            <Field label="Teléfono (opcional)" icon={<Phone size={13}/>}>
                <PhoneInput
                  defaultCountry="AR"
                  countryCallingCodeEditable={false}
                  value={form.phone}
                  onChange={(value) => set('phone', value || '')}
                  placeholder="+54 11 0000-0000"
                  style={{ ...inputStyle, paddingRight: 40 }}
                />
              </Field>
          )}
          {mode !== 'forgot' && (
            <Field label="Contraseña" icon={<Lock size={13}/>}>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'} required
                  style={{ ...inputStyle, paddingRight: 40 }}/>
                <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', padding: 0, background: 'none', border: 'none' }}>
                  {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </Field>
          )}
          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: -4 }}>
              <button type="button" onClick={() => switchMode('forgot')} style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', transition: 'color 0.18s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ember)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}
          {error && isValidPhoneNumber(form.phone) && (
            <div style={{ background: 'rgb(24 69 128 / 15%)', border: '1px solid rgb(24 69 128 / 30%)', borderRadius: 5, padding: '9px 13px', fontSize: 12, color: 'var(--ember)' }}>{error || 'Ingrese un teléfono válido'}</div>
          )}
          <button type="submit" disabled={loading} style={{
            marginTop: 2, padding: '12px', borderRadius: 6,
            background: loading ? 'var(--forest)' : 'var(--ember)', color: '#fff',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            transition: 'background 0.2s', opacity: loading ? 0.8 : 1,
          }}>
            {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar con email' : mode === 'register' ? 'Crear cuenta' : 'Enviar enlace de recuperación'}
          </button>
        </form>
      </div>

      {mode !== 'forgot' && (
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          {mode === 'login' ? '¿No tenés cuenta? ' : '¿Ya tenés cuenta? '}
          <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')} style={{ color: 'var(--ember)', fontWeight: 500, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
            {mode === 'login' ? 'Crear cuenta' : 'Ingresar'}
          </button>
        </p>
      )}

      <p style={{ textAlign: 'center', marginTop: 14 }}>
        <Link href="/" style={{ fontSize: 12, color: 'var(--text-dim)', textDecoration: 'underline' }}>Volver al catálogo</Link>
      </p>
    </PageWrapper>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)' }}/>}>
      <LoginForm/>
    </Suspense>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>{children}</div>
    </div>
  );
}
function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>{icon} {label}</label>
      {children}
    </div>
  );
}
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', fontSize: 13, background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 5, outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' };
