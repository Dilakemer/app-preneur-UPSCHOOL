import type { Arac, TarihKategorisi } from '../types/Arac';

export interface EnYakinTarihSonucu {
  tarih: string;
  kategori: TarihKategorisi;
  kalanGun: number;
}

export const tarihStringiniDateYap = (deger: string): Date => {
  const [yil, ay, gun] = deger.split('-').map(Number);
  return new Date(yil, ay - 1, gun);
};

export const dateiTarihStringineCevir = (date: Date): string => {
  const yil = date.getFullYear();
  const ay = String(date.getMonth() + 1).padStart(2, '0');
  const gun = String(date.getDate()).padStart(2, '0');
  return `${yil}-${ay}-${gun}`;
};

export const tarihFormatla = (tarih: string): string => {
  const d = tarihStringiniDateYap(tarih);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const kalanGunHesapla = (tarih: string): number => {
  const hedef = tarihStringiniDateYap(tarih);
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  hedef.setHours(0, 0, 0, 0);
  return Math.ceil((hedef.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24));
};

export const kalanGunMetni = (kalanGun: number): string => {
  if (kalanGun < 0) return `${Math.abs(kalanGun)} gün geçti`;
  if (kalanGun === 0) return 'Bugün!';
  if (kalanGun === 1) return 'Yarın';
  return `${kalanGun} gün kaldı`;
};

export const enYakinTarihBul = (arac: Arac): EnYakinTarihSonucu | null => {
  const kategoriler: { key: TarihKategorisi; tarih: string | null }[] = [
    { key: 'muayene', tarih: arac.muayeneTarihi },
    { key: 'sigorta', tarih: arac.sigortaTarihi },
    { key: 'kasko', tarih: arac.kaskoTarihi },
    { key: 'bakim', tarih: arac.bakimTarihi },
  ];

  let enYakin: EnYakinTarihSonucu | null = null;

  for (const { key, tarih } of kategoriler) {
    if (!tarih) continue;
    const kalanGun = kalanGunHesapla(tarih);
    if (!enYakin || kalanGun < enYakin.kalanGun) {
      enYakin = { tarih, kategori: key, kalanGun };
    }
  }

  return enYakin;
};

export const tumTarihleriBul = (arac: Arac): EnYakinTarihSonucu[] => {
  const sonuclar: EnYakinTarihSonucu[] = [];
  const kategoriler: { key: TarihKategorisi; tarih: string | null }[] = [
    { key: 'muayene', tarih: arac.muayeneTarihi },
    { key: 'sigorta', tarih: arac.sigortaTarihi },
    { key: 'kasko', tarih: arac.kaskoTarihi },
    { key: 'bakim', tarih: arac.bakimTarihi },
  ];

  for (const { key, tarih } of kategoriler) {
    if (!tarih) continue;
    sonuclar.push({ tarih, kategori: key, kalanGun: kalanGunHesapla(tarih) });
  }

  return sonuclar.sort((a, b) => a.kalanGun - b.kalanGun);
};
