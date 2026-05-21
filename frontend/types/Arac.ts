export type TarihKategorisi = 'muayene' | 'sigorta' | 'kasko' | 'bakim';

export interface Bildirimler {
  gun60: boolean;
  gun30: boolean;
  gun7: boolean;
  gun1: boolean;
  saat: string;
}

export interface Arac {
  id: string;
  plaka: string;
  marka: string;
  model: string;
  yil: number;
  muayeneTarihi: string | null;
  sigortaTarihi: string | null;
  kaskoTarihi: string | null;
  bakimTarihi: string | null;
  bildirimler: Bildirimler;
  olusturmaTarihi: string;
  guncellemeTarihi: string;
  kullaniciEposta?: string;
}

export type AracInput = Omit<Arac, 'id' | 'olusturmaTarihi' | 'guncellemeTarihi'>;

export interface TarihDurumu {
  kategori: TarihKategorisi;
  tarih: string;
  kalanGun: number;
}

export const VARSAYILAN_BILDIRIMLER: Bildirimler = {
  gun60: true,
  gun30: true,
  gun7: true,
  gun1: true,
  saat: '09:00',
};

export const TARIH_KATEGORILERI: TarihKategorisi[] = ['muayene', 'sigorta', 'kasko', 'bakim'];

export const KATEGORI_BASLIKLARI: Record<TarihKategorisi, string> = {
  muayene: 'Muayene',
  sigorta: 'Sigorta',
  kasko: 'Kasko',
  bakim: 'Bakim',
};
