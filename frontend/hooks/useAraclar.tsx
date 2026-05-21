import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  addArac,
  clearTumVeriler,
  deleteArac,
  getAraclar,
  getVarsayilanBildirimSaati,
  saveAraclar,
  setVarsayilanBildirimSaati,
  updateArac,
} from '../services/aracStorage';
import { aracBildirimleriniIptalEt, senkronizeTumBildirimler } from '../services/bildirimService';
import type { Arac, AracInput } from '../types/Arac';

interface AraclarContextDegeri {
  araclar: Arac[];
  yukleniyor: boolean;
  yenileniyor: boolean;
  varsayilanBildirimSaati: string;
  bildirimKotaMesaji: string | null;
  yenile: () => Promise<void>;
  araciEkle: (data: AracInput) => Promise<Arac>;
  araciGuncelle: (arac: Arac) => Promise<void>;
  araciSil: (id: string) => Promise<void>;
  tumVerileriSil: () => Promise<void>;
  varsayilanSaatiGuncelle: (saat: string) => Promise<void>;
  aracGetir: (id: string) => Arac | undefined;
}

const AraclarContext = createContext<AraclarContextDegeri | undefined>(undefined);

const varsayilanMesajiHesapla = (atlananAracSayisi: number) =>
  atlananAracSayisi > 0
    ? `${atlananAracSayisi} arac icin bildirim kotasi doldugu icin planlama sinirlandi.`
    : null;

export const AraclarProvider = ({ children }: PropsWithChildren) => {
  const [araclar, setAraclar] = useState<Arac[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [yenileniyor, setYenileniyor] = useState(false);
  const [varsayilanBildirimSaati, setVarsayilanSaatState] = useState('09:00');
  const [bildirimKotaMesaji, setBildirimKotaMesaji] = useState<string | null>(null);

  const bildirimleriYenile = useCallback(async (liste: Arac[]) => {
    const sonuc = await senkronizeTumBildirimler(liste);
    setBildirimKotaMesaji(varsayilanMesajiHesapla(sonuc.atlananAracIdleri.length));
  }, []);

  const yenile = useCallback(async () => {
    setYenileniyor(true);

    try {
      const [kayitlar, saat] = await Promise.all([getAraclar(), getVarsayilanBildirimSaati()]);
      setAraclar(kayitlar);
      setVarsayilanSaatState(saat);
      // Bildirimleri senkronize etmeyi beklemeden arka planda çalıştırarak yükleme süresini hızlandırıyoruz
      bildirimleriYenile(kayitlar).catch(console.error);
    } finally {
      setYukleniyor(false);
      setYenileniyor(false);
    }
  }, [bildirimleriYenile]);

  useEffect(() => {
    yenile();
  }, [yenile]);

  const araciEkle = useCallback(
    async (data: AracInput) => {
      const yeniKayit = await addArac({
        ...data,
        bildirimler: {
          ...data.bildirimler,
          saat: data.bildirimler.saat || varsayilanBildirimSaati,
        },
      });

      const guncelListe = [yeniKayit, ...araclar];
      setAraclar(guncelListe);
      await bildirimleriYenile(guncelListe);
      return yeniKayit;
    },
    [araclar, bildirimleriYenile, varsayilanBildirimSaati],
  );

  const araciGuncelle = useCallback(
    async (arac: Arac) => {
      await updateArac(arac);
      const guncelListe = araclar.map((kalem) => (kalem.id === arac.id ? arac : kalem));
      setAraclar(guncelListe);
      await bildirimleriYenile(guncelListe);
    },
    [araclar, bildirimleriYenile],
  );

  const araciSil = useCallback(
    async (id: string) => {
      await deleteArac(id);
      await aracBildirimleriniIptalEt(id);
      const guncelListe = araclar.filter((arac) => arac.id !== id);
      setAraclar(guncelListe);
      await bildirimleriYenile(guncelListe);
    },
    [araclar, bildirimleriYenile],
  );

  const varsayilanSaatiGuncelle = useCallback(
    async (saat: string) => {
      await setVarsayilanBildirimSaati(saat);
      setVarsayilanSaatState(saat);

      const guncelListe = araclar.map((arac) => ({
        ...arac,
        bildirimler: {
          ...arac.bildirimler,
          saat,
        },
      }));

      setAraclar(guncelListe);
      await saveAraclar(guncelListe);
      await bildirimleriYenile(guncelListe);
    },
    [araclar, bildirimleriYenile],
  );

  const tumVerileriSil = useCallback(async () => {
    await clearTumVeriler();
    setAraclar([]);
    setVarsayilanSaatState('09:00');
    setBildirimKotaMesaji(null);
  }, []);

  const aracGetir = useCallback((id: string) => araclar.find((arac) => arac.id === id), [araclar]);

  const deger = useMemo(
    () => ({
      araclar,
      yukleniyor,
      yenileniyor,
      varsayilanBildirimSaati,
      bildirimKotaMesaji,
      yenile,
      araciEkle,
      araciGuncelle,
      araciSil,
      tumVerileriSil,
      varsayilanSaatiGuncelle,
      aracGetir,
    }),
    [
      araclar,
      yukleniyor,
      yenileniyor,
      varsayilanBildirimSaati,
      bildirimKotaMesaji,
      yenile,
      araciEkle,
      araciGuncelle,
      araciSil,
      tumVerileriSil,
      varsayilanSaatiGuncelle,
      aracGetir,
    ],
  );

  return <AraclarContext.Provider value={deger}>{children}</AraclarContext.Provider>;
};

export const useAraclar = () => {
  const context = useContext(AraclarContext);

  if (!context) {
    throw new Error('useAraclar must be used within AraclarProvider');
  }

  return context;
};
