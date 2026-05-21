import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { BildirimIzinDurumu } from '../types/Api';
import type { Arac, AracInput } from '../types/Arac';
import { VARSAYILAN_BILDIRIMLER } from '../types/Arac';

const UYGULAMA_PREFIX = '@caremind';
const ONBOARDING_ANAHTARI = `${UYGULAMA_PREFIX}:onboarding`;
const BILDIRIM_SAATI_ANAHTARI = `${UYGULAMA_PREFIX}:bildirim_saat`;
const BILDIRIM_IZIN_ANAHTARI = `${UYGULAMA_PREFIX}:bildirim_izni`;
const BILDIRIM_KEY_PREFIX = `${UYGULAMA_PREFIX}:bildirimler:`;

const getDepolamaAnahtari = async (): Promise<string> => {
  const eposta = await AsyncStorage.getItem('@caremind:kayitliEposta');
  return eposta ? `${UYGULAMA_PREFIX}:araclar:${eposta.trim().toLowerCase()}` : `${UYGULAMA_PREFIX}:araclar:guest`;
};

const getHeaders = async () => {
  const eposta = await AsyncStorage.getItem('@caremind:kayitliEposta');
  return {
    'Content-Type': 'application/json',
    ...(eposta ? { 'X-User-Email': eposta.trim() } : {})
  };
};

const bildirimKey = (aracId: string) => `${BILDIRIM_KEY_PREFIX}${aracId}`;

const yeniIdOlustur = () =>
  typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === 'android') return 'http://10.0.2.2:3001/api';
  return 'http://localhost:3001/api';
};
const API_URL = getApiUrl();

export const getAraclar = async (): Promise<Arac[]> => {
  const depolamaKey = await getDepolamaAnahtari();
  const headers = await getHeaders();
  
  try {
    const res = await fetch(`${API_URL}/araclar`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        await AsyncStorage.setItem(depolamaKey, JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (error) {
    console.warn('API getAraclar hatası, yerel veriye dönülüyor:', error);
  }
  
  try {
    const json = await AsyncStorage.getItem(depolamaKey);
    return json ? (JSON.parse(json) as Arac[]) : [];
  } catch {
    return [];
  }
};

export const saveAraclar = async (araclar: Arac[]) => {
  const depolamaKey = await getDepolamaAnahtari();
  await AsyncStorage.setItem(depolamaKey, JSON.stringify(araclar));
};

export const addArac = async (data: AracInput): Promise<Arac> => {
  const headers = await getHeaders();
  
  try {
    const res = await fetch(`${API_URL}/araclar`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        const yeniArac = json.data;
        const mevcut = await getAraclar();
        // Sadece local storage'ı güncelle
        const guncel = [yeniArac, ...mevcut.filter((a: Arac) => a.id !== yeniArac.id)];
        await saveAraclar(guncel);
        return yeniArac;
      }
    }
  } catch (error) {
    console.warn('API addArac hatası, yerel olarak kaydediliyor:', error);
  }

  // Çevrimdışı / Hata durumu
  const mevcut = await getAraclar();
  const zaman = new Date().toISOString();
  const yeniArac: Arac = {
    ...data,
    id: yeniIdOlustur(),
    bildirimler: {
      ...VARSAYILAN_BILDIRIMLER,
      ...data.bildirimler,
    },
    olusturmaTarihi: zaman,
    guncellemeTarihi: zaman,
  };

  const guncel = [yeniArac, ...mevcut];
  await saveAraclar(guncel);
  return yeniArac;
};

export const updateArac = async (arac: Arac) => {
  const headers = await getHeaders();
  let guncellenecekArac = { ...arac, guncellemeTarihi: new Date().toISOString() };
  try {
    const res = await fetch(`${API_URL}/araclar/${arac.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(arac),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) guncellenecekArac = json.data;
    }
  } catch (error) {
    console.warn('API updateArac hatası, yerel olarak güncelleniyor:', error);
  }

  const mevcut = await getAraclar();
  const guncel = mevcut.map((kalem) =>
    kalem.id === guncellenecekArac.id ? guncellenecekArac : kalem,
  );
  await saveAraclar(guncel);
};

export const deleteArac = async (id: string) => {
  const headers = await getHeaders();
  try {
    await fetch(`${API_URL}/araclar/${id}`, { method: 'DELETE', headers });
  } catch (error) {
    console.warn('API deleteArac hatası, yerel olarak siliniyor:', error);
  }

  const mevcut = await getAraclar();
  await saveAraclar(mevcut.filter((arac) => arac.id !== id));
  await AsyncStorage.removeItem(bildirimKey(id));
};

export const getOnboardingTamamlandi = async () =>
  (await AsyncStorage.getItem(ONBOARDING_ANAHTARI)) === 'true';

export const setOnboardingTamamlandi = async () => {
  await AsyncStorage.setItem(ONBOARDING_ANAHTARI, 'true');
};

export const getVarsayilanBildirimSaati = async () => {
  try {
    const res = await fetch(`${API_URL}/ayarlar/bildirim-saati`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data?.saat) {
        await AsyncStorage.setItem(BILDIRIM_SAATI_ANAHTARI, json.data.saat);
        return json.data.saat;
      }
    }
  } catch (error) {
    console.warn('API getVarsayilanBildirimSaati hatası:', error);
  }
  return (await AsyncStorage.getItem(BILDIRIM_SAATI_ANAHTARI)) ?? VARSAYILAN_BILDIRIMLER.saat;
};

export const setVarsayilanBildirimSaati = async (saat: string) => {
  try {
    await fetch(`${API_URL}/ayarlar/bildirim-saati`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saat }),
    });
  } catch (error) {
    console.warn('API setVarsayilanBildirimSaati hatası:', error);
  }
  await AsyncStorage.setItem(BILDIRIM_SAATI_ANAHTARI, saat);
};

export const getCachedBildirimIzni = async (): Promise<BildirimIzinDurumu> =>
  ((await AsyncStorage.getItem(BILDIRIM_IZIN_ANAHTARI)) as BildirimIzinDurumu | null) ??
  'undetermined';

export const setCachedBildirimIzni = async (durum: BildirimIzinDurumu) => {
  await AsyncStorage.setItem(BILDIRIM_IZIN_ANAHTARI, durum);
};

export const getAracBildirimIdleri = async (aracId: string) => {
  const json = await AsyncStorage.getItem(bildirimKey(aracId));
  return json ? (JSON.parse(json) as string[]) : [];
};

export const setAracBildirimIdleri = async (aracId: string, idler: string[]) => {
  await AsyncStorage.setItem(bildirimKey(aracId), JSON.stringify(idler));
};

export const clearAracBildirimIdleri = async (aracId: string) => {
  await AsyncStorage.removeItem(bildirimKey(aracId));
};

export const clearTumBildirimKayitlari = async () => {
  const anahtarlar = await AsyncStorage.getAllKeys();
  const silinecekler = anahtarlar.filter((anahtar) => anahtar.startsWith(BILDIRIM_KEY_PREFIX));

  if (silinecekler.length) {
    await AsyncStorage.multiRemove(silinecekler);
  }
};

export const clearTumVeriler = async () => {
  const headers = await getHeaders();

  try {
    await fetch(`${API_URL}/yonetim/tum-veriler`, { method: 'DELETE', headers });
  } catch (error) {
    console.warn('API clearTumVeriler hatası:', error);
  }
  
  const anahtarlar = await AsyncStorage.getAllKeys();
  const silinecekler = anahtarlar.filter((anahtar) => anahtar.startsWith(UYGULAMA_PREFIX));

  if (silinecekler.length) {
    await AsyncStorage.multiRemove(silinecekler);
  }
};
