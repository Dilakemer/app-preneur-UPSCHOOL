/**
 * tests/backend/aiService.test.ts
 *
 * aiService.ts için birim testleri.
 * Kapsam: rateLimitAsildi, onbellekTemizle, aiDurumRaporu, promptOlustur (dolaylı)
 *
 * Çalıştırma: npx jest tests/backend/aiService.test.ts
 */

import { rateLimitAsildi, onbellekTemizle, aiDurumRaporu } from '../../backend/aiService';

// Her testten önce önbelleği ve rate-limit durumunu temizle
beforeEach(() => {
  onbellekTemizle();
});

// ─── rateLimitAsildi ──────────────────────────────────────────────────────────

describe('rateLimitAsildi()', () => {
  test('İlk istekte false döndürür', () => {
    expect(rateLimitAsildi('test-kimlik-1')).toBe(false);
  });

  test('Farklı kimlikler birbirini etkilemez', () => {
    for (let i = 0; i < 15; i++) rateLimitAsildi('kimlik-A');
    expect(rateLimitAsildi('kimlik-B')).toBe(false);
  });

  test('20 istek sonrasında sınır aşıldı döndürür', () => {
    const kimlik = 'test-rate-limit';
    // 20 izinli istek
    for (let i = 0; i < 20; i++) {
      rateLimitAsildi(kimlik);
    }
    // 21. istek sınırı aşmalı
    expect(rateLimitAsildi(kimlik)).toBe(true);
  });

  test('Boş string kimlik desteklenir', () => {
    expect(rateLimitAsildi('')).toBe(false);
  });
});

// ─── onbellekTemizle ──────────────────────────────────────────────────────────

describe('onbellekTemizle()', () => {
  test('Hata fırlatmadan çalışır', () => {
    expect(() => onbellekTemizle()).not.toThrow();
  });

  test('Ardı ardına çağrılabilir', () => {
    onbellekTemizle();
    onbellekTemizle();
    expect(() => onbellekTemizle()).not.toThrow();
  });
});

// ─── aiDurumRaporu ────────────────────────────────────────────────────────────

describe('aiDurumRaporu()', () => {
  test('Beklenen anahtarları içerir', () => {
    const rapor = aiDurumRaporu();
    expect(rapor).toHaveProperty('onbellekBoyutu');
    expect(rapor).toHaveProperty('rateLimitKayitSayisi');
    expect(rapor).toHaveProperty('desteklenenTipler');
  });

  test('Desteklenen tipler doğru değerleri içerir', () => {
    const { desteklenenTipler } = aiDurumRaporu();
    expect(desteklenenTipler).toContain('tavsiye');
    expect(desteklenenTipler).toContain('ozet');
    expect(desteklenenTipler).toContain('uyari');
    expect(desteklenenTipler).toHaveLength(3);
  });

  test('Başlangıçta önbellek boyutu 0 olur', () => {
    onbellekTemizle();
    expect(aiDurumRaporu().onbellekBoyutu).toBe(0);
  });
});
