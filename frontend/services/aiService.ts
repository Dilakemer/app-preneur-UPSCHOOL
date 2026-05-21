import { Platform } from 'react-native';
import type { Arac } from '../types/Arac';

export type AITip = 'tavsiye' | 'ozet' | 'uyari';

const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === 'android') return 'http://10.0.2.2:3001/api';
  return 'http://localhost:3001/api';
};

const API_URL = getApiUrl();

export const aiService = {
  getAracTavsiyesi: async (arac: Arac, tip: AITip = 'tavsiye'): Promise<string> => {
    try {
      const res = await fetch(`${API_URL}/ai/tavsiye?tip=${encodeURIComponent(tip)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arac),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success || typeof json.data?.tavsiye !== 'string') {
        throw new Error(json?.error ?? `AI API hata kodu: ${res.status}`);
      }

      return json.data.tavsiye.trim();
    } catch (error: any) {
      console.error('[aiService] Hata:', error?.message ?? error);
      return 'AI danismanina su an ulasilamiyor. Lutfen internet baglantinizi ve sunucu ayarlarini kontrol edin.';
    }
  },
};
