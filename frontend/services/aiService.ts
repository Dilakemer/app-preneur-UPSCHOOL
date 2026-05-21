import { API_URL } from './apiConfig';
import type { Arac } from '../types/Arac';

export type AITip = 'tavsiye' | 'ozet' | 'uyari';

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
