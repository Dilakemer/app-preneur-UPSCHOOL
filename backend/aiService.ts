import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import type { Arac } from './types';

dotenv.config({ path: path.join(__dirname, '../.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
const GEMINI_FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS ?? 'gemini-1.5-flash,gemini-1.5-pro')
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean);
const GEMINI_MODELS = Array.from(new Set([GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS]));
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const CACHE_TTL_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export type AIPromptTipi = 'tavsiye' | 'ozet' | 'uyari' | 'sohbet' | 'gider-analiz';

export interface SohbetMesaji {
  rol: 'kullanici' | 'asistan';
  icerik: string;
}

export interface GiderOzeti {
  kategori: string;
  tutar: number;
  adet: number;
}

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

// ─── Yardımcı ──────────────────────────────────────────────────────────────

function gunFarki(tarih: string): number {
  const bugun = new Date();
  const [yil, ay, gun] = tarih.split('-').map(Number);
  const bugunUtc = Date.UTC(bugun.getFullYear(), bugun.getMonth(), bugun.getDate());
  const hedefUtc = Date.UTC(yil, ay - 1, gun);
  return Math.round((hedefUtc - bugunUtc) / (1000 * 60 * 60 * 24));
}

function aracBaglamOlustur(arac: Arac): string {
  const aracYasi = new Date().getFullYear() - arac.yil;
  const tarihBilgileri = [
    { ad: 'Muayene', tarih: arac.muayeneTarihi },
    { ad: 'Zorunlu Sigorta (Trafik)', tarih: arac.sigortaTarihi },
    { ad: 'Kasko', tarih: arac.kaskoTarihi },
    { ad: 'Periyodik Bakım', tarih: arac.bakimTarihi },
  ];

  const tarihSatirları = tarihBilgileri.map(({ ad, tarih }) => {
    if (!tarih) return `  - ${ad}: Kayıtlı değil`;
    const kalan = gunFarki(tarih);
    const durum =
      kalan < 0
        ? `⚠️ ${Math.abs(kalan)} GÜN ÖNCE GEÇTİ`
        : kalan === 0
        ? '🔴 BUGÜN SON GÜN'
        : kalan <= 7
        ? `🔴 ${kalan} gün kaldı (KRİTİK)`
        : kalan <= 30
        ? `🟡 ${kalan} gün kaldı (yaklaşıyor)`
        : `✅ ${kalan} gün kaldı`;
    return `  - ${ad}: ${tarih} → ${durum}`;
  }).join('\n');

  return `
=== ARAÇ BİLGİLERİ ===
Araç: ${arac.marka} ${arac.model} (${arac.yil}) — ${aracYasi} yaşında
Plaka: ${arac.plaka}

=== TARİH & DURUM ===
${tarihSatirları}

=== TÜRKİYE MEVZUATI HATIRLATMASI ===
- Zorunlu trafik sigortası (MTPL) her yıl yenilenmeli; gecikme ceza ve sorumluluk riski yaratır.
- Araç muayenesi: yeni araçlarda 3 yılda bir, eski araçlarda her yıl zorunlu.
- Trafikte muayenesiz/sigortasız yakalanmak idari para cezasına yol açar.
`.trim();
}

// ─── Prompt Oluşturucular ───────────────────────────────────────────────────

function promptOlustur(arac: Arac, tip: AIPromptTipi, soru?: string): string {
  const baglamBlok = aracBaglamOlustur(arac);
  const soruBlok = soru?.trim()
    ? `\nKullanıcının özel sorusu: "${soru.trim().slice(0, 600)}"`
    : '';

  const sistemKarakteri = `Sen CareMind uygulamasının yapay zeka asistanısın. Türk araç sahiplerine yardım ediyorsun.
Yanıtların:
- Tamamen Türkçe olmalı
- Sıcak, doğal ve anlaşılır bir dille yazılmalı
- Kullanıcının gerçekten işine yarayacak somut bilgiler içermeli
- Araç sahibinin endişelerini gerçekten anlayan bir uzman gibi yaklaşmalı
- Gereksiz yere uzun olmamalı ama kısalık uğruna önemli bilgileri atlatmamalı`;

  switch (tip) {
    case 'tavsiye':
      return `${sistemKarakteri}

Aşağıdaki araç için kapsamlı bir bakım ve belge danışmanlığı yap.
Yaklaşan veya geçmiş tarihlere özellikle dikkat et.
Marka ve model bilgisini göz önünde bulundurarak o araca özgü bakım önerilerinde bulun.
Araç yaşını da hesaba kat.
Yanıtın akıcı bir paragraf şeklinde olsun, 3-5 cümle yeterli.

${baglamBlok}${soruBlok}`;

    case 'ozet':
      return `${sistemKarakteri}

Aşağıdaki aracın genel durumunu kısa ve öz bir şekilde değerlendir.
En kritik tarihe odaklan, araç yaşını ve genel bakım durumunu da belirt.
2-3 cümle yeterli.

${baglamBlok}${soruBlok}`;

    case 'uyari':
      return `${sistemKarakteri}

Aşağıdaki araç için acil/kritik uyarı mesajı yaz.
Sadece 7 gün içinde dolacak veya geçmiş tarihlere odaklan.
Hiç kritik tarih yoksa "Herhangi bir acil durum yok, yaklaşan tarihleriniz kontrol altında." yaz.
Uyarı varsa net, aciliyet hissettiren ama panik yaratmayan bir dille yaz.

${baglamBlok}${soruBlok}`;

    case 'sohbet':
      return `${sistemKarakteri}

Kullanıcı aracıyla ilgili bir soru soruyor. Araç bağlamını kullanarak soruyu yanıtla.
Eğer soru araç dışı bir konuysa nazikçe konuyu araca yönlendir.

${baglamBlok}${soruBlok}`;

    default:
      return '';
  }
}

export function giderPromptOlustur(
  arac: Arac,
  giderler: GiderOzeti[],
  toplamTutar: number,
  soru?: string,
): string {
  const aracYasi = new Date().getFullYear() - arac.yil;
  const giderSatirlari = giderler
    .map((g) => `  - ${g.kategori}: ${g.adet} işlem, toplam ${g.tutar.toFixed(2)} ₺`)
    .join('\n');

  const soruBlok = soru?.trim()
    ? `\nKullanıcının sorusu: "${soru.trim().slice(0, 400)}"`
    : '';

  return `Sen CareMind uygulamasının yapay zeka asistanısın. Türk araç sahiplerine araç gider yönetimi konusunda yardım ediyorsun.

Aşağıdaki araç ve gider verilerini analiz ederek:
- Giderlerin makul olup olmadığını değerlendir
- En yüksek maliyet kalemini vurgula
- Araç yaşı ve markasına göre bütçe yorumu yap
- Varsa dikkat çekilmesi gereken trend veya anomaliyi belirt
- Tasarruf önerisinde bulun

Araç: ${arac.marka} ${arac.model} (${arac.yil}) — ${aracYasi} yaşında

=== GİDER ÖZETİ ===
${giderSatirlari}
  → Toplam: ${toplamTutar.toFixed(2)} ₺
${soruBlok}

Yanıtın Türkçe, samimi ve pratik olsun. 3-4 cümle yeterli.`;
}

// ─── Gemini API Çağrısı ─────────────────────────────────────────────────────

async function geminiCagir(
  contents: { role: string; parts: { text: string }[] }[],
  maxTokens = 600,
  temperature = 0.7,
): Promise<string> {
  for (const model of GEMINI_MODELS) {
    try {
      const response = await axios.post(
        geminiUrlOlustur(model),
        {
          contents,
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature,
            topP: 0.92,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          ],
        },
        { timeout: 15000 },
      );

      const yanit = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const temizYanit = typeof yanit === 'string' ? yanit.trim() : '';
      if (temizYanit.length > 0) {
        console.log(`[AI OK] model=${model} tokens≈${temizYanit.length / 4}`);
        return temizYanit;
      }
      console.warn(`[AI Warning] model=${model} boş yanıt döndü.`);
    } catch (error: any) {
      const mesaj = error.response?.data?.error?.message ?? error.message;
      console.error(`[AI Error] model=${model} — ${mesaj}`);
    }
  }
  throw new Error('Tüm Gemini modelleri yanıt veremedi.');
}

// ─── Yerel Fallback ─────────────────────────────────────────────────────────

function yerelTavsiyeOlustur(arac: Arac, tip: AIPromptTipi, soru?: string): string {
  const aracAdi = `${arac.marka} ${arac.model} (${arac.yil})`;
  const tarihler = [
    { ad: 'muayene', tarih: arac.muayeneTarihi },
    { ad: 'sigorta', tarih: arac.sigortaTarihi },
    { ad: 'kasko', tarih: arac.kaskoTarihi },
    { ad: 'bakım', tarih: arac.bakimTarihi },
  ]
    .filter((item): item is { ad: string; tarih: string } => Boolean(item.tarih))
    .map((item) => ({ ...item, kalanGun: gunFarki(item.tarih) }))
    .sort((a, b) => a.kalanGun - b.kalanGun);

  if (!tarihler.length) {
    if (soru?.trim()) {
      return `${aracAdi} için henüz tarih kaydı yok. Muayene, sigorta, kasko veya bakım tarihi eklerseniz çok daha kapsamlı yardımcı olabilirim!`;
    }
    return `${aracAdi} için kayıtlı takip tarihi bulunmuyor. Muayene, sigorta, kasko ve bakım tarihlerinizi ekleyerek araçınızı düzenli takip altına alabilirsiniz.`;
  }

  const gecmis = tarihler.filter((item) => item.kalanGun < 0);
  const kritik = tarihler.filter((item) => item.kalanGun >= 0 && item.kalanGun <= 7);
  const yaklasan = tarihler.filter((item) => item.kalanGun > 7 && item.kalanGun <= 30);
  const siradaki = tarihler.find((item) => item.kalanGun >= 0) ?? tarihler[0];

  if (tip === 'uyari') {
    if (gecmis.length) {
      return `${aracAdi} için ${gecmis.map((i) => i.ad).join(' ve ')} tarihi geçmiş görünüyor. En kısa sürede ilgili işlemi tamamlamanızı öneririm.`;
    }
    if (kritik.length) {
      return `${aracAdi} için ${kritik.map((i) => `${i.ad} (${i.kalanGun} gün)`).join(', ')} dolmak üzere. Bugün işlem planlamanızı öneririm.`;
    }
    return 'Herhangi bir acil durum yok, yaklaşan tarihleriniz kontrol altında.';
  }

  if (tip === 'ozet') {
    const durum =
      siradaki.kalanGun < 0
        ? `${siradaki.ad} tarihi ${Math.abs(siradaki.kalanGun)} gün geçmiş`
        : `sıradaki tarih ${siradaki.ad}, ${siradaki.kalanGun} gün kaldı`;
    return `${aracAdi} için ${tarihler.length} takip tarihi var; ${durum}. Hatırlatıcılarınızı açık tutmanızı öneririm.`;
  }

  if (gecmis.length) {
    return `${aracAdi} için öncelikli konu ${gecmis.map((i) => i.ad).join(' ve ')} işlemleri; bu tarihler geçmiş görünüyor. Tamamladıktan sonra diğer yaklaşan tarihleri de kontrol edin.`;
  }
  if (kritik.length || yaklasan.length) {
    const liste = [...kritik, ...yaklasan].map((i) => `${i.ad} (${i.kalanGun} gün)`).join(', ');
    return `${aracAdi} için yaklaşan takipler: ${liste}. Randevu ve yenileme işlemlerini şimdiden planlamanızı öneririm.`;
  }
  return `${aracAdi} için en yakın tarih ${siradaki.ad}; ${siradaki.kalanGun} gün kaldı. Periyodik bakımınızı ve belgelerinizi takipte tutun.`;
}

// ─── Ana API Fonksiyonları ──────────────────────────────────────────────────

/**
 * Tekil AI tavsiyesi — cache destekli, fallback'li
 */
export const getAIAdvice = async (
  arac: Arac,
  tip: AIPromptTipi = 'tavsiye',
  kimlik: string = arac.id,
  soru?: string,
): Promise<string> => {
  if (rateLimitAsildi(kimlik)) {
    return 'Çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.';
  }

  const cacheAnahtari = `${arac.id}:${tip}:${soru?.trim().slice(0, 80) ?? ''}`;
  const onbellekYaniti = onbellektenAl(cacheAnahtari);
  if (onbellekYaniti) {
    console.log(`[AI Cache HIT] ${cacheAnahtari}`);
    return onbellekYaniti;
  }

  if (!GEMINI_API_KEY) {
    console.warn('[AI Local Fallback] GEMINI_API_KEY tanımlı değil.');
    const yerelYanit = yerelTavsiyeOlustur(arac, tip, soru);
    onbellekteKaydet(cacheAnahtari, yerelYanit);
    return yerelYanit;
  }

  const prompt = promptOlustur(arac, tip, soru);
  try {
    console.log(`[AI Request] aracId=${arac.id} tip=${tip}`);
    const yanit = await geminiCagir(
      [{ role: 'user', parts: [{ text: prompt }] }],
      600,
      0.7,
    );
    onbellekteKaydet(cacheAnahtari, yanit);
    console.log(`[AI Cache SET] ${cacheAnahtari}`);
    return yanit;
  } catch (error: any) {
    const mesaj = error.response?.data?.error?.message ?? error.message;
    console.error(`[AI Local Fallback] ${mesaj}`);

    const eskiOnbellek = onbellek.get(cacheAnahtari);
    if (eskiOnbellek) return eskiOnbellek.sonuc;

    const yerelYanit = yerelTavsiyeOlustur(arac, tip, soru);
    onbellekteKaydet(cacheAnahtari, yerelYanit);
    return yerelYanit;
  }
};

/**
 * Multi-turn sohbet — Gemini'ye tam geçmiş gönderilir
 */
export const sohbetDevamEttir = async (
  arac: Arac,
  gecmis: SohbetMesaji[],
  yeniMesaj: string,
  kimlik: string = arac.id,
): Promise<string> => {
  if (rateLimitAsildi(kimlik)) {
    return 'Çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.';
  }

  if (!GEMINI_API_KEY) {
    return yerelTavsiyeOlustur(arac, 'sohbet', yeniMesaj);
  }

  // Sistem bağlamını ilk mesaj olarak yerleştir
  const baglamPrompt = `${promptOlustur(arac, 'sohbet')}\n\nKullanıcı şimdi şunu soruyor: "${yeniMesaj.slice(0, 600)}"`;

  // Gemini multi-turn format: önceki mesajları dönüştür
  const contents: { role: string; parts: { text: string }[] }[] = [];

  // Bağlamı ilk user mesajı olarak ekle
  contents.push({ role: 'user', parts: [{ text: baglamPrompt }] });

  // Önceki konuşmayı ekle (ilk mesajı atla, bağlamla birleştirdik)
  for (const mesaj of gecmis) {
    contents.push({
      role: mesaj.rol === 'kullanici' ? 'user' : 'model',
      parts: [{ text: mesaj.icerik }],
    });
  }

  // Mevcut soruyu ekle (sadece gecmis varsa — yoksa baglamPrompt zaten soruyu içeriyor)
  if (gecmis.length > 0) {
    contents.push({ role: 'user', parts: [{ text: yeniMesaj.slice(0, 600) }] });
  }

  try {
    console.log(`[AI Chat] aracId=${arac.id} gecmisMesaj=${gecmis.length}`);
    return await geminiCagir(contents, 700, 0.72);
  } catch (error: any) {
    console.error(`[AI Chat Error] ${error.message}`);
    return yerelTavsiyeOlustur(arac, 'sohbet', yeniMesaj);
  }
};

/**
 * Gider analizi — gider özetini Gemini ile analiz et
 */
export const giderAnaliziYap = async (
  arac: Arac,
  giderler: GiderOzeti[],
  toplamTutar: number,
  kimlik: string = arac.id,
  soru?: string,
): Promise<string> => {
  if (rateLimitAsildi(kimlik)) {
    return 'Çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.';
  }

  if (!GEMINI_API_KEY || giderler.length === 0) {
    return 'Gider analizi için yeterli veri yok. Lütfen önce gider kayıtlarınızı ekleyin.';
  }

  const cacheAnahtari = `gider:${arac.id}:${toplamTutar}:${soru?.slice(0, 40) ?? ''}`;
  const onbellekYaniti = onbellektenAl(cacheAnahtari);
  if (onbellekYaniti) return onbellekYaniti;

  const prompt = giderPromptOlustur(arac, giderler, toplamTutar, soru);

  try {
    console.log(`[AI Gider] aracId=${arac.id} toplam=${toplamTutar}`);
    const yanit = await geminiCagir(
      [{ role: 'user', parts: [{ text: prompt }] }],
      550,
      0.65,
    );
    onbellekteKaydet(cacheAnahtari, yanit);
    return yanit;
  } catch (error: any) {
    console.error(`[AI Gider Error] ${error.message}`);
    const enYuksek = giderler.sort((a, b) => b.tutar - a.tutar)[0];
    return `${arac.marka} ${arac.model} için toplam ${toplamTutar.toFixed(2)} ₺ gider kaydedilmiş. En büyük kalem ${enYuksek?.kategori ?? 'bilinmiyor'} (${enYuksek?.tutar.toFixed(2) ?? 0} ₺). Giderlerinizi düzenli kayıt altında tutmaya devam edin.`;
  }
};

// ─── Yardımcı Dışa Aktarımlar ───────────────────────────────────────────────

export const onbellekTemizle = (): void => {
  onbellek.clear();
  console.log('[AI Cache] Temizlendi.');
};

export const aiDurumRaporu = () => ({
  onbellekBoyutu: onbellek.size,
  rateLimitKayitSayisi: rateLimitMap.size,
  desteklenenTipler: ['tavsiye', 'ozet', 'uyari', 'sohbet', 'gider-analiz'] as AIPromptTipi[],
  modeller: GEMINI_MODELS,
});
