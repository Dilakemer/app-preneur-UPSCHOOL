import type { Arac, TarihDurumu } from '../types/Arac';
import { TARIH_KATEGORILERI } from '../types/Arac';

const GUN_MS = 24 * 60 * 60 * 1000;

export const bugununBaslangici = () => {
  const bugun = new Date();
  return new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate());
};

export const tarihStringiniDateYap = (tarih: string) => {
  const [yil, ay, gun] = tarih.split('-').map(Number);
  return new Date(yil, ay - 1, gun);
};

const tarihStringiniUtcGunZamaninaCevir = (tarih: string) => {
  const [yil, ay, gun] = tarih.split('-').map(Number);
  return Date.UTC(yil, ay - 1, gun);
};

const bugununUtcGunZamani = () => {
  const bugun = bugununBaslangici();
  return Date.UTC(bugun.getFullYear(), bugun.getMonth(), bugun.getDate());
};

export const dateiTarihStringineCevir = (date: Date) => {
  const yil = date.getFullYear();
  const ay = String(date.getMonth() + 1).padStart(2, '0');
  const gun = String(date.getDate()).padStart(2, '0');
  return `${yil}-${ay}-${gun}`;
};

export const saatStringiniParcala = (saat: string) => {
  const [saatDegeri = '09', dakikaDegeri = '00'] = saat.split(':');
  return {
    saat: Number(saatDegeri),
    dakika: Number(dakikaDegeri),
  };
};

export const kalanGunHesapla = (tarih: string) => {
  const fark = tarihStringiniUtcGunZamaninaCevir(tarih) - bugununUtcGunZamani();
  return Math.round(fark / GUN_MS);
};

export const tarihGecmisMi = (tarih: string) => kalanGunHesapla(tarih) < 0;

export const tarihFormatla = (tarih: string | null) => {
  if (!tarih) {
    return 'Tarih girilmedi';
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(tarihStringiniDateYap(tarih));
};

export const listeleTarihDurumlari = (arac: Arac): TarihDurumu[] =>
  TARIH_KATEGORILERI.flatMap((kategori) => {
    const tarih = arac[`${kategori}Tarihi` as keyof Arac];

    if (!tarih || typeof tarih !== 'string') {
      return [];
    }

    return [
      {
        kategori,
        tarih,
        kalanGun: kalanGunHesapla(tarih),
      },
    ];
  }).sort((ilk, ikinci) => Math.abs(ilk.kalanGun) - Math.abs(ikinci.kalanGun));

export const enYakinTarihBul = (arac: Arac) => {
  const tarihler = listeleTarihDurumlari(arac);
  return tarihler[0] ?? null;
};

export const kalanGunMetni = (kalanGun: number) => {
  if (kalanGun < 0) {
    return `Suresi ${Math.abs(kalanGun)} gun once doldu`;
  }

  if (kalanGun === 0) {
    return 'Bugun son gun';
  }

  return `${kalanGun} gun kaldi`;
};
