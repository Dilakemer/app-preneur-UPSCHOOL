import axios from 'axios';
import dotenv from 'dotenv';
import type { Arac } from './types';

dotenv.config();

// ─── Yapılandırma ────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/** Önbellek TTL (milisaniye) — varsayılan 10 dakika */
const CACHE_TTL_MS = 10 * 60 * 1000;
/** Pencere başına maksimum AI isteği (rate-limit) */
const RATE_LIMIT_MAX = 20;
/** Rate-limit penceresi (milisaniye) — 1 dakika */
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

// ─── Tipler ──────────────────────────────────────────────────────────────────

export type AIPromptTipi = 'tavsiye' | 'ozet' | 'uyari';

interface CacheGirdisi {
  sonuc: string;
  zaman: number;
}

interface RateLimitGirdisi {
  sayac: number;
  pencereacilamaTarihi: number;
}

// ─── Dahili Durum ─────────────────────────────────────────────────────────────

const onbellek = new Map<string, CacheGirdisi>();
const rateLimitMap = new Map<string, RateLimitGirdisi>();

// ─── Yardımcı Fonksiyonlar ───────────────────────────────────────────────────

/**
 * Önbellekten geçerli bir yanıt döndürür; yoksa undefined.
 */
function onbellektenAl(anahtar: string): string | undefined {
  const girdi = onbellek.get(anahtar);
  if (!girdi) return undefined;
  if (Date.now() - girdi.zaman > CACHE_TTL_MS) {
    onbellek.delete(anahtar);
    return undefined;
  }
  return girdi.sonuc;
}

/**
 * Sonucu önbelleğe yazar.
 */
function onbellekteKaydet(anahtar: string, sonuc: string): void {
  onbellek.set(anahtar, { sonuc, zaman: Date.now() });
}

/**
 * Kimliğe (IP veya araçId) göre rate-limit kontrolü yapar.
 * Sınır aşıldıysa `true` döner.
 */
export function rateLimitAsildi(kimlik: string): boolean {
  const simdi = Date.now();
  const girdi = rateLimitMap.get(kimlik);

  if (!girdi || simdi - girdi.pencereacilamaTarihi > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(kimlik, { sayac: 1, pencereacilamaTarihi: simdi });
    return false;
  }

  if (girdi.sayac >= RATE_LIMIT_MAX) return true;

  girdi.sayac += 1;
  return false;
}

/**
 * Araç bilgisine ve prompt tipine göre Gemini prompt'u oluşturur.
 */
function promptOlustur(arac: Arac, tip: AIPromptTipi): string {
  const araçSatiri = `${arac.marka} ${arac.model} (${arac.yil}) — Plaka: ${arac.plaka}`;
  const tarihBlok = `
  - Muayene Tarihi : ${arac.muayeneTarihi ?? 'Belirtilmedi'}
  - Sigorta Tarihi : ${arac.sigortaTarihi ?? 'Belirtilmedi'}
  - Kasko Tarihi   : ${arac.kaskoTarihi ?? 'Belirtilmedi'}
  - Bakım Tarihi   : ${arac.bakimTarihi ?? 'Belirtilmedi'}`;

  const tabanTalimat =
    'Yanıtın yalnızca Türkçe olsun. Teknik jargon kullanma. Madde işareti veya başlık ekleme.';

  switch (tip) {
    case 'tavsiye':
      return `Sen bir araç bakım danışmanısın.
${tabanTalimat}
Aşağıdaki araç için en önemli 2-3 bakım/sigorta tavsiyesini maksimum 4 cümlede ver.
Yaklaşan tarihler varsa mutlaka belirt.

Araç: ${araçSatiri}
Tarihler:${tarihBlok}`;

    case 'ozet':
      return `Sen bir araç kayıt asistanısın.
${tabanTalimat}
Aşağıdaki araç bilgilerini 2 cümlede özetle; araç yaşı ve en kritik tarihe dikkat çek.

Araç: ${araçSatiri}
Tarihler:${tarihBlok}`;

    case 'uyari':
      return `Sen acil uyarı sisteminin parçasısın.
${tabanTalimat}
Aşağıdaki araç için 7 gün içinde dolacak veya geçmiş tarihleri belirterek 1-2 cümlelik kritik uyarı yaz.
Hiç yaklaşan tarih yoksa "Yaklaşan kritik tarih bulunmamaktadır." yaz.

Araç: ${araçSatiri}
Tarihler:${tarihBlok}`;

    default:
      return '';
  }
}

// ─── Dışa Aktarılan Servis Fonksiyonları ─────────────────────────────────────

/**
 * Araç bilgisine dayanarak Gemini AI'dan yanıt alır.
 * Önbellek kullanır; API anahtarı yoksa açıklayıcı hata fırlatır.
 *
 * @param arac     Araç nesnesi
 * @param tip      Prompt tipi: 'tavsiye' | 'ozet' | 'uyari'
 * @param kimlik   Rate-limit için tanımlayıcı (IP adresi veya aracId)
 */
export const getAIAdvice = async (
  arac: Arac,
  tip: AIPromptTipi = 'tavsiye',
  kimlik: string = arac.id,
): Promise<string> => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY ortam değişkeni tanımlı değil.');
  }

  // Rate-limit kontrolü
  if (rateLimitAsildi(kimlik)) {
    return 'Çok fazla istek gönderdiniz. Lütfen bir dakika sonra tekrar deneyin.';
  }

  // Önbellek kontrolü
  const cacheAnahtari = `${arac.id}:${tip}`;
  const onbellekYaniti = onbellektenAl(cacheAnahtari);
  if (onbellekYaniti) {
    console.log(`[AI Cache HIT] ${cacheAnahtari}`);
    return onbellekYaniti;
  }

  const prompt = promptOlustur(arac, tip);

  try {
    console.log(`[AI Request] aracId=${arac.id} tip=${tip}`);

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 256,
          temperature: 0.4,
          topP: 0.9,
        },
      },
      { timeout: 12000 },
    );

    const yanit: string =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      'AI yanıtı alınamadı.';

    onbellekteKaydet(cacheAnahtari, yanit);
    console.log(`[AI Cache SET] ${cacheAnahtari}`);

    return yanit;
  } catch (error: any) {
    const mesaj = error.response?.data?.error?.message ?? error.message;
    console.error(`[AI Service Error] ${mesaj}`);

    // Geçici hata yerine önbellekte eski yanıt varsa döndür
    const eskiOnbellek = onbellek.get(cacheAnahtari);
    if (eskiOnbellek) return eskiOnbellek.sonuc;

    return 'Şu anda AI danışmanına ulaşılamıyor. Lütfen daha sonra tekrar deneyiniz.';
  }
};

/**
 * Önbelleği manuel olarak temizler (test ve yönetim amaçlı).
 */
export const onbellekTemizle = (): void => {
  onbellek.clear();
  console.log('[AI Cache] Temizlendi.');
};

/**
 * Mevcut önbellek ve rate-limit istatistiklerini döndürür.
 */
export const aiDurumRaporu = () => ({
  onbellekBoyutu: onbellek.size,
  rateLimitKayitSayisi: rateLimitMap.size,
  desteklenenTipler: ['tavsiye', 'ozet', 'uyari'] as AIPromptTipi[],
});
