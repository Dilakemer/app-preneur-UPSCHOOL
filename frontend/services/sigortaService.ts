import type { Arac } from '../types/Arac';
import { SIGORTAM_AFFILIATE_URL } from '../constants/apiKeys';
import { API_URL } from './apiConfig';

import { AFFILIATE_URLS } from '../constants/apiKeys';

export const sigortaTeklifURLiOlustur = (arac: Arac, insurerId?: string) => {
  const base = (insurerId && AFFILIATE_URLS[insurerId]) ? AFFILIATE_URLS[insurerId] : SIGORTAM_AFFILIATE_URL;
  const params = new URLSearchParams({
    utm_source: 'caremind',
    utm_medium: 'app',
    utm_campaign: 'sigorta_yenileme',
    lead_id: arac.id,
    plaka: arac.plaka,
    marka: arac.marka,
    model: arac.model,
    yil: String(arac.yil),
  });

  return `${base}?${params.toString()}`;
};

export const internetBaglantisiVarMi = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch('https://clients3.google.com/generate_204', {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
};

export type Teklif = { id: string; name: string; price: number; raw?: any };

export const fetchQuotesFromBackend = async (arac: Arac): Promise<Teklif[]> => {
  const url = `${API_URL}/sigorta/teklifler`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arac),
  });

  if (!resp.ok) throw new Error('Teklifler alınamadı');
  const body = await resp.json();
  // apiLayer uses { success, data }
  return body.data ?? [];
};
