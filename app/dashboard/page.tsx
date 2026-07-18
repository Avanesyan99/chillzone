'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import type { Product } from '@/lib/products';
import { finalPrice, hasDiscount } from '@/lib/discount';
import {
  Lock, Plus, Trash2, Edit2, X, Upload, Image as ImageIcon, Tag, Save, Check, Loader2,
} from 'lucide-react';
import Image from 'next/image';

const CATEGORIES = ['vasos', 'termos', 'mates', 'accesorios'];

interface FormState {
  id?: string;
  slug: string;
  name: string;
  description: string;
  price: string;
  category: string;
  modelo: string;
  capacity: string;
  color: string;
  image_url: string;
  stock: string;
  discountPct: string;
  discountLabel: string;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isAdmin: boolean;
  createdAt: string;
}

const EMPTY_FORM: FormState = {
  slug: '', name: '', description: '', price: '', category: 'vasos',
  modelo: '', capacity: '', color: '', image_url: '', stock: '10',
  discountPct: '0', discountLabel: '',
};

export default function AdminPage() {
  const { user, loading, logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  // Load products on mount
  useEffect(() => {
    if (user && user.isAdmin) {
      refreshProducts();
      refreshUsers();
    }
  }, [user?.isAdmin]);

  async function refreshProducts() {
    setPageLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) setProducts((await res.json()).products);
      else setMsg({ type: 'error', text: 'No se pudieron cargar los productos.' });
    } catch {
      setMsg({ type: 'error', text: 'Error de conexión.' });
    } finally { setPageLoading(false); }
  }

  async function refreshUsers() {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) setUsers((await res.json()).users);
      else setMsg({ type: 'error', text: 'No se pudieron cargar los usuarios.' });
    } catch {
      setMsg({ type: 'error', text: 'Error de conexión.' });
    } finally { setUsersLoading(false); }
  }

  async function toggleAdminStatus(u: UserItem) {
    const updated = await fetch(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAdmin: !u.isAdmin }),
    });
    const data = await updated.json();
    if (!updated.ok) {
      setMsg({ type: 'error', text: data.error || 'No se pudo actualizar el usuario.' });
      return;
    }
    setMsg({ type: 'ok', text: `Usuario ${u.name} actualizado.` });
    await refreshUsers();
  }

  async function deleteUser(u: UserItem) {
    if (!confirm(`¿Eliminar al usuario ${u.name}? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      setMsg({ type: 'error', text: data.error || 'No se pudo eliminar el usuario.' });
      return;
    }
    setMsg({ type: 'ok', text: `Usuario ${u.name} eliminado.` });
    await refreshUsers();
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      id: p.id, slug: p.slug, name: p.name, description: p.description || '',
      price: String(p.price), category: p.category, modelo: p.modelo || '',
      capacity: p.capacity || '', color: p.color || '', image_url: p.image_url || '',
      stock: String(p.stock), discountPct: String(p.discountPct), discountLabel: p.discountLabel || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() { setEditingId(null); setForm(EMPTY_FORM); }

  async function handleUpload(file: File) {
    setUploading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setMsg({ type: 'error', text: data.error || 'Error al subir imagen.' }); return; }
      setForm(f => ({ ...f, image_url: data.url }));
      setMsg({ type: 'ok', text: 'Imagen subida correctamente.' });
    } catch {
      setMsg({ type: 'error', text: 'Error de conexión al subir imagen.' });
    } finally { setUploading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      category: form.category,
      modelo: form.modelo.trim() || null,
      capacity: form.capacity.trim() || null,
      color: form.color.trim() || null,
      image_url: form.image_url.trim() || null,
      stock: Number(form.stock),
      discountPct: Number(form.discountPct) || 0,
      discountLabel: Number(form.discountPct) > 0 ? (form.discountLabel.trim() || `${form.discountPct}% OFF`) : null,
    };

    if (!payload.slug || !payload.name || isNaN(payload.price) || !payload.category) {
      setMsg({ type: 'error', text: 'Completá slug, nombre, precio y categoría.' });
      setSaving(false);
      return;
    }

    try {
      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setMsg({ type: 'error', text: data.error || 'Error al guardar.' }); return; }

      setMsg({ type: 'ok', text: editingId ? '¡Producto actualizado!' : '¡Producto creado!' });
      cancelEdit();
      await refreshProducts();
    } catch {
      setMsg({ type: 'error', text: 'Error de conexión.' });
    } finally { setSaving(false); }
  }

  async function handleDelete(p: Product) {
    if (!confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' });
    if (res.ok) { await refreshProducts(); if (editingId === p.id) cancelEdit(); }
    else setMsg({ type: 'error', text: 'No se pudo eliminar.' });
  }

  // Show loading
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <Loader2 size={32} className="spin" color="var(--ember)"/>
        <style>{`.spin{animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Check authorization
  if (!user || !user.isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <Lock size={48} color="var(--ember)" style={{ margin: '0 auto 16px' }}/>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: '0.1em', color: 'var(--text)', marginBottom: 8 }}>ACCESO DENEGADO</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
            {!user ? 'Necesitás estar autenticado para acceder al panel de administración.' : 'No tenés permisos de administrador.'}
          </p>
          <a href="/" style={{ display: 'inline-block', padding: '11px 24px', borderRadius: 6, background: 'var(--ember)', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: 64, background: 'var(--bg)' }}>
      <div className="container" style={{ paddingTop: 36, paddingBottom: 80, maxWidth: 1000 }}>

        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(32px,5vw,46px)', letterSpacing: '0.06em', color: 'var(--text)' }}>DASHBOARD</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {products.length} productos en el catálogo · {users.length} usuarios registrados
            </p>
          </div>
          <button onClick={() => { logout(); }}
            style={{ fontSize: 12, color: 'var(--text-dim)', textDecoration: 'underline' }}>Salir</button>
        </div>

        {msg && (
          <div style={{ marginBottom: 20, padding: '10px 16px', borderRadius: 6, fontSize: 13,
            background: msg.type === 'ok' ? 'rgba(45,74,62,0.2)' : 'rgb(24 69 128 / 15%)',
            border: `1px solid ${msg.type === 'ok' ? 'var(--forest)' : 'rgb(24 69 128 / 15%)'}`,
            color: msg.type === 'ok' ? 'var(--success)' : 'var(--ember)',
            display: 'flex', alignItems: 'center', gap: 8 }}>
            {msg.type === 'ok' ? <Check size={14}/> : <X size={14}/>} {msg.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: '0.06em', color: 'var(--text)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
            {editingId ? <><Edit2 size={18}/> EDITAR PRODUCTO</> : <><Plus size={18}/> NUEVO PRODUCTO</>}
            {editingId && (
              <button type="button" onClick={cancelEdit} style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4 }}>
                <X size={13}/> Cancelar
              </button>
            )}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 24 }}>
            {/* Image uploader */}
            <div>
              <label style={labelStyle}>Foto</label>
              <div style={{
                aspectRatio: '1/1', borderRadius: 8, border: '2px dashed var(--border)',
                background: 'var(--bg-2)', position: 'relative', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {form.image_url ? (
                  <Image src={form.image_url} alt="preview" fill style={{ objectFit: 'cover' }}/>
                ) : (
                  <ImageIcon size={32} color="var(--text-dim)"/>
                )}
                {uploading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 size={24} color="#fff" className="spin"/>
                  </div>
                )}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, padding: '8px', borderRadius: 5, border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                <Upload size={13}/> Subir foto
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}/>
              </label>
              {form.image_url && (
                <button type="button" onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                  style={{ width: '100%', marginTop: 6, fontSize: 11, color: 'var(--text-dim)', textAlign: 'center' }}>
                  Quitar foto
                </button>
              )}
              <style>{`.spin{animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>

            {/* Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Nombre *" full>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Vaso Stanley..." required style={inputStyle}/>
              </Field>
              <Field label="Slug (URL) *" full>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="vaso-stanley-nuevo" required style={inputStyle}/>
              </Field>
              <Field label="Descripción" full>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Descripción del producto..." style={{ ...inputStyle, resize: 'vertical' }}/>
              </Field>

              <Field label="Precio (ARS) *">
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="117000" required style={inputStyle}/>
              </Field>
              <Field label="Stock">
                <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="10" style={inputStyle}/>
              </Field>

              <Field label="Categoría *">
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Modelo">
                <input value={form.modelo} onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))} placeholder="Stanley Quencher H2.0" style={inputStyle}/>
              </Field>

              <Field label="Capacidad">
                <input value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} placeholder="887ml" style={inputStyle}/>
              </Field>
              <Field label="Color">
                <input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="Black" style={inputStyle}/>
              </Field>

              <Field label="Descuento %">
                <input type="number" min={0} max={100} value={form.discountPct} onChange={e => setForm(f => ({ ...f, discountPct: e.target.value }))} placeholder="0" style={inputStyle}/>
              </Field>
              <Field label="Etiqueta descuento">
                <input value={form.discountLabel} onChange={e => setForm(f => ({ ...f, discountLabel: e.target.value }))} placeholder="PROMO / 20% OFF" disabled={Number(form.discountPct) <= 0} style={{ ...inputStyle, opacity: Number(form.discountPct) <= 0 ? 0.4 : 1 }}/>
              </Field>

              {/* Live preview of price */}
              {Number(form.discountPct) > 0 && Number(form.price) > 0 && (
                <div style={{ gridColumn: '1 / -1', fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag size={13} color="var(--ember)"/>
                  Precio final: <span style={{ textDecoration: 'line-through' }}>${Number(form.price).toLocaleString('es-AR')}</span>
                  <span style={{ color: 'var(--ember)', fontWeight: 700 }}>${finalPrice(Number(form.price), Number(form.discountPct)).toLocaleString('es-AR')}</span>
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px', borderRadius: 6, background: saving ? 'var(--forest)' : 'var(--ember)', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {saving ? <Loader2 size={15} className="spin"/> : <Save size={15}/>}
            {editingId ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </form>

        {/* Product list */}
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: '0.06em', color: 'var(--text)', marginBottom: 14 }}>CATÁLOGO</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {products.map(p => {
            const discounted = hasDiscount(p.discountPct);
            return (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto auto', gap: 14, alignItems: 'center', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6 }}>
                <div style={{ width: 48, height: 48, borderRadius: 5, background: 'var(--bg-2)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {p.image_url ? <Image src={p.image_url} alt={p.name} fill style={{ objectFit: 'cover' }}/> : '📦'}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                    {p.category}{p.modelo ? ` · ${p.modelo}` : ''} · stock: {p.stock}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {discounted && <div style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through' }}>${p.price.toLocaleString('es-AR')}</div>}
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, color: discounted ? 'var(--ember)' : 'var(--text)' }}>
                    ${finalPrice(p.price, p.discountPct).toLocaleString('es-AR')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => startEdit(p)} style={{ padding: 7, borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text-muted)' }}><Edit2 size={14}/></button>
                  <button onClick={() => handleDelete(p)} style={{ padding: 7, borderRadius: 4, border: '1px solid var(--border)', color: 'var(--ember)' }}><Trash2 size={14}/></button>
                </div>
              </div>
            );
          })}
        </div>

        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: '0.06em', color: 'var(--text)', marginTop: 40, marginBottom: 14 }}>USUARIOS</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {usersLoading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Cargando usuarios...</div>
          ) : users.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No hay usuarios registrados aún.</div>
          ) : (
            users.map(u => (
              <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 14, alignItems: 'center', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{u.email}{u.phone ? ` · ${u.phone}` : ''}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: u.isAdmin ? 'var(--ember)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {u.isAdmin ? 'Admin' : 'Cliente'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>{new Date(u.createdAt).toLocaleDateString('es-AR')}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => toggleAdminStatus(u)} style={{ padding: 7, borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 11 }}>
                    {u.isAdmin ? 'Quitar admin' : 'Hacer admin'}
                  </button>
                  <button onClick={() => deleteUser(u)} style={{ padding: 7, borderRadius: 4, border: '1px solid var(--border)', color: 'var(--ember)', fontSize: 11 }}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <style>{`@media(max-width:640px){div[style*="grid-template-columns: 160px 1fr"]{grid-template-columns:1fr!important}div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}div[style*="grid-template-columns: 48px 1fr auto auto"]{grid-template-columns:40px 1fr auto!important}}`}</style>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', fontSize: 13, background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 5, outline: 'none', fontFamily: 'inherit' };
