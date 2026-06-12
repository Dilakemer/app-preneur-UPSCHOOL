import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type GiderKategori = 'yakit' | 'bakim' | 'yikama' | 'otopark' | 'sigorta' | 'diger';

export interface Gider {
  id: string;
  aracId: string;
  kategori: GiderKategori;
  tutar: number;
  aciklama: string;
  tarih: string; // YYYY-MM-DD
  olusturmaTarihi: string;
}

export const KATEGORI_BILGI: Record<GiderKategori, { label: string; icon: string; renk: string; bg: string }> = {
  yakit:   { label: 'Yakıt',           icon: '⛽', renk: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  bakim:   { label: 'Bakım/Servis',    icon: '🔧', renk: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  yikama:  { label: 'Yıkama',          icon: '🚿', renk: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  otopark: { label: 'Otopark',         icon: '🅿️', renk: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  sigorta: { label: 'Sigorta',         icon: '🛡️', renk: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  diger:   { label: 'Diğer',           icon: '📋', renk: '#64748b', bg: 'rgba(100,116,139,0.15)' },
};

interface GiderlerContextValue {
  giderler: Gider[];
  giderEkle: (g: Omit<Gider, 'id' | 'olusturmaTarihi'>) => void;
  giderSil: (id: string) => void;
  aracGiderleri: (aracId: string) => Gider[];
  toplamTutar: (aracId?: string) => number;
}

const GiderlerContext = createContext<GiderlerContextValue | undefined>(undefined);
const STORAGE_KEY = '@caremind:giderler';

function yukle(): Gider[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function kaydet(giderler: Gider[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(giderler));
}

export function GiderlerProvider({ children }: { children: ReactNode }) {
  const [giderler, setGiderler] = useState<Gider[]>(yukle);

  useEffect(() => { kaydet(giderler); }, [giderler]);

  const giderEkle = useCallback((g: Omit<Gider, 'id' | 'olusturmaTarihi'>) => {
    const yeni: Gider = {
      ...g,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      olusturmaTarihi: new Date().toISOString(),
    };
    setGiderler(prev => [yeni, ...prev]);
  }, []);

  const giderSil = useCallback((id: string) => {
    setGiderler(prev => prev.filter(g => g.id !== id));
  }, []);

  const aracGiderleri = useCallback((aracId: string) => {
    return giderler.filter(g => g.aracId === aracId);
  }, [giderler]);

  const toplamTutar = useCallback((aracId?: string) => {
    const liste = aracId ? giderler.filter(g => g.aracId === aracId) : giderler;
    return liste.reduce((t, g) => t + g.tutar, 0);
  }, [giderler]);

  const value = useMemo(() => ({
    giderler, giderEkle, giderSil, aracGiderleri, toplamTutar,
  }), [giderler, giderEkle, giderSil, aracGiderleri, toplamTutar]);

  return <GiderlerContext.Provider value={value}>{children}</GiderlerContext.Provider>;
}

export function useGiderler() {
  const ctx = useContext(GiderlerContext);
  if (!ctx) throw new Error('useGiderler must be used within GiderlerProvider');
  return ctx;
}
