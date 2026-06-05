import { API_URL } from './apiConfig';
import type { Arac } from '../types/Arac';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AITip = 'tavsiye' | 'ozet' | 'uyari';

const AI_TIMEOUT_MS = 14000;
const FALLBACK_MESAJI =
  'AI danismanina su an ulasilamiyor. Internet baglantinizi ve sunucu ayarlarini kontrol edin.';

const getHeaders = async () => {
  const eposta = await AsyncStorage.getItem('@caremind:kayitliEposta');

  return {
    'Content-Type': 'application/json',
    ...(eposta ? { 'X-User-Email': eposta.trim() } : {}),
  };
};

export const aiService = {
  getAracTavsiyesi: async (arac: Arac, tip: AITip = 'tavsiye', soru?: string): Promise<string> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    try {
      const headers = await getHeaders();
      const res = await fetch(`${API_URL}/ai/tavsiye?tip=${encodeURIComponent(tip)}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...arac, soru: soru?.trim() || undefined }),
        signal: controller.signal,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success || typeof json.data?.tavsiye !== 'string') {
        throw new Error(json?.error ?? `AI API hata kodu: ${res.status}`);
      }

      return json.data.tavsiye.trim();
    } catch (error: any) {
      console.error('[aiService] Hata:', error?.message ?? error);
      return FALLBACK_MESAJI;
    } finally {
      clearTimeout(timeout);
    }
  },
};
