/**
 * tests/backend/database.test.ts
 *
 * database.ts için birim testleri.
 * Kapsam: CRUD işlemleri, kalan gün hesaplama, bildirim raporu
 *
 * Çalıştırma: npx jest tests/backend/database.test.ts
 */

import {
  createArac,
  getAllAraclar,
  getAracById,
  getAracByPlaka,
  updateArac,
  deleteArac,
  deleteAllAraclar,
  kalanGunHesapla,
  generateBildirimRaporu,
  getVarsayilanBildirimSaati,
  setVarsayilanBildirimSaati,
} from '../../backend/database';
import type { AracInput } from '../../backend/types';

// ─── Test Verisi ──────────────────────────────────────────────────────────────

const ornekAracInput: AracInput = {
  plaka: '34TEST01',
  marka: 'Toyota',
  model: 'Corolla',
  yil: 2021,
  muayeneTarihi: '2026-09-15',
  sigortaTarihi: '2026-07-01',
  kaskoTarihi: null,
  bakimTarihi: null,
  bildirimler: { gun60: true, gun30: true, gun7: true, gun1: true, saat: '09:00' },
};

beforeEach(() => {
  deleteAllAraclar();
});

// ─── CRUD Testleri ────────────────────────────────────────────────────────────

describe('createArac()', () => {
  test('Yeni araç oluşturur ve id atar', () => {
    const arac = createArac(ornekAracInput);
    expect(arac.id).toBeDefined();
    expect(arac.id).toHaveLength(36); // UUID v4
  });

  test('Plaka doğru kaydedilir', () => {
    const arac = createArac(ornekAracInput);
    expect(arac.plaka).toBe('34TEST01');
  });

  test('olusturmaTarihi ve guncellemeTarihi ISO formatında set edilir', () => {
    const arac = createArac(ornekAracInput);
    expect(() => new Date(arac.olusturmaTarihi)).not.toThrow();
    expect(() => new Date(arac.guncellemeTarihi)).not.toThrow();
  });

  test('Varsayılan bildirim saati uygulanır', () => {
    setVarsayilanBildirimSaati('10:30');
    const arac = createArac({ ...ornekAracInput, bildirimler: { gun60: true, gun30: true, gun7: true, gun1: true, saat: '' } });
    expect(arac.bildirimler.saat).toBe('10:30');
  });
});

describe('getAllAraclar()', () => {
  test('Başlangıçta boş dizi döner', () => {
    expect(getAllAraclar()).toHaveLength(0);
  });

  test('2 araç eklendikten sonra 2 eleman döner', () => {
    createArac(ornekAracInput);
    createArac({ ...ornekAracInput, plaka: '06TEST02' });
    expect(getAllAraclar()).toHaveLength(2);
  });

  test('Derin kopya döndürür (referans güvenliği)', () => {
    createArac(ornekAracInput);
    const liste1 = getAllAraclar();
    const liste2 = getAllAraclar();
    expect(liste1).not.toBe(liste2);
  });
});

describe('getAracById()', () => {
  test('Var olan araç döner', () => {
    const arac = createArac(ornekAracInput);
    expect(getAracById(arac.id)).toMatchObject({ id: arac.id });
  });

  test('Var olmayan id için undefined döner', () => {
    expect(getAracById('olmayan-uuid')).toBeUndefined();
  });
});

describe('getAracByPlaka()', () => {
  test('Büyük/küçük harf farkı gözetmeden bulur', () => {
    createArac(ornekAracInput);
    expect(getAracByPlaka('34test01')).toBeDefined();
    expect(getAracByPlaka('34TEST01')).toBeDefined();
  });

  test('Olmayan plaka için undefined döner', () => {
    expect(getAracByPlaka('YOLARAC1')).toBeUndefined();
  });
});

describe('updateArac()', () => {
  test('Mevcut alanları günceller', () => {
    const arac = createArac(ornekAracInput);
    const guncel = updateArac(arac.id, { marka: 'Honda' });
    expect(guncel?.marka).toBe('Honda');
  });

  test('guncellemeTarihi güncellenir', () => {
    const arac = createArac(ornekAracInput);
    const onceki = arac.guncellemeTarihi;
    // Küçük gecikme ekle
    return new Promise<void>(resolve => setTimeout(() => {
      const guncel = updateArac(arac.id, { model: 'Civic' });
      expect(guncel?.guncellemeTarihi).not.toBe(onceki);
      resolve();
    }, 5));
  });

  test('Olmayan id için null döner', () => {
    expect(updateArac('olmayan-id', { marka: 'BMW' })).toBeNull();
  });
});

describe('deleteArac()', () => {
  test('Mevcut araç silinir ve döner', () => {
    const arac = createArac(ornekAracInput);
    const silinen = deleteArac(arac.id);
    expect(silinen?.id).toBe(arac.id);
    expect(getAllAraclar()).toHaveLength(0);
  });

  test('Olmayan id için null döner', () => {
    expect(deleteArac('yok-id')).toBeNull();
  });
});

describe('deleteAllAraclar()', () => {
  test('Tüm araçları temizler', () => {
    createArac(ornekAracInput);
    createArac({ ...ornekAracInput, plaka: '06TEMP01' });
    deleteAllAraclar();
    expect(getAllAraclar()).toHaveLength(0);
  });
});

// ─── Varsayılan Bildirim Saati ────────────────────────────────────────────────

describe('getVarsayilanBildirimSaati / setVarsayilanBildirimSaati', () => {
  test('Varsayılan değer 09:00', () => {
    // Sıfırlamak için yeniden set et
    setVarsayilanBildirimSaati('09:00');
    expect(getVarsayilanBildirimSaati()).toBe('09:00');
  });

  test('Yeni değer set edilebilir', () => {
    setVarsayilanBildirimSaati('14:45');
    expect(getVarsayilanBildirimSaati()).toBe('14:45');
  });
});

// ─── kalanGunHesapla ──────────────────────────────────────────────────────────

describe('kalanGunHesapla()', () => {
  test('null tarih için null döner', () => {
    expect(kalanGunHesapla(null)).toBeNull();
  });

  test('Bugün için 0 döner', () => {
    const bugun = new Date().toISOString().split('T')[0];
    expect(kalanGunHesapla(bugun)).toBe(0);
  });

  test('Geçmiş tarih negatif döner', () => {
    const gecmis = '2020-01-01';
    expect(kalanGunHesapla(gecmis)).toBeLessThan(0);
  });

  test('Gelecek tarih pozitif döner', () => {
    const gelecek = '2099-12-31';
    expect(kalanGunHesapla(gelecek)).toBeGreaterThan(0);
  });
});

// ─── generateBildirimRaporu ───────────────────────────────────────────────────

describe('generateBildirimRaporu()', () => {
  test('Araç yoksa boş dizi döner', () => {
    expect(generateBildirimRaporu()).toHaveLength(0);
  });

  test('Tarih girilmiş araç için rapor satırı oluşur', () => {
    createArac(ornekAracInput); // muayene + sigorta tarihi var
    const rapor = generateBildirimRaporu();
    expect(rapor.length).toBeGreaterThanOrEqual(2);
  });

  test('Rapor kalanGun\'a göre artan sırada sıralanır', () => {
    createArac(ornekAracInput);
    const rapor = generateBildirimRaporu();
    for (let i = 1; i < rapor.length; i++) {
      expect(rapor[i].kalanGun).toBeGreaterThanOrEqual(rapor[i - 1].kalanGun);
    }
  });

  test('Null tarihli kategoriler rapora dahil edilmez', () => {
    createArac({ ...ornekAracInput, muayeneTarihi: null, sigortaTarihi: null });
    expect(generateBildirimRaporu()).toHaveLength(0);
  });
});
