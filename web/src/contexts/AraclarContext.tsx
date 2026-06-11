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
import { useAuth } from './AuthContext';

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
const GIRIS_GEREKLI_HATASI = 'Bu islem icin giris yapmaniz gerekiyor.';

const storageKeyFor = (email: string) => `${STORAGE_KEY}:${email.trim().toLowerCase()}`;

const getLocalAraclar = (email: string): Arac[] => {
  try {
    const json = localStorage.getItem(storageKeyFor(email));
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

const saveLocalAraclar = (email: string, araclar: Arac[]) => {
  localStorage.setItem(storageKeyFor(email), JSON.stringify(araclar));
};

export function AraclarProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, email } = useAuth();
  const [araclar, setAraclar] = useState<Arac[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const girisKontrolEt = useCallback(() => {
    if (!isLoggedIn || !email) {
      throw new Error(GIRIS_GEREKLI_HATASI);
    }
  }, [email, isLoggedIn]);

  const yenile = useCallback(async () => {
    if (!isLoggedIn || !email) {
      setAraclar([]);
      setYukleniyor(false);
      return;
    }

    setYukleniyor(true);
    try {
      const data = await apiGet<Arac[]>('/araclar');
      setAraclar(data);
      saveLocalAraclar(email, data);
    } catch {
      setAraclar(getLocalAraclar(email));
    } finally {
      setYukleniyor(false);
    }
  }, [email, isLoggedIn]);

  useEffect(() => {
    yenile();
  }, [yenile]);

  const araciEkle = useCallback(async (data: AracInput): Promise<Arac> => {
    girisKontrolEt();

    const yeni = await apiPost<Arac>('/araclar', data);
    setAraclar(prev => {
      const guncel = [yeni, ...prev.filter(a => a.id !== yeni.id)];
      saveLocalAraclar(email, guncel);
      return guncel;
    });
    return yeni;
  }, [email, girisKontrolEt]);

  const araciGuncelle = useCallback(async (arac: Arac) => {
    girisKontrolEt();

    const guncelArac = await apiPut<Arac>(`/araclar/${arac.id}`, arac);
    setAraclar(prev => {
      const guncel = prev.map(a => a.id === guncelArac.id ? guncelArac : a);
      saveLocalAraclar(email, guncel);
      return guncel;
    });
  }, [email, girisKontrolEt]);

  const araciSil = useCallback(async (id: string) => {
    girisKontrolEt();

    await apiDelete(`/araclar/${id}`);
    setAraclar(prev => {
      const guncel = prev.filter(a => a.id !== id);
      saveLocalAraclar(email, guncel);
      return guncel;
    });
  }, [email, girisKontrolEt]);

  const tumVerileriSil = useCallback(async () => {
    girisKontrolEt();

    await apiDelete('/yonetim/tum-veriler');
    localStorage.removeItem(storageKeyFor(email));
    setAraclar([]);
  }, [email, girisKontrolEt]);

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
