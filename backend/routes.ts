import { Router, Request, Response } from 'express';
import {
  getAllAraclar,
  getAracById,
  createArac,
  updateArac,
  deleteArac,
  deleteAllAraclar,
  getVarsayilanBildirimSaati,
  setVarsayilanBildirimSaati,
  getAracByPlaka,
  generateBildirimRaporu,
} from './database';
import { getAIAdvice, sohbetDevamEttir, giderAnaliziYap, onbellekTemizle, aiDurumRaporu, type AIPromptTipi, type SohbetMesaji, type GiderOzeti } from './aiService';
import { fetchQuotes } from './insurers';
import { asyncHandler, validateAracInput } from './middleware';
import { successResponse, errorResponse, getClientIP } from './apiLayer';
import type { Arac, AracInput } from './types';

const router = Router();
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

const getUserEmail = (req: Request) => {
  const eposta = req.headers['x-user-email'];
  return typeof eposta === 'string' && eposta.trim() ? eposta.trim() : null;
};

const adminYetkiliMi = (req: Request) => {
  const headerKey = req.headers['x-admin-api-key'];
  const authHeader = req.headers.authorization;
  const bearerKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const gelenAnahtar = typeof headerKey === 'string' ? headerKey : bearerKey;

  return Boolean(ADMIN_API_KEY && gelenAnahtar && gelenAnahtar === ADMIN_API_KEY);
};

// ============ ARAÇLAR API ============

// GET /api/araclar - Tüm araçları getir
router.get('/araclar', asyncHandler(async (req: Request, res: Response) => {
  const eposta = getUserEmail(req);
  if (!eposta) {
    return successResponse(res, [], 'Giris yapilmadigi icin uzak arac kaydi dondurulmedi');
  }
  const araclar = getAllAraclar(eposta);
  return successResponse(res, araclar, `${araclar.length} araç bulundu`);
}));

// GET /api/araclar/:id - ID ile araç getir
router.get('/araclar/:id', asyncHandler(async (req: Request, res: Response) => {
  const eposta = getUserEmail(req);
  if (!eposta) {
    return errorResponse(res, 'Arac bilgisi icin giris gerekli', 401);
  }

  const arac = getAracById(req.params.id, eposta);

  if (!arac) {
    return errorResponse(res, 'Araç bulunamadı', 404);
  }

  return successResponse(res, arac);
}));

// GET /api/araclar/plaka/:plaka - Plaka ile araç getir
router.get('/araclar/plaka/:plaka', asyncHandler(async (req: Request, res: Response) => {
  const eposta = getUserEmail(req);
  if (!eposta) {
    return errorResponse(res, 'Arac bilgisi icin giris gerekli', 401);
  }

  const arac = getAracByPlaka(req.params.plaka, eposta);

  if (!arac) {
    return errorResponse(res, 'Araç bulunamadı', 404);
  }

  return successResponse(res, arac);
}));

// POST /api/araclar - Yeni araç ekle
router.post('/araclar', asyncHandler(async (req: Request, res: Response) => {
  const eposta = getUserEmail(req);

  if (!eposta) {
    return errorResponse(res, 'Araç eklemek için giriş yapmanız gerekiyor', 401);
  }

  const validation = validateAracInput(req.body);

  if (!validation.valid) {
    return errorResponse(res, 'Validasyon hatası', 400, validation.errors.join(', '));
  }

  if (getAracByPlaka(req.body.plaka, eposta)) {
    return errorResponse(res, 'Bu plakaya sahip bir araç zaten mevcut', 400);
  }

  try {
    const yeniArac = createArac(req.body as AracInput, eposta);
    return successResponse(res, yeniArac, 'Araç başarıyla eklendi', 201);
  } catch {
    return errorResponse(res, 'Araç eklenirken hata oluştu', 500);
  }
}));

// PUT /api/araclar/:id - Araç güncelle
router.put('/araclar/:id', asyncHandler(async (req: Request, res: Response) => {
  const eposta = getUserEmail(req);

  if (!eposta) {
    return errorResponse(res, 'Araç güncellemek için giriş yapmanız gerekiyor', 401);
  }

  const validation = validateAracInput(req.body);

  if (!validation.valid) {
    return errorResponse(res, 'Validasyon hatası', 400, validation.errors.join(', '));
  }

  const mevcut = getAracById(req.params.id, eposta);
  if (!mevcut) {
    return errorResponse(res, 'Araç bulunamadı', 404);
  }

  if (req.body.plaka && req.body.plaka !== mevcut.plaka) {
    if (getAracByPlaka(req.body.plaka, eposta)) {
      return errorResponse(res, 'Bu plakaya sahip başka bir araç zaten mevcut', 400);
    }
  }

  const guncelArac = updateArac(req.params.id, req.body, eposta);

  if (!guncelArac) {
    return errorResponse(res, 'Araç güncellenirken hata oluştu', 500);
  }

  return successResponse(res, guncelArac, 'Araç başarıyla güncellendi');
}));

// DELETE /api/araclar/:id - Araç sil
router.delete('/araclar/:id', asyncHandler(async (req: Request, res: Response) => {
  const eposta = getUserEmail(req);

  if (!eposta) {
    return errorResponse(res, 'Araç silmek için giriş yapmanız gerekiyor', 401);
  }

  const silinmiş = deleteArac(req.params.id, eposta);

  if (!silinmiş) {
    return errorResponse(res, 'Araç bulunamadı', 404);
  }

  return successResponse(res, silinmiş, 'Araç başarıyla silindi');
}));

// ============ AYARLAR API ============

// GET /api/ayarlar/bildirim-saati - Varsayılan bildirim saatini getir
router.get('/ayarlar/bildirim-saati', asyncHandler(async (_req: Request, res: Response) => {
  const saat = getVarsayilanBildirimSaati();
  return successResponse(res, { saat });
}));

// PUT /api/ayarlar/bildirim-saati - Varsayılan bildirim saatini güncelle
router.put('/ayarlar/bildirim-saati', asyncHandler(async (req: Request, res: Response) => {
  const { saat } = req.body;

  if (!saat || typeof saat !== 'string') {
    return errorResponse(res, 'Saat parametresi zorunludur', 400);
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(saat)) {
    return errorResponse(res, 'Geçersiz saat formatı (HH:mm kullanınız)', 400);
  }

  setVarsayilanBildirimSaati(saat);
  return successResponse(res, { saat }, 'Bildirim saati güncellendi');
}));

// ============ RAPORLAR API ============

// GET /api/raporlar/bildirim - Bildirim raporunu getir
router.get('/raporlar/bildirim', asyncHandler(async (_req: Request, res: Response) => {
  const eposta = getUserEmail(_req);
  if (!eposta) {
    return successResponse(res, {
      rapor: [],
      ozet: { toplamArac: 0, yakinda: 0, uyarida: 0, gecikmiş: 0 },
    });
  }

  const rapor = generateBildirimRaporu(eposta);

  const yakinda  = rapor.filter(r => r.kalanGun > 0 && r.kalanGun <= 30).length;
  const uyarida  = rapor.filter(r => r.kalanGun > 0 && r.kalanGun <= 7).length;
  const gecikmiş = rapor.filter(r => r.kalanGun < 0).length;

  return successResponse(res, {
    rapor,
    ozet: { toplamArac: getAllAraclar(eposta).length, yakinda, uyarida, gecikmiş },
  });
}));

// ============ YÖNETİM API ============

// DELETE /api/yonetim/tum-veriler - Tüm verileri sil
router.delete('/yonetim/tum-veriler', asyncHandler(async (req: Request, res: Response) => {
  const eposta = req.headers['x-user-email'] as string | undefined;

  if (eposta) {
    deleteAllAraclar(eposta);
    return successResponse(res, null, 'Kullanici verileri basariyla silindi');
  }

  if (!adminYetkiliMi(req)) {
    return errorResponse(res, 'Yonetim islemi icin yetki gerekli', 403);
  }

  deleteAllAraclar();
  return successResponse(res, null, 'Tum veriler basariyla silindi');
}));

// DELETE /api/yonetim/ai-onbellek - AI önbelleğini temizle
router.delete('/yonetim/ai-onbellek', asyncHandler(async (req: Request, res: Response) => {
  if (!adminYetkiliMi(req)) {
    return errorResponse(res, 'Yonetim islemi icin yetki gerekli', 403);
  }

  onbellekTemizle();
  return successResponse(res, null, 'AI önbelleği temizlendi');
}));

// GET /api/saglik-kontrol - Sunucu sağlık kontrolü
router.get('/saglik-kontrol', asyncHandler(async (_req: Request, res: Response) => {
  return successResponse(res, {
    status: 'online',
    timestamp: new Date().toISOString(),
    aracSayisi: getAllAraclar().length,
    ai: aiDurumRaporu(),
  }, 'Sunucu çalışıyor');
}));

// POST /api/sigorta/teklifler - Araç bilgisine göre sigorta tekliflerini birleştir
router.post('/sigorta/teklifler', asyncHandler(async (req: Request, res: Response) => {
  const arac = req.body;

  if (!arac || !arac.plaka || !arac.yil) {
    return errorResponse(res, 'Araç bilgisi eksik (plaka ve yil gerekli)', 400);
  }

  try {
    const teklifler = await fetchQuotes(arac);
    return successResponse(res, teklifler, 'Teklifler alindi');
  } catch (e) {
    return errorResponse(res, 'Teklifler alınırken hata oluştu', 500);
  }
}));

// ============ AI DANIŞMAN API ============

/**
 * GET /api/ai/tavsiye/:id?tip=tavsiye|ozet|uyari
 * Araç için Gemini AI yanıtı döndürür.
 * Geçerli tip değerleri: tavsiye (varsayılan), ozet, uyari
 */
router.get('/ai/tavsiye/:id', asyncHandler(async (req: Request, res: Response) => {
  const eposta = getUserEmail(req);
  if (!eposta) {
    return errorResponse(res, 'AI tavsiyesi icin giris gerekli', 401);
  }

  const arac = getAracById(req.params.id, eposta);

  if (!arac) {
    return errorResponse(res, 'Araç bulunamadı', 404);
  }

  const izinliTipler: AIPromptTipi[] = ['tavsiye', 'ozet', 'uyari', 'sohbet'];
  const tip = (req.query.tip as AIPromptTipi) ?? 'tavsiye';

  if (!izinliTipler.includes(tip)) {
    return errorResponse(
      res,
      `Geçersiz tip parametresi. İzin verilenler: ${izinliTipler.join(', ')}`,
      400,
    );
  }

  try {
    const kimlik = getClientIP(req);
    const soru = typeof req.query.soru === 'string' ? req.query.soru : undefined;
    const tavsiye = await getAIAdvice(arac, tip, kimlik, soru);
    return successResponse(res, { tavsiye, tip }, 'AI yanıtı başarıyla alındı');
  } catch {
    return errorResponse(res, 'AI tavsiyesi alınırken bir hata oluştu', 500);
  }
}));

// POST /api/ai/tavsiye
// İstemciden gelen araç nesnesini doğrudan kullanarak tavsiye üretir
router.post('/ai/tavsiye', asyncHandler(async (req: Request, res: Response) => {
  const arac = req.body;
  if (!arac || !arac.id) {
    return errorResponse(res, 'Araç bilgisi eksik', 400);
  }

  const izinliTipler: AIPromptTipi[] = ['tavsiye', 'ozet', 'uyari', 'sohbet'];
  const tip = (req.query.tip as AIPromptTipi) ?? 'tavsiye';

  if (!izinliTipler.includes(tip)) {
    return errorResponse(
      res,
      `Geçersiz tip parametresi. İzin verilenler: ${izinliTipler.join(', ')}`,
      400,
    );
  }

  try {
    const kimlik = getClientIP(req);
    const soru = typeof req.body.soru === 'string' ? req.body.soru : undefined;
    const tavsiye = await getAIAdvice(arac, tip, kimlik, soru);
    return successResponse(res, { tavsiye, tip }, 'AI yanıtı başarıyla alındı');
  } catch {
    return errorResponse(res, 'AI tavsiyesi alınırken bir hata oluştu', 500);
  }
}));

// ============ AI SOHBET ============

/**
 * POST /api/ai/sohbet
 * Multi-turn sohbet — Gemini tüm geçmiş konuşmayı görür.
 * Body: { arac: Arac, gecmis: SohbetMesaji[], yeniMesaj: string }
 */
router.post('/ai/sohbet', asyncHandler(async (req: Request, res: Response) => {
  const { arac, gecmis, yeniMesaj } = req.body;

  if (!arac || !arac.id) {
    return errorResponse(res, 'Araç bilgisi eksik', 400);
  }
  if (!yeniMesaj || typeof yeniMesaj !== 'string' || !yeniMesaj.trim()) {
    return errorResponse(res, 'Mesaj boş olamaz', 400);
  }

  const gecmisMesajlar: SohbetMesaji[] = Array.isArray(gecmis) ? gecmis : [];

  try {
    const kimlik = getClientIP(req);
    const yanit = await sohbetDevamEttir(arac, gecmisMesajlar, yeniMesaj.trim(), kimlik);
    return successResponse(res, { yanit, mesajSayisi: gecmisMesajlar.length + 1 }, 'Sohbet yanıtı alındı');
  } catch {
    return errorResponse(res, 'Sohbet yanıtı alınırken hata oluştu', 500);
  }
}));

// ============ AI GİDER ANALİZİ ============

/**
 * POST /api/ai/gider-analiz
 * Araç gider özetini Gemini ile analiz eder.
 * Body: { arac: Arac, giderler: GiderOzeti[], toplamTutar: number, soru?: string }
 */
router.post('/ai/gider-analiz', asyncHandler(async (req: Request, res: Response) => {
  const { arac, giderler, toplamTutar, soru } = req.body;

  if (!arac || !arac.id) {
    return errorResponse(res, 'Araç bilgisi eksik', 400);
  }
  if (!Array.isArray(giderler) || giderler.length === 0) {
    return errorResponse(res, 'Gider verisi boş veya eksik', 400);
  }

  const giderListesi: GiderOzeti[] = giderler;
  const toplam: number = typeof toplamTutar === 'number' ? toplamTutar : 0;

  try {
    const kimlik = getClientIP(req);
    const analiz = await giderAnaliziYap(arac, giderListesi, toplam, kimlik, soru);
    return successResponse(res, { analiz }, 'Gider analizi tamamlandı');
  } catch {
    return errorResponse(res, 'Gider analizi yapılırken hata oluştu', 500);
  }
}));

export default router;
