import type { Arac } from '../types/Arac';
import { API_URL } from '../config/api';

export type AIPromptTipi = 'tavsiye' | 'ozet' | 'uyari';

function gunFarki(tarih: string): number {
  const bugun = new Date();
  const [yil, ay, gun] = tarih.split('-').map(Number);
  const bugunUtc = Date.UTC(bugun.getFullYear(), bugun.getMonth(), bugun.getDate());
  const hedefUtc = Date.UTC(yil, ay - 1, gun);
  return Math.round((hedefUtc - bugunUtc) / (1000 * 60 * 60 * 24));
}

/**
 * Backend yokken veya hata olduğunda yerel mantıkla tavsiye üretir.
 */
export function yerelTavsiyeOlustur(arac: Arac, tip: AIPromptTipi): string {
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
    return `${aracAdi} için kayıtlı tarih bulunmuyor. Muayene, sigorta, kasko ve bakım tarihlerinizi ekleyerek hatırlatıcıları açık tutmanızı öneririm.`;
  }

  const gecmis = tarihler.filter((item) => item.kalanGun < 0);
  const kritik = tarihler.filter((item) => item.kalanGun >= 0 && item.kalanGun <= 7);
  const yaklasan = tarihler.filter((item) => item.kalanGun > 7 && item.kalanGun <= 30);
  const siradaki = tarihler.find((item) => item.kalanGun >= 0) ?? tarihler[0];

  if (tip === 'uyari') {
    if (gecmis.length) {
      return `⚠️ ${aracAdi} için ${gecmis.map((i) => i.ad).join(', ')} tarihi geçmiş görünüyor. En kısa sürede randevu veya yenileme işlemini tamamlayın.`;
    }
    if (kritik.length) {
      return `🔴 ${aracAdi} için ${kritik.map((i) => `${i.ad} (${i.kalanGun} gün)`).join(', ')} dolmak üzere! Bugün kontrol edip gerekli işlemi planlayın.`;
    }
    return '✅ Yaklaşan kritik tarih bulunmamaktadır.';
  }

  if (tip === 'ozet') {
    const durum =
      siradaki.kalanGun < 0
        ? `${siradaki.ad} tarihi ${Math.abs(siradaki.kalanGun)} gün geçmiş`
        : `sıradaki tarih ${siradaki.ad}, ${siradaki.kalanGun} gün kalmış`;
    return `${aracAdi} kaydında ${tarihler.length} takip tarihi var; ${durum}. Hatırlatıcıları açık tutup belge yenilemelerini son haftaya bırakmamanız iyi olur.`;
  }

  // tip === 'tavsiye'
  if (gecmis.length) {
    return `${aracAdi} için öncelik ${gecmis.map((i) => i.ad).join(', ')} işlemlerinde; bu tarihler geçmiş görünüyor. Ardından yaklaşan bakım ve belge tarihlerini kontrol edip hatırlatıcıları açık bırakın.`;
  }
  if (kritik.length || yaklasan.length) {
    const liste = [...kritik, ...yaklasan].map((i) => `${i.ad} (${i.kalanGun} gün)`).join(', ');
    return `${aracAdi} için yaklaşan takipler: ${liste}. Randevu ve yenileme işlemlerini şimdiden planlayarak son gün yoğunluğunu önleyebilirsiniz.`;
  }
  return `${aracAdi} için en yakın takip ${siradaki.ad}; ${siradaki.kalanGun} gün kalmış. Periyodik bakım kaydını güncel tutun ve sigorta/kasko belgelerinizi yenileme döneminden önce kontrol edin.`;
}

/**
 * AI tavsiyesi alır. Backend'e bağlanır, başarısız olursa yerel hesaplama döner.
 */
export async function aiTavsiyeAl(
  arac: Arac,
  tip: AIPromptTipi = 'tavsiye',
  email?: string | null,
): Promise<string> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (email) headers['X-User-Email'] = email.trim();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${API_URL}/ai/tavsiye?tip=${tip}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(arac),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const tavsiye: string = data.data?.tavsiye;
      if (tavsiye && tavsiye.length > 0) {
        return tavsiye;
      }
    }
  } catch {
    // Backend çalışmıyor veya timeout — yerel fallback'e düş
  }

  return yerelTavsiyeOlustur(arac, tip);
}
