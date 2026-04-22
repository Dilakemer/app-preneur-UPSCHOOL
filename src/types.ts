// Basit araç tipi
export interface Arac {
  id: string;
  plaka: string;
  marka: string;
  model: string;
  yil: number;
  muayeneTarihi: string;
  sigortaTarihi: string;
  kaskoTarihi: string;
  bakimTarihi: string;
  bildirimler: {
    gun60: boolean;
    gun30: boolean;
  };
}
