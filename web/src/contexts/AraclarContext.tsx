import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Arac, AracInput } from '../types/Arac';
import { apiGet, apiPost, apiPut, apiDelete } from '../config/api';

interface AraclarContextValue {
  araclar: Arac[];
  yukleniyor: boolean;
  yenile: () => Promise<void>;
  araciEkle: (data: AracInput) => Promise<Arac>;
  araciGuncelle: (arac: Arac) => Promise<void>;
  araciSil: (id: string) => Promise<void>;
  tumVerileriSil: () => Promise<void>;
  aracGetir: (id: string) => Arac | undefined;
}

const AraclarContext = createContext<AraclarContextValue | undefined>(undefined);

const STORAGE_KEY = '@caremind:araclar';

const getLocalAraclar = (): Arac[] => {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

const saveLocalAraclar = (araclar: Arac[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(araclar));
};

export function AraclarProvider({ children }: { children: ReactNode }) {
  const [araclar, setAraclar] = useState<Arac[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const yenile = useCallback(async () => {
    try {
      const email = localStorage.getItem('@caremind:kayitliEposta');
      if (email) {
        const data = await apiGet<Arac[]>('/araclar');
        setAraclar(data);
        saveLocalAraclar(data);
      } else {
        setAraclar(getLocalAraclar());
      }
    } catch {
      setAraclar(getLocalAraclar());
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    yenile();
  }, [yenile]);

  const araciEkle = useCallback(async (data: AracInput): Promise<Arac> => {
    const email = localStorage.getItem('@caremind:kayitliEposta');
    if (email) {
      try {
        const yeni = await apiPost<Arac>('/araclar', data);
        setAraclar(prev => {
          const guncel = [yeni, ...prev.filter(a => a.id !== yeni.id)];
          saveLocalAraclar(guncel);
          return guncel;
        });
        return yeni;
      } catch (error) {
        if (error instanceof Error && error.message.includes('giriş')) throw error;
      }
    }
    // offline fallback
    const zaman = new Date().toISOString();
    const yeniArac: Arac = {
      ...data,
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      olusturmaTarihi: zaman,
      guncellemeTarihi: zaman,
    };
    setAraclar(prev => {
      const guncel = [yeniArac, ...prev];
      saveLocalAraclar(guncel);
      return guncel;
    });
    return yeniArac;
  }, []);

  const araciGuncelle = useCallback(async (arac: Arac) => {
    const email = localStorage.getItem('@caremind:kayitliEposta');
    let guncelArac = { ...arac, guncellemeTarihi: new Date().toISOString() };
    if (email) {
      try {
        guncelArac = await apiPut<Arac>(`/araclar/${arac.id}`, arac);
      } catch (error) {
        if (error instanceof Error && error.message.includes('giriş')) throw error;
      }
    }
    setAraclar(prev => {
      const guncel = prev.map(a => a.id === guncelArac.id ? guncelArac : a);
      saveLocalAraclar(guncel);
      return guncel;
    });
  }, []);

  const araciSil = useCallback(async (id: string) => {
    const email = localStorage.getItem('@caremind:kayitliEposta');
    if (email) {
      try {
        await apiDelete(`/araclar/${id}`);
      } catch (error) {
        if (error instanceof Error && error.message.includes('giriş')) throw error;
      }
    }
    setAraclar(prev => {
      const guncel = prev.filter(a => a.id !== id);
      saveLocalAraclar(guncel);
      return guncel;
    });
  }, []);

  const tumVerileriSil = useCallback(async () => {
    const email = localStorage.getItem('@caremind:kayitliEposta');
    if (email) {
      try {
        await apiDelete('/yonetim/tum-veriler');
      } catch { /* ignore */ }
    }
    const keys = Object.keys(localStorage).filter(k => k.startsWith('@caremind'));
    keys.forEach(k => localStorage.removeItem(k));
    setAraclar([]);
  }, []);

  const aracGetir = useCallback((id: string) => araclar.find(a => a.id === id), [araclar]);

  const value = useMemo(() => ({
    araclar, yukleniyor, yenile, araciEkle, araciGuncelle, araciSil, tumVerileriSil, aracGetir,
  }), [araclar, yukleniyor, yenile, araciEkle, araciGuncelle, araciSil, tumVerileriSil, aracGetir]);

  return <AraclarContext.Provider value={value}>{children}</AraclarContext.Provider>;
}

export function useAraclar() {
  const ctx = useContext(AraclarContext);
  if (!ctx) throw new Error('useAraclar must be used within AraclarProvider');
  return ctx;
}
