import type { Arac } from '../types/Arac';
import { AFFILIATE_URLS, SIGORTAM_AFFILIATE_URL } from '../constants/apiKeys';
import { API_URL } from './apiConfig';

const SIGORTA_TIMEOUT_MS = 9000;

const SAGLAYICILAR = [
  {
    id: 'quick',
    name: 'Quick Sigorta',
    base: 10850,
    rating: 4.2,
    badge: 'Ekonomik',
    highlights: ['Trafik sigortasi odakli', 'Hizli teklif akisi'],
  },
  {
    id: 'aksigorta',
    name: 'Aksigorta',
    base: 12100,
    rating: 4.4,
    badge: 'Dengeli',
    highlights: ['Yaygin acente agi', 'Dijital police takibi'],
  },
  {
    id: 'anadolu',
    name: 'Anadolu Sigorta',
    base: 13450,
    rating: 4.6,
    badge: 'Guclu kapsam',
    highlights: ['Guclu hasar hizmeti', 'Ek teminat secenekleri'],
  },
  {
    id: 'allianz',
    name: 'Allianz',
    base: 13900,
    rating: 4.7,
    badge: 'Premium',
    highlights: ['Yuksek hizmet puani', 'Genis asistans agi'],
  },
  {
    id: 'mapfre',
    name: 'Mapfre',
    base: 12750,
    rating: 4.3,
    badge: 'Alternatif',
    highlights: ['Rekabetci teklif araligi', 'Servis agi destegi'],
  },
];

export type TeklifKaynak = 'backend' | 'estimate';

export type Teklif = {
  id: string;
  name: string;
  price: number;
  minPrice: number;
  maxPrice: number;
  currency: 'TRY';
  rating?: number;
  badge?: string;
  coverageType: 'trafik';
  highlights: string[];
  redirectUrl?: string;
  source: TeklifKaynak;
  lastUpdated: string;
  raw?: unknown;
};

const fiyatYuvarla = (value: number) => Math.max(0, Math.round(value / 50) * 50);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const plakaKatsayisi = (plaka?: string) => {
  const temiz = (plaka ?? '').replace(/\s+/g, '').toUpperCase();
  if (!temiz) return 1;

  const hash = temiz.split('').reduce((toplam, karakter) => toplam + karakter.charCodeAt(0), 0);
  return 0.94 + (hash % 15) / 100;
};

const gunFarki = (dateString?: string | null) => {
  if (!dateString) return undefined;

  const target = new Date(dateString);
  if (Number.isNaN(target.getTime())) return undefined;

  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const aracKatsayisi = (arac?: Arac) => {
  if (!arac) return 1.08;

  const yas = clamp(new Date().getFullYear() - arac.yil, 0, 30);
  const yasKatsayisi = clamp(0.94 + yas * 0.024, 0.94, 1.52);
  const sigortaKalanGun = gunFarki(arac.sigortaTarihi);
  const yenilemeKatsayisi =
    typeof sigortaKalanGun !== 'number' ? 1.04 : sigortaKalanGun < 0 ? 1.1 : sigortaKalanGun <= 15 ? 1.04 : 1;

  return yasKatsayisi * yenilemeKatsayisi * plakaKatsayisi(arac.plaka);
};

export const sigortaTeklifURLiOlustur = (arac: Arac, insurerId?: string) => {
  const base = insurerId && AFFILIATE_URLS[insurerId] ? AFFILIATE_URLS[insurerId] : SIGORTAM_AFFILIATE_URL;
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

const normalizeBackendTeklif = (item: any, index: number, arac?: Arac): Teklif | null => {
  const price = Number(item?.price ?? item?.premium ?? item?.amount ?? item?.fiyat);
  if (!Number.isFinite(price) || price <= 0) return null;

  const id = String(item?.id ?? item?.insurerId ?? item?.companyCode ?? `backend-${index}`);
  const provider = SAGLAYICILAR.find((saglayici) => saglayici.id === id);
  const name = String(item?.name ?? item?.companyName ?? item?.sirketAdi ?? provider?.name ?? 'Sigorta Sirketi');
  const roundedPrice = fiyatYuvarla(price);

  return {
    id,
    name,
    price: roundedPrice,
    minPrice: fiyatYuvarla(Number(item?.minPrice ?? item?.min ?? roundedPrice * 0.96)),
    maxPrice: fiyatYuvarla(Number(item?.maxPrice ?? item?.max ?? roundedPrice * 1.12)),
    currency: 'TRY',
    rating: Number.isFinite(Number(item?.rating)) ? Number(item.rating) : provider?.rating,
    badge: item?.badge ?? provider?.badge,
    coverageType: 'trafik',
    highlights:
      Array.isArray(item?.highlights) && item.highlights.length > 0
        ? item.highlights.map(String)
        : provider?.highlights ?? ['Canli teklif kaynagindan alindi'],
    redirectUrl: typeof item?.redirectUrl === 'string' ? item.redirectUrl : arac ? sigortaTeklifURLiOlustur(arac, id) : undefined,
    source: 'backend',
    lastUpdated: new Date().toISOString(),
    raw: item,
  };
};

export const tahminiTeklifleriOlustur = (arac?: Arac): Teklif[] => {
  const katsayi = aracKatsayisi(arac);

  return SAGLAYICILAR.map((saglayici, index) => {
    const price = fiyatYuvarla(saglayici.base * katsayi * (1 + index * 0.018));

    return {
      id: saglayici.id,
      name: saglayici.name,
      price,
      minPrice: fiyatYuvarla(price * 0.92),
      maxPrice: fiyatYuvarla(price * 1.16),
      currency: 'TRY' as const,
      rating: saglayici.rating,
      badge: saglayici.badge,
      coverageType: 'trafik' as const,
      highlights: saglayici.highlights,
      redirectUrl: arac ? sigortaTeklifURLiOlustur(arac, saglayici.id) : SIGORTAM_AFFILIATE_URL,
      source: 'estimate' as const,
      lastUpdated: new Date().toISOString(),
    };
  }).sort((ilk, ikinci) => ilk.price - ikinci.price);
};

export const fetchQuotesFromBackend = async (arac: Arac): Promise<Teklif[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SIGORTA_TIMEOUT_MS);
  const url = `${API_URL}/sigorta/teklifler`;

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(arac),
      signal: controller.signal,
    });

    const body = await resp.json().catch(() => null);

    if (!resp.ok) throw new Error(body?.error ?? 'Teklifler alinamadi');

    const rawList: unknown[] = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
    const teklifler = rawList
      .map((item, index) => normalizeBackendTeklif(item, index, arac))
      .filter((item): item is Teklif => Boolean(item))
      .sort((ilk, ikinci) => ilk.price - ikinci.price);

    if (teklifler.length === 0) {
      throw new Error('Teklif listesi bos dondu');
    }

    return teklifler;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const sigortaTeklifleriniGetir = async (arac?: Arac): Promise<Teklif[]> => {
  if (!arac) return tahminiTeklifleriOlustur();

  try {
    return await fetchQuotesFromBackend(arac);
  } catch (error: any) {
    console.warn('[sigortaService] Backend teklifleri alinamadi, tahmini liste kullaniliyor:', error?.message ?? error);
    return tahminiTeklifleriOlustur(arac);
  }
};
