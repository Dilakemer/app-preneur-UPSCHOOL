export interface BildirimAyarlari {
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
  bildirimler: BildirimAyarlari;
  olusturmaTarihi: string;
  guncellemeTarihi: string;
}

export type AracInput = Omit<Arac, 'id' | 'olusturmaTarihi' | 'guncellemeTarihi'>;

export type TarihKategorisi = 'muayene' | 'sigorta' | 'kasko' | 'bakim';

export const TARIH_KATEGORILERI: TarihKategorisi[] = ['muayene', 'sigorta', 'kasko', 'bakim'];

export const KATEGORI_BASLIKLARI: Record<TarihKategorisi, string> = {
  muayene: 'Muayene',
  sigorta: 'Sigorta',
  kasko: 'Kasko',
  bakim: 'Bakım',
};

export const KATEGORI_IKONLARI: Record<TarihKategorisi, string> = {
  muayene: '🔧',
  sigorta: '🛡️',
  kasko: '🚗',
  bakim: '⚙️',
};

export const VARSAYILAN_BILDIRIMLER: BildirimAyarlari = {
  gun60: true,
  gun30: true,
  gun7: true,
  gun1: true,
  saat: '09:00',
};
