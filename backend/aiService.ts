import axios from 'axios';
import dotenv from 'dotenv';
import type { Arac } from './types';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
const GEMINI_FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS ?? 'gemini-2.5-flash')
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean);
const GEMINI_MODELS = Array.from(new Set([GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS]));
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const CACHE_TTL_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export type AIPromptTipi = 'tavsiye' | 'ozet' | 'uyari';

interface CacheGirdisi {
  sonuc: string;
  zaman: number;
}

interface RateLimitGirdisi {
  sayac: number;
  pencereAcilmaTarihi: number;
}

const onbellek = new Map<string, CacheGirdisi>();
const rateLimitMap = new Map<string, RateLimitGirdisi>();

function onbellektenAl(anahtar: string): string | undefined {
  const girdi = onbellek.get(anahtar);
  if (!girdi) return undefined;

  if (Date.now() - girdi.zaman > CACHE_TTL_MS) {
    onbellek.delete(anahtar);
    return undefined;
  }

  return girdi.sonuc;
}

function onbellekteKaydet(anahtar: string, sonuc: string): void {
  onbellek.set(anahtar, { sonuc, zaman: Date.now() });
}

function geminiUrlOlustur(model: string): string {
  return `${GEMINI_API_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

export function rateLimitAsildi(kimlik: string): boolean {
  const simdi = Date.now();
  const girdi = rateLimitMap.get(kimlik);

  if (!girdi || simdi - girdi.pencereAcilmaTarihi > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(kimlik, { sayac: 1, pencereAcilmaTarihi: simdi });
    return false;
  }

  if (girdi.sayac >= RATE_LIMIT_MAX) return true;

  girdi.sayac += 1;
  return false;
}

function promptOlustur(arac: Arac, tip: AIPromptTipi): string {
  const aracSatiri = `${arac.marka} ${arac.model} (${arac.yil}) - Plaka: ${arac.plaka}`;
  const tarihBlok = `
  - Muayene Tarihi : ${arac.muayeneTarihi ?? 'Belirtilmedi'}
  - Sigorta Tarihi : ${arac.sigortaTarihi ?? 'Belirtilmedi'}
  - Kasko Tarihi   : ${arac.kaskoTarihi ?? 'Belirtilmedi'}
  - Bakim Tarihi   : ${arac.bakimTarihi ?? 'Belirtilmedi'}`;

  const tabanTalimat =
    'Yanitin yalnizca Turkce olsun. Teknik jargon kullanma. Madde isareti veya baslik ekleme.';

  switch (tip) {
    case 'tavsiye':
      return `Sen bir arac bakim danismanisin.
${tabanTalimat}
Asagidaki arac icin en onemli 2-3 bakim/sigorta tavsiyesini maksimum 4 cumlede ver.
Yaklasan tarihler varsa mutlaka belirt.

Arac: ${aracSatiri}
Tarihler:${tarihBlok}`;

    case 'ozet':
      return `Sen bir arac kayit asistanisin.
${tabanTalimat}
Asagidaki arac bilgilerini 2 cumlede ozetle; arac yasi ve en kritik tarihe dikkat cek.

Arac: ${aracSatiri}
Tarihler:${tarihBlok}`;

    case 'uyari':
      return `Sen acil uyari sisteminin parcasisin.
${tabanTalimat}
Asagidaki arac icin 7 gun icinde dolacak veya gecmis tarihleri belirterek 1-2 cumlelik kritik uyari yaz.
Hic yaklasan tarih yoksa "Yaklasan kritik tarih bulunmamaktadir." yaz.

Arac: ${aracSatiri}
Tarihler:${tarihBlok}`;

    default:
      return '';
  }
}

function gunFarki(tarih: string): number {
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);

  const hedef = new Date(tarih);
  hedef.setHours(0, 0, 0, 0);

  return Math.ceil((hedef.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24));
}

function yerelTavsiyeOlustur(arac: Arac, tip: AIPromptTipi): string {
  const aracAdi = `${arac.marka} ${arac.model} (${arac.yil})`;
  const tarihler = [
    { ad: 'muayene', tarih: arac.muayeneTarihi },
    { ad: 'sigorta', tarih: arac.sigortaTarihi },
    { ad: 'kasko', tarih: arac.kaskoTarihi },
    { ad: 'bakim', tarih: arac.bakimTarihi },
  ]
    .filter((item): item is { ad: string; tarih: string } => Boolean(item.tarih))
    .map((item) => ({ ...item, kalanGun: gunFarki(item.tarih) }))
    .sort((a, b) => a.kalanGun - b.kalanGun);

  if (!tarihler.length) {
    return `${aracAdi} icin kayitli tarih bulunmuyor. Muayene, sigorta, kasko ve bakim tarihlerini ekleyip hatirlaticilari acik tutmanizi oneririm.`;
  }

  const gecmis = tarihler.filter((item) => item.kalanGun < 0);
  const kritik = tarihler.filter((item) => item.kalanGun >= 0 && item.kalanGun <= 7);
  const yaklasan = tarihler.filter((item) => item.kalanGun > 7 && item.kalanGun <= 30);
  const siradaki = tarihler.find((item) => item.kalanGun >= 0) ?? tarihler[0];

  if (tip === 'uyari') {
    if (gecmis.length) {
      return `${aracAdi} icin ${gecmis.map((item) => item.ad).join(', ')} tarihi gecmis gorunuyor. En kisa surede randevu veya yenileme islemini tamamlayin.`;
    }
    if (kritik.length) {
      return `${aracAdi} icin ${kritik.map((item) => `${item.ad} ${item.kalanGun} gun icinde`).join(', ')} doluyor. Bugun kontrol edip gerekli islemi planlayin.`;
    }
    return 'Yaklasan kritik tarih bulunmamaktadir.';
  }

  if (tip === 'ozet') {
    const durum =
      siradaki.kalanGun < 0
        ? `${siradaki.ad} tarihi ${Math.abs(siradaki.kalanGun)} gun gecmis`
        : `siradaki kritik tarih ${siradaki.ad}, ${siradaki.kalanGun} gun kalmis`;
    return `${aracAdi} kaydinda ${tarihler.length} takip tarihi var; ${durum}. Hatirlaticilari acik tutup belge yenilemelerini son haftaya birakmamaniz iyi olur.`;
  }

  if (gecmis.length) {
    return `${aracAdi} icin oncelik ${gecmis.map((item) => item.ad).join(', ')} islemlerinde; bu tarihler gecmis gorunuyor. Ardindan yaklasan bakim ve belge tarihlerini kontrol edip hatirlaticilari acik birakin.`;
  }

  if (kritik.length || yaklasan.length) {
    const liste = [...kritik, ...yaklasan].map((item) => `${item.ad} ${item.kalanGun} gun`).join(', ');
    return `${aracAdi} icin yaklasan takipler: ${liste}. Randevu ve yenileme islemlerini simdiden planlayarak son gun yogunlugunu onleyebilirsiniz.`;
  }

  return `${aracAdi} icin en yakin takip ${siradaki.ad}; ${siradaki.kalanGun} gun kalmis. Periyodik bakim kaydini guncel tutun ve sigorta/kasko belgelerini yenileme doneminden once kontrol edin.`;
}

export const getAIAdvice = async (
  arac: Arac,
  tip: AIPromptTipi = 'tavsiye',
  kimlik: string = arac.id,
): Promise<string> => {
  if (rateLimitAsildi(kimlik)) {
    return 'Cok fazla istek gonderdiniz. Lutfen bir dakika sonra tekrar deneyin.';
  }

  const cacheAnahtari = `${arac.id}:${tip}`;
  const onbellekYaniti = onbellektenAl(cacheAnahtari);
  if (onbellekYaniti) {
    console.log(`[AI Cache HIT] ${cacheAnahtari}`);
    return onbellekYaniti;
  }

  if (!GEMINI_API_KEY) {
    console.warn('[AI Local Fallback] GEMINI_API_KEY tanimli degil.');
    const yerelYanit = yerelTavsiyeOlustur(arac, tip);
    onbellekteKaydet(cacheAnahtari, yerelYanit);
    return yerelYanit;
  }

  const prompt = promptOlustur(arac, tip);

  try {
    console.log(`[AI Request] aracId=${arac.id} tip=${tip}`);

    for (const model of GEMINI_MODELS) {
      try {
        const response = await axios.post(
          geminiUrlOlustur(model),
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

        const yanit = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        const temizYanit = typeof yanit === 'string' ? yanit.trim() : '';
        if (temizYanit.length >= 40) {
          onbellekteKaydet(cacheAnahtari, temizYanit);
          console.log(`[AI Cache SET] ${cacheAnahtari}`);
          return temizYanit;
        }

        console.warn(`[AI Service Warning] model=${model} kisa veya bos yanit dondu.`);
      } catch (error: any) {
        const mesaj = error.response?.data?.error?.message ?? error.message;
        console.error(`[AI Service Error] model=${model} ${mesaj}`);
      }
    }

    throw new Error('Tum Gemini modelleri yanit veremedi.');
  } catch (error: any) {
    const mesaj = error.response?.data?.error?.message ?? error.message;
    console.error(`[AI Local Fallback] ${mesaj}`);

    const eskiOnbellek = onbellek.get(cacheAnahtari);
    if (eskiOnbellek) return eskiOnbellek.sonuc;

    const yerelYanit = yerelTavsiyeOlustur(arac, tip);
    onbellekteKaydet(cacheAnahtari, yerelYanit);
    return yerelYanit;
  }
};

export const onbellekTemizle = (): void => {
  onbellek.clear();
  console.log('[AI Cache] Temizlendi.');
};

export const aiDurumRaporu = () => ({
  onbellekBoyutu: onbellek.size,
  rateLimitKayitSayisi: rateLimitMap.size,
  desteklenenTipler: ['tavsiye', 'ozet', 'uyari'] as AIPromptTipi[],
  modeller: GEMINI_MODELS,
});
