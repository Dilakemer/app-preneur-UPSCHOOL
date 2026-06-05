import axios from 'axios';
import type { Arac } from './types';

type InsurerConfig = {
  id: string;
  name: string;
  endpoint?: string; // optional external API
  apiKeyEnv?: string; // env var name for api key
};

const INSURERS: InsurerConfig[] = [
  { id: 'allianz', name: 'Allianz', endpoint: process.env.ALLIANZ_API_URL, apiKeyEnv: 'ALLIANZ_API_KEY' },
  { id: 'aksigorta', name: 'Aksigorta', endpoint: process.env.AKSIGORTA_API_URL, apiKeyEnv: 'AKSIGORTA_API_KEY' },
  { id: 'anadolu', name: 'Anadolu Sigorta', endpoint: process.env.ANADOLU_API_URL, apiKeyEnv: 'ANADOLU_API_KEY' },
];

// Simple in-memory cache
const cache = new Map<string, { ts: number; data: any }>();
const TTL = Number(process.env.INSURER_CACHE_TTL_SECONDS ?? '60') * 1000;

const cacheKey = (arac: Arac) => `${arac.plaka}:${arac.yil}:${arac.marka}:${arac.model}`;

export async function fetchQuotes(arac: Arac) {
  const key = cacheKey(arac);
  const now = Date.now();

  const cached = cache.get(key);
  if (cached && now - cached.ts < TTL) return cached.data;

  const promises = INSURERS.map(async (ins) => {
    // If insurer has external endpoint configured, try to call it
    if (ins.endpoint) {
      try {
        const params = { plaka: arac.plaka, marka: arac.marka, model: arac.model, yil: String(arac.yil) };
        const headers: Record<string, string> = { Accept: 'application/json' };
        const keyName = ins.apiKeyEnv;
        if (keyName && process.env[keyName]) headers['x-api-key'] = process.env[keyName] as string;

        const resp = await axios.get(ins.endpoint, { params, headers, timeout: 5000 });
        const body = resp.data;
        return { id: ins.id, name: ins.name, price: body.price ?? null, raw: body };
      } catch (e) {
        // fallthrough to price calc below
      }
    }

    // Fallback price calculation (deterministic)
    const age = Math.max(0, new Date().getFullYear() - arac.yil);
    const base = 1500 + (ins.id.length * 20);
    const price = Math.round(base * (1 + age * 0.02) * (1 + (100 - Math.min(100, arac.yil % 100)) / 1000));
    return { id: ins.id, name: ins.name, price, raw: { fallback: true } };
  });

  const results = await Promise.all(promises);
  cache.set(key, { ts: now, data: results });
  return results;
}

export function clearInsurerCache() {
  cache.clear();
}
