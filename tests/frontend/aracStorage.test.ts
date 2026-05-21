/**
 * tests/frontend/aracStorage.test.ts
 *
 * frontend/services/aracStorage.ts için birim testleri.
 * - AsyncStorage tamamen mock'lanır (inline jest.mock)
 * - global.fetch ağ çağrılarını simüle eder (offline-first fallback test edilir)
 *
 * Çalıştırma: npx jest tests/frontend/aracStorage.test.ts
 */

// ─── Mock: AsyncStorage ──────────────────────────────────────────────────────

const _store: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem:    jest.fn(async (key: string) => _store[key] ?? null),
    setItem:    jest.fn(async (key: string, value: string) => { _store[key] = value; }),
    removeItem: jest.fn(async (key: string) => { delete _store[key]; }),
    clear:      jest.fn(async () => { Object.keys(_store).forEach(k => delete _store[k]); }),
    multiRemove:jest.fn(async (keys: string[]) => { keys.forEach(k => delete _store[k]); }),
    getAllKeys:  jest.fn(async () => Object.keys(_store)),
  },
}));

// ─── Mock: React Native ───────────────────────────────────────────────────────

jest.mock('react-native', () => ({
  Platform: { OS: 'ios', select: (o: Record<string, unknown>) => o.ios ?? o.default },
}));

// ─── Mock: expo-constants ─────────────────────────────────────────────────────

jest.mock('expo-constants', () => ({ default: { expoConfig: {} } }));

// ─── Mock: global.fetch — her zaman ağ hatası (offline-first) ────────────────

global.fetch = jest.fn().mockRejectedValue(new Error('Network offline (mock)'));

// ─── Import ───────────────────────────────────────────────────────────────────

import {
  getAraclar,
  addArac,
  updateArac,
  deleteArac,
  clearTumVeriler,
  getVarsayilanBildirimSaati,
  setVarsayilanBildirimSaati,
} from '../../frontend/services/aracStorage';
import type { AracInput } from '../../frontend/types/Arac';

// ─── Test Verisi ──────────────────────────────────────────────────────────────

const ornekInput: AracInput = {
  plaka: '34JEST01',
  marka: 'Volkswagen',
  model: 'Golf',
  yil: 2022,
  muayeneTarihi: '2027-03-01',
  sigortaTarihi: null,
  kaskoTarihi: null,
  bakimTarihi: null,
  bildirimler: { gun60: true, gun30: true, gun7: true, gun1: false, saat: '08:00' },
};

// ─── Yardımcı: _store'u sıfırla ───────────────────────────────────────────────

function storeTemizle() {
  Object.keys(_store).forEach(k => delete _store[k]);
}

beforeEach(() => {
  storeTemizle();
  jest.clearAllMocks();
  // fetch daima ağ hatası versin (offline-first path test edilir)
  (global.fetch as jest.Mock).mockRejectedValue(new Error('Network offline (mock)'));
});

// ─── getAraclar ───────────────────────────────────────────────────────────────

describe('getAraclar()', () => {
  test('AsyncStorage boşken boş dizi döner', async () => {
    const liste = await getAraclar();
    expect(liste).toEqual([]);
  });

  test('AsyncStorage\'da veri varsa döndürür', async () => {
    // Doğrudan store'a JSON yaz
    const araç = { id: 'x1', plaka: '34TEST', marka: 'Test', model: 'Car',
      yil: 2020, muayeneTarihi: null, sigortaTarihi: null, kaskoTarihi: null,
      bakimTarihi: null, bildirimler: { gun60: true, gun30: true, gun7: true, gun1: true, saat: '09:00' },
      olusturmaTarihi: new Date().toISOString(), guncellemeTarihi: new Date().toISOString() };
    _store['@caremind:araclar:guest'] = JSON.stringify([araç]);

    const liste = await getAraclar();
    expect(liste).toHaveLength(1);
    expect(liste[0].plaka).toBe('34TEST');
  });
});

// ─── addArac ──────────────────────────────────────────────────────────────────

describe('addArac()', () => {
  test('Yeni araç oluşturur ve id atar', async () => {
    const arac = await addArac(ornekInput);
    expect(arac.id).toBeDefined();
    expect(typeof arac.id).toBe('string');
    expect(arac.id.length).toBeGreaterThan(0);
  });

  test('olusturmaTarihi ve guncellemeTarihi geçerli ISO formatındadır', async () => {
    const arac = await addArac(ornekInput);
    expect(new Date(arac.olusturmaTarihi).getTime()).not.toBeNaN();
    expect(new Date(arac.guncellemeTarihi).getTime()).not.toBeNaN();
  });

  test('Plaka doğru kaydedilir', async () => {
    const arac = await addArac(ornekInput);
    expect(arac.plaka).toBe('34JEST01');
  });

  test('AsyncStorage\'a persist edilir', async () => {
    await addArac(ornekInput);
    const liste = await getAraclar();
    expect(liste).toHaveLength(1);
  });
});

// ─── updateArac ───────────────────────────────────────────────────────────────

describe('updateArac()', () => {
  test('Marka alanını günceller', async () => {
    const arac = await addArac(ornekInput);
    await updateArac({ ...arac, marka: 'BMW' });
    const liste = await getAraclar();
    expect(liste.find(a => a.id === arac.id)?.marka).toBe('BMW');
  });

  test('guncellemeTarihi güncellenir', async () => {
    const arac = await addArac(ornekInput);
    const onceki = arac.guncellemeTarihi;
    await new Promise(r => setTimeout(r, 10));
    await updateArac({ ...arac, model: 'Passat' });
    const liste = await getAraclar();
    const guncellendi = liste.find(a => a.id === arac.id);
    expect(guncellendi?.guncellemeTarihi).not.toBe(onceki);
  });
});

// ─── deleteArac ───────────────────────────────────────────────────────────────

describe('deleteArac()', () => {
  test('Mevcut aracı siler', async () => {
    const arac = await addArac(ornekInput);
    await deleteArac(arac.id);
    const liste = await getAraclar();
    expect(liste.find(a => a.id === arac.id)).toBeUndefined();
  });

  test('Var olmayan id ile çağrılınca hata fırlatmaz', async () => {
    await expect(deleteArac('olmayan-uuid')).resolves.not.toThrow();
  });
});

// ─── clearTumVeriler ──────────────────────────────────────────────────────────

describe('clearTumVeriler()', () => {
  test('@caremind ile başlayan tüm anahtarları siler', async () => {
    await addArac(ornekInput);
    await addArac({ ...ornekInput, plaka: '06JEST02' });
    // store'da 1 anahtar olmalı (@caremind:araclar:guest)
    expect(Object.keys(_store).some(k => k.startsWith('@caremind'))).toBe(true);

    await clearTumVeriler();
    const kalanlar = Object.keys(_store).filter(k => k.startsWith('@caremind'));
    expect(kalanlar).toHaveLength(0);
  });
});

// ─── Varsayılan Bildirim Saati ────────────────────────────────────────────────

describe('getVarsayilanBildirimSaati() / setVarsayilanBildirimSaati()', () => {
  test('AsyncStorage boşken varsayılan 09:00 döner', async () => {
    const saat = await getVarsayilanBildirimSaati();
    expect(saat).toBe('09:00');
  });

  test('setVarsayilanBildirimSaati persist edilir', async () => {
    await setVarsayilanBildirimSaati('15:30');
    const saat = await getVarsayilanBildirimSaati();
    expect(saat).toBe('15:30');
  });
});
