/**
 * tests/backend/apiLayer.test.ts
 *
 * apiLayer.ts için birim testleri.
 * Kapsam: alan doğrulama fonksiyonları, getClientIP, successResponse, errorResponse
 *
 * Çalıştırma: npx jest tests/backend/apiLayer.test.ts
 */

import {
  gecerliISOTarihMi,
  gecerliSaatMi,
  gecerliPlakaMi,
  getClientIP,
  successResponse,
  errorResponse,
} from '../../backend/apiLayer';

// ─── Mock Request / Response ──────────────────────────────────────────────────

function mockRequest(overrides: Partial<any> = {}): any {
  return {
    headers: {},
    socket: { remoteAddress: '127.0.0.1' },
    method: 'GET',
    ...overrides,
  };
}

function mockResponse(): any {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
}

// ─── gecerliISOTarihMi ────────────────────────────────────────────────────────

describe('gecerliISOTarihMi()', () => {
  test.each([
    ['2026-01-15', true],
    ['2000-12-31', true],
    ['2026-1-5', false],
    ['26-01-15', false],
    ['2026/01/15', false],
    ['', false],
    [null, false],
    [123, false],
    ['2026-13-01', false],
    ['2026-00-10', false],
  ])('"%s" → %s', (girdi, beklenen) => {
    expect(gecerliISOTarihMi(girdi)).toBe(beklenen);
  });
});

// ─── gecerliSaatMi ────────────────────────────────────────────────────────────

describe('gecerliSaatMi()', () => {
  test.each([
    ['09:00', true],
    ['23:59', true],
    ['00:00', true],
    ['24:00', false],
    ['9:00', false],
    ['09:60', false],
    ['', false],
    [null, false],
  ])('"%s" → %s', (girdi, beklenen) => {
    expect(gecerliSaatMi(girdi)).toBe(beklenen);
  });
});

// ─── gecerliPlakaMi ───────────────────────────────────────────────────────────

describe('gecerliPlakaMi()', () => {
  test.each([
    ['34ABC123', true],
    ['06XYZ789', true],
    ['1A1', false],       // tek basamak
    ['', false],
    [null, false],
    ['ABCDE', false],     // rakam yok
  ])('"%s" → %s', (girdi, beklenen) => {
    expect(gecerliPlakaMi(girdi)).toBe(beklenen);
  });
});

// ─── getClientIP ──────────────────────────────────────────────────────────────

describe('getClientIP()', () => {
  test('x-forwarded-for başlığından ilk IP alınır', () => {
    const req = mockRequest({ headers: { 'x-forwarded-for': '203.0.113.5, 70.41.3.18' } });
    expect(getClientIP(req)).toBe('203.0.113.5');
  });

  test('Başlık yoksa socket.remoteAddress kullanılır', () => {
    const req = mockRequest({ socket: { remoteAddress: '192.168.1.100' } });
    expect(getClientIP(req)).toBe('192.168.1.100');
  });

  test('Her iki kaynak da yoksa "unknown" döner', () => {
    const req = mockRequest({ headers: {}, socket: {} });
    expect(getClientIP(req)).toBe('unknown');
  });
});

// ─── successResponse ──────────────────────────────────────────────────────────

describe('successResponse()', () => {
  test('Varsayılan 200 status kodu kullanır', () => {
    const res = mockResponse();
    successResponse(res, { test: true });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('Özel status kodu desteklenir', () => {
    const res = mockResponse();
    successResponse(res, null, 'Oluşturuldu', 201);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('success: true içerir', () => {
    const res = mockResponse();
    successResponse(res, { veri: 'test' }, 'Tamam');
    const gönderilen = res.json.mock.calls[0][0];
    expect(gönderilen.success).toBe(true);
  });

  test('meta.version alanı içerir', () => {
    const res = mockResponse();
    successResponse(res, null);
    const gönderilen = res.json.mock.calls[0][0];
    expect(gönderilen.meta).toHaveProperty('version');
  });
});

// ─── errorResponse ────────────────────────────────────────────────────────────

describe('errorResponse()', () => {
  test('Varsayılan 500 status kodu kullanır', () => {
    const res = mockResponse();
    errorResponse(res, 'Hata oluştu');
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('success: false içerir', () => {
    const res = mockResponse();
    errorResponse(res, 'Test hatası', 404);
    const gönderilen = res.json.mock.calls[0][0];
    expect(gönderilen.success).toBe(false);
    expect(gönderilen.error).toBe('Test hatası');
  });

  test('meta.timestamp alanı içerir', () => {
    const res = mockResponse();
    errorResponse(res, 'Hata', 400);
    const gönderilen = res.json.mock.calls[0][0];
    expect(gönderilen.meta).toHaveProperty('timestamp');
  });
});
