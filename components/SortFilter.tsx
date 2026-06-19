'use client';

import { useState, useCallback, useEffect } from 'react';
import { SlidersHorizontal, X, Tag } from 'lucide-react';

interface Props {
  categories: string[];
  totalVisible: number;
  onFilter: (filters: FilterState) => void;
}

export interface FilterState {
  category: string;
  sort: 'default' | 'price-asc' | 'price-desc' | 'promo';
}

const CAT_LABELS: Record<string, string> = {
  all: 'Todos', vasos: 'Vasos', termos: 'Termos', mates: 'Mates', accesorios: 'Accesorios',
};

const SORT_LABELS: Record<string, string> = {
  default: 'Relevancia',
  'price-asc': 'Precio: menor a mayor',
  'price-desc': 'Precio: mayor a menor',
  promo: '🔥 Promos',
};

export default function SortFilter({ categories, totalVisible, onFilter }: Props) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ category: 'all', sort: 'default' });

  const activeCount = [
    filters.category !== 'all',
    filters.sort !== 'default',
  ].filter(Boolean).length;

  useEffect(() => {
    onFilter(filters);
  }, [filters, onFilter]);

  const update = useCallback((patch: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...patch }));
  }, []);

  function reset() {
    const def = { category: 'all', sort: 'default' as const };
    setFilters(def);
  }

  return (
    <div style={{ position: 'sticky', top: 64, zIndex: 50, background: 'var(--nav-bg)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
      {/* Compact bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', overflowX: 'auto' }}>

        {/* Toggle panel button */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 4,
            border: `1px solid ${open || activeCount > 0 ? 'var(--ember)' : 'var(--border)'}`,
            background: open || activeCount > 0 ? 'rgb(24 69 128 / 15%)' : 'transparent',
            color: open || activeCount > 0 ? 'var(--ember)' : 'var(--text-muted)',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
            transition: 'all 0.18s',
          }}>
          <SlidersHorizontal size={13}/>
          Filtros
          {activeCount > 0 && (
            <span style={{ background: 'var(--ember)', color: '#fff', borderRadius: '50%',
              width: 16, height: 16, fontSize: 9, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeCount}
            </span>
          )}
        </button>

        {/* Quick category pills */}
        {/* <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          {['all', ...categories].map(cat => (
            <button key={cat} onClick={() => update({ category: cat })} style={{
              padding: '5px 12px', borderRadius: 3, whiteSpace: 'nowrap',
              border: `1px solid ${filters.category === cat ? 'var(--ember)' : 'var(--border)'}`,
              background: filters.category === cat ? 'rgba(196,87,26,0.12)' : 'transparent',
              color: filters.category === cat ? 'var(--ember)' : 'var(--text-muted)',
              fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
              transition: 'all 0.15s',
            }}>
              {CAT_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        {/* Promo quick button */}
        {/* <button onClick={() => update({ sort: filters.sort === 'promo' ? 'default' : 'promo' })} style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 12px', borderRadius: 3,
          border: `1px solid ${filters.sort === 'promo' ? '#f97316' : 'var(--border)'}`,
          background: filters.sort === 'promo' ? 'rgba(249,115,22,0.12)' : 'transparent',
          color: filters.sort === 'promo' ? '#f97316' : 'var(--text-muted)',
          fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
          transition: 'all 0.15s',
        }}>
          <Tag size={11}/> Promos
        </button> */}

        {/* Result count */}
        <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
          {totalVisible} productos
        </span>

        {/* Reset */}
        {activeCount > 0 && (
          <button onClick={reset} style={{ flexShrink: 0, padding: '5px 8px', color: 'var(--text-dim)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ember)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
            <X size={12}/> Limpiar
          </button>
        )}
      </div>

      {/* Expanded panel */}
      {open && (
        <div style={{
          borderTop: '1px solid var(--border)', padding: '16px 0 18px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20,
        }}>
          {/* Categoría */}
          <FilterGroup label="Categoría">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {['all', ...categories].map(cat => (
                <button key={cat} onClick={() => update({ category: cat })} style={{
                  padding: '4px 10px', borderRadius: 3,
                  border: `1px solid ${filters.category === cat ? 'var(--ember)' : 'var(--border)'}`,
                  background: filters.category === cat ? 'rgb(24 69 128 / 15%)' : 'transparent',
                  color: filters.category === cat ? 'var(--ember)' : 'var(--text-muted)',
                  fontSize: 11, whiteSpace: 'nowrap', transition: 'all 0.15s',
                }}>
                  {cat === 'all' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </FilterGroup>

          {/* Ordenar por */}
          <FilterGroup label="Ordenar por">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {(Object.keys(SORT_LABELS) as FilterState['sort'][]).map(s => (
                <button key={s} onClick={() => update({ sort: s })} style={{
                  padding: '6px 10px', borderRadius: 3, textAlign: 'left',
                  border: `1px solid ${filters.sort === s ? 'var(--ember)' : 'var(--border)'}`,
                  background: filters.sort === s ? 'rgb(24 69 128 / 15%)' : 'transparent',
                  color: filters.sort === s ? 'var(--ember)' : 'var(--text-muted)',
                  fontSize: 12, transition: 'all 0.15s',
                }}>
                  {SORT_LABELS[s]}
                </button>
              ))}
            </div>
          </FilterGroup>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}
