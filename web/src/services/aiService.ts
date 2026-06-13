import type { Arac } from '../types/Arac';
import { API_URL } from '../config/api';

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

function gunFarki(tarih: string): number {
  const bugun = new Date();
  const [yil, ay, gun] = tarih.split('-').map(Number);
  const bugunUtc = Date.UTC(bugun.getFullYear(), bugun.getMonth(), bugun.getDate());
  const hedefUtc = Date.UTC(yil, ay - 1, gun);
  return Math.round((hedefUtc - bugunUtc) / (1000 * 60 * 60 * 24));
}

/**
 * Backend yokken yerel mantıkla tavsiye üretir (fallback).
 */
export function yerelTavsiyeOlustur(arac: Arac, tip: AIPromptTipi, soru?: string): string {
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
      return `⚠️ ${aracAdi} için ${gecmis.map((i) => i.ad).join(' ve ')} tarihi geçmiş görünüyor. En kısa sürede ilgili işlemi tamamlamanızı öneririm.`;
    }
    if (kritik.length) {
      return `🔴 ${aracAdi} için ${kritik.map((i) => `${i.ad} (${i.kalanGun} gün)`).join(', ')} dolmak üzere. Bugün işlem planlamanızı öneririm.`;
    }
    return '✅ Herhangi bir acil durum yok, yaklaşan tarihleriniz kontrol altında.';
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

/**
 * Tekil AI tavsiyesi — backend'e bağlanır, başarısız olursa yerel hesaplama döner.
 */
export async function aiTavsiyeAl(
  arac: Arac,
  tip: AIPromptTipi = 'tavsiye',
  email?: string | null,
  soru?: string,
): Promise<string> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (email) headers['X-User-Email'] = email.trim();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${API_URL}/ai/tavsiye?tip=${tip}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...arac, soru }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const tavsiye: string = data.data?.tavsiye;
      if (tavsiye && tavsiye.length > 0) return tavsiye;
    }
  } catch {
    // Backend çalışmıyor veya timeout — yerel fallback'e düş
  }

  return yerelTavsiyeOlustur(arac, tip, soru);
}

/**
 * Multi-turn sohbet — Gemini önceki mesajları bilerek yanıt verir.
 */
export async function sohbetMesajiGonder(
  arac: Arac,
  gecmis: SohbetMesaji[],
  yeniMesaj: string,
  email?: string | null,
): Promise<string> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (email) headers['X-User-Email'] = email.trim();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${API_URL}/ai/sohbet`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ arac, gecmis, yeniMesaj }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const yanit: string = data.data?.yanit;
      if (yanit && yanit.length > 0) return yanit;
    }
  } catch {
    // fallback
  }

  return yerelTavsiyeOlustur(arac, 'sohbet', yeniMesaj);
}

/**
 * Gider analizi — gider özetini AI ile analiz eder.
 */
export async function giderAnalizAl(
  arac: Arac,
  giderler: GiderOzeti[],
  toplamTutar: number,
  email?: string | null,
  soru?: string,
): Promise<string> {
  if (!giderler.length) {
    return 'Henüz gider kaydı bulunmuyor. Gider ekledikten sonra AI analizi yapılabilir.';
  }

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (email) headers['X-User-Email'] = email.trim();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(`${API_URL}/ai/gider-analiz`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ arac, giderler, toplamTutar, soru }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const analiz: string = data.data?.analiz;
      if (analiz && analiz.length > 0) return analiz;
    }
  } catch {
    // fallback
  }

  const enYuksek = [...giderler].sort((a, b) => b.tutar - a.tutar)[0];
  return `${arac.marka} ${arac.model} için toplam ${toplamTutar.toFixed(2)} ₺ gider kaydedilmiş. En yüksek harcama ${enYuksek?.kategori ?? 'belirsiz'} (${enYuksek?.tutar.toFixed(2) ?? 0} ₺). Giderlerinizi düzenli kayıt altına almaya devam edin.`;
}
