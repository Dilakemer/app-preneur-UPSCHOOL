/**
 * apiLayer.ts — CareMind Merkezi API Katmanı
 *
 * Sorumluluklar:
 *  - İstek/yanıt loglama
 *  - API versiyonlama (v1)
 *  - Rate-limit başlıkları
 *  - Tutarlı hata zarflama
 *  - İstek doğrulama yardımcıları
 */

import { Request, Response, NextFunction, Router } from 'express';
import type { ApiResponse } from './types';

// ─── Sabitler ─────────────────────────────────────────────────────────────────

export const API_VERSION = 'v1';

/** Global basit rate-limit tablosu (IP bazlı) */
const ipRateMap = new Map<string, { sayac: number; sifirlamaZamani: number }>();
const IP_LIMIT = 100;          // pencere başına maksimum istek
const IP_WINDOW_MS = 60_000;   // 1 dakika

// ─── Yardımcı Fonksiyonlar ────────────────────────────────────────────────────

/** İstemci IP'sini güvenli şekilde çözer (proxy desteği dahil) */
export function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress ?? 'unknown';
}

/** Başarılı API yanıtı oluşturur */
export function successResponse<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      version: API_VERSION,
    },
  } as ApiResponse<T> & { meta: object });
}

/** Hatalı API yanıtı oluşturur */
export function errorResponse(
  res: Response,
  error: string,
  statusCode = 500,
  details?: string,
): Response {
  return res.status(statusCode).json({
    success: false,
    error,
    message: details,
    meta: {
      timestamp: new Date().toISOString(),
      version: API_VERSION,
    },
  } as ApiResponse<null> & { meta: object });
}

// ─── Middleware'ler ───────────────────────────────────────────────────────────

/**
 * İstek loglama middleware'i.
 * Her isteği [timestamp] METHOD /path — IP formatında loglar.
 */
export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  const ts = new Date().toISOString();
  const ip = getClientIP(req);
  console.log(`[${ts}] ${req.method.padEnd(7)} ${req.path} — ${ip}`);
  next();
}

/**
 * IP tabanlı global rate-limit middleware'i.
 * Sınır aşılırsa 429 döner ve standart başlıklar ekler.
 */
export function globalRateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = getClientIP(req);
  const simdi = Date.now();
  const girdi = ipRateMap.get(ip);

  if (!girdi || simdi - girdi.sifirlamaZamani > IP_WINDOW_MS) {
    ipRateMap.set(ip, { sayac: 1, sifirlamaZamani: simdi });
  } else if (girdi.sayac >= IP_LIMIT) {
    res.setHeader('Retry-After', '60');
    res.setHeader('X-RateLimit-Limit', String(IP_LIMIT));
    res.setHeader('X-RateLimit-Remaining', '0');
    errorResponse(res, 'Çok fazla istek. 60 saniye sonra tekrar deneyin.', 429);
    return;
  } else {
    girdi.sayac += 1;
  }

  const kalan = IP_LIMIT - (ipRateMap.get(ip)?.sayac ?? 0);
  res.setHeader('X-RateLimit-Limit', String(IP_LIMIT));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(kalan, 0)));
  next();
}

/**
 * Content-Type doğrulama middleware'i.
 * POST/PUT isteklerinde application/json zorunlu.
 */
export function requireJson(req: Request, res: Response, next: NextFunction): void {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const ct = req.headers['content-type'] ?? '';
    if (!ct.includes('application/json')) {
      errorResponse(
        res,
        'Content-Type application/json olmalıdır',
        415,
        'Unsupported Media Type',
      );
      return;
    }
  }
  next();
}

/**
 * Güvenlik başlıkları middleware'i.
 * Temel güvenlik başlıklarını her yanıta ekler.
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-API-Version', API_VERSION);
  next();
}

// ─── API Versiyonlama Router'ı ────────────────────────────────────────────────

/**
 * v1 API router'ı oluşturur ve tüm API katmanı middleware'lerini uygular.
 * Kullanım: `app.use('/api/v1', createApiRouter(appRouter))`
 */
export function createApiRouter(appRouter: Router): Router {
  const versionedRouter = Router();

  // Katman middleware'leri (sıra önemli)
  versionedRouter.use(securityHeaders);
  versionedRouter.use(globalRateLimit);
  versionedRouter.use(requireJson);
  versionedRouter.use(requestLogger);

  // Uygulama rotalarını bağla
  versionedRouter.use('/', appRouter);

  return versionedRouter;
}

// ─── Alan Doğrulama Yardımcıları ─────────────────────────────────────────────

/** Tarih string'inin ISO-8601 (YYYY-MM-DD) formatında olup olmadığını kontrol eder */
export function gecerliISOTarihMi(deger: unknown): boolean {
  if (typeof deger !== 'string') return false;
  return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(deger);
}

/** Saat string'inin HH:mm formatında olup olmadığını kontrol eder */
export function gecerliSaatMi(deger: unknown): boolean {
  if (typeof deger !== 'string') return false;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(deger);
}

/** Plaka string'inin temel formatını doğrular (2-3 rakam + 1-3 harf + 0-4 rakam) */
export function gecerliPlakaMi(deger: unknown): boolean {
  if (typeof deger !== 'string') return false;
  return /^[0-9]{2,3}[A-ZÇĞİÖŞÜa-zçğışöüş]{1,3}[0-9]{0,4}$/.test(deger.replace(/\s/g, ''));
}
