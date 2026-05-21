global.fetch = jest.fn();

import { aiService } from '../../frontend/services/aiService';
import type { Arac } from '../../frontend/types/Arac';

const ornekArac: Arac = {
  id: 'abc-123',
  plaka: '34ABC1234',
  marka: 'Toyota',
  model: 'Corolla',
  yil: 2022,
  muayeneTarihi: '2026-06-01',
  sigortaTarihi: null,
  kaskoTarihi: null,
  bakimTarihi: null,
  bildirimler: { gun60: true, gun30: true, gun7: true, gun1: true, saat: '09:00' },
  olusturmaTarihi: '2026-05-21T00:00:00.000Z',
  guncellemeTarihi: '2026-05-21T00:00:00.000Z',
};

beforeEach(() => {
  (global.fetch as jest.Mock).mockReset();
});

describe('aiService.getAracTavsiyesi()', () => {
  test('basarili backend yanitinda tavsiye metnini dondurur', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { tavsiye: 'Muayene tarihinize dikkat edin.' },
      }),
    });

    const sonuc = await aiService.getAracTavsiyesi(ornekArac);
    expect(sonuc).toBe('Muayene tarihinize dikkat edin.');
  });

  test('backend hata yanitinda fallback mesaj dondurur', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        error: 'AI hatasi',
      }),
    });

    const sonuc = await aiService.getAracTavsiyesi(ornekArac);
    expect(typeof sonuc).toBe('string');
    expect(sonuc.length).toBeGreaterThan(0);
  });

  test('ag hatasinda fallback mesaj dondurur', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    const sonuc = await aiService.getAracTavsiyesi(ornekArac);
    expect(typeof sonuc).toBe('string');
    expect(sonuc.length).toBeGreaterThan(0);
  });

  test('backend AI proxy endpointini dogru tip ile cagirir', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { tavsiye: 'Test' } }),
    });

    await aiService.getAracTavsiyesi(ornekArac, 'ozet');
    const cagriURL = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    const cagriOpsiyonlari = (global.fetch as jest.Mock).mock.calls[0][1] as RequestInit;
    expect(cagriURL).toContain('/ai/tavsiye?tip=ozet');
    expect(cagriOpsiyonlari.method).toBe('POST');
    expect(JSON.parse(cagriOpsiyonlari.body as string)).toMatchObject({ id: 'abc-123' });
  });
});
