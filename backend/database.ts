import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import type { Arac, AracInput, Bildirimler } from './types';
import { VARSAYILAN_BILDIRIMLER } from './types';

// In-memory veritabanı
let araclarDb: Arac[] = [];
let varsayilanBildirimSaati: string = '09:00';
let veriYuklendi = false;

const kalicilikAktif = process.env.NODE_ENV !== 'test' && process.env.DB_PERSISTENCE !== 'memory';
const veriDosyasi =
  process.env.DB_FILE_PATH ?? path.join(process.cwd(), 'backend', 'data', 'caremind-db.json');

const veriyiYukle = (): void => {
  if (veriYuklendi || !kalicilikAktif) {
    veriYuklendi = true;
    return;
  }

  veriYuklendi = true;

  if (!fs.existsSync(veriDosyasi)) {
    return;
  }

  try {
    const veri = JSON.parse(fs.readFileSync(veriDosyasi, 'utf8')) as {
      araclarDb?: Arac[];
      varsayilanBildirimSaati?: string;
    };

    araclarDb = Array.isArray(veri.araclarDb) ? veri.araclarDb : [];
    varsayilanBildirimSaati = veri.varsayilanBildirimSaati || varsayilanBildirimSaati;
  } catch (error) {
    console.error('Veritabani dosyasi okunamadi:', error);
  }
};

const veriyiKaydet = (): void => {
  if (!kalicilikAktif) {
    return;
  }

  try {
    fs.mkdirSync(path.dirname(veriDosyasi), { recursive: true });
    const geciciDosya = `${veriDosyasi}.tmp`;
    fs.writeFileSync(
      geciciDosya,
      JSON.stringify({ araclarDb, varsayilanBildirimSaati }, null, 2),
      'utf8',
    );
    fs.renameSync(geciciDosya, veriDosyasi);
  } catch (error) {
    console.error('Veritabani dosyasi yazilamadi:', error);
  }
};

// Varsayılan bildirim saatini al
export const getVarsayilanBildirimSaati = (): string => {
  veriyiYukle();
  return varsayilanBildirimSaati;
};

// Varsayılan bildirim saatini güncelle
export const setVarsayilanBildirimSaati = (saat: string): void => {
  veriyiYukle();
  varsayilanBildirimSaati = saat;
  veriyiKaydet();
};

// Tüm araçları getir
export const getAllAraclar = (eposta?: string): Arac[] => {
  veriyiYukle();
  const filtered = eposta 
    ? araclarDb.filter(a => a.kullaniciEposta === eposta)
    : araclarDb;
  return JSON.parse(JSON.stringify(filtered)); // Derin kopya
};

// ID ile araç getir
export const getAracById = (id: string, eposta?: string): Arac | undefined => {
  veriyiYukle();
  return araclarDb.find(a => a.id === id && (!eposta || a.kullaniciEposta === eposta));
};

// Yeni araç ekle
export const createArac = (input: AracInput, eposta?: string): Arac => {
  veriyiYukle();
  const zaman = new Date().toISOString();
  const yeniArac: Arac = {
    ...input,
    id: uuidv4(),
    kullaniciEposta: eposta,
    bildirimler: {
      ...VARSAYILAN_BILDIRIMLER,
      ...input.bildirimler,
      saat: input.bildirimler?.saat || varsayilanBildirimSaati,
    },
    olusturmaTarihi: zaman,
    guncellemeTarihi: zaman,
  };

  araclarDb.push(yeniArac);
  veriyiKaydet();
  return yeniArac;
};

// Araç güncelle
export const updateArac = (id: string, input: Partial<AracInput>, eposta?: string): Arac | null => {
  veriyiYukle();
  const index = araclarDb.findIndex(a => a.id === id && (!eposta || a.kullaniciEposta === eposta));
  if (index === -1) return null;

  const guncelArac: Arac = {
    ...araclarDb[index],
    ...input,
    id: araclarDb[index].id,
    olusturmaTarihi: araclarDb[index].olusturmaTarihi,
    guncellemeTarihi: new Date().toISOString(),
  };

  araclarDb[index] = guncelArac;
  veriyiKaydet();
  return guncelArac;
};

// Araç sil
export const deleteArac = (id: string, eposta?: string): Arac | null => {
  veriyiYukle();
  const index = araclarDb.findIndex(a => a.id === id && (!eposta || a.kullaniciEposta === eposta));
  if (index === -1) return null;

  const [silinmiş] = araclarDb.splice(index, 1);
  veriyiKaydet();
  return silinmiş;
};

// Tüm araçları sil
export const deleteAllAraclar = (eposta?: string): void => {
  veriyiYukle();
  if (eposta) {
    araclarDb = araclarDb.filter(a => a.kullaniciEposta !== eposta);
  } else {
    araclarDb = [];
  }
  veriyiKaydet();
};

// Plaka ile araç getir
export const getAracByPlaka = (plaka: string, eposta?: string): Arac | undefined => {
  veriyiYukle();
  return araclarDb.find(a => a.plaka.toUpperCase() === plaka.toUpperCase() && (!eposta || a.kullaniciEposta === eposta));
};

// Kalan gün hesapla
export const kalanGunHesapla = (tarih: string | null): number | null => {
  if (!tarih) return null;

  const hedef = new Date(tarih);
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  hedef.setHours(0, 0, 0, 0);

  const fark = hedef.getTime() - bugun.getTime();
  return Math.round(fark / (24 * 60 * 60 * 1000));
};

// Bildirim raporu oluştur
export const generateBildirimRaporu = (eposta?: string) => {
  const rapor: any[] = [];

  for (const arac of getAllAraclar(eposta)) {
    const tarihler = [
      { kategori: 'muayene', tarih: arac.muayeneTarihi, bildirim: arac.bildirimler },
      { kategori: 'sigorta', tarih: arac.sigortaTarihi, bildirim: arac.bildirimler },
      { kategori: 'kasko', tarih: arac.kaskoTarihi, bildirim: arac.bildirimler },
      { kategori: 'bakim', tarih: arac.bakimTarihi, bildirim: arac.bildirimler },
    ];

    for (const item of tarihler) {
      if (item.tarih) {
        const kalanGun = kalanGunHesapla(item.tarih);
        if (kalanGun !== null) {
          const bildirimKey = `gun${Math.max(Math.min(kalanGun, 60), 1)}` as keyof Bildirimler;
          rapor.push({
            aracId: arac.id,
            plaka: arac.plaka,
            marka: `${arac.marka} ${arac.model}`,
            kategori: item.kategori,
            tarih: item.tarih,
            kalanGun,
            bildirimAktif: item.bildirim[bildirimKey] ?? false,
          });
        }
      }
    }
  }

  return rapor.sort((a, b) => a.kalanGun - b.kalanGun);
};

// Örnek veri yükle
export const seedDatabase = () => {
  veriyiYukle();
  if (araclarDb.length > 0) return;

  araclarDb = [
    {
      id: uuidv4(),
      plaka: '34ABC123',
      marka: 'Renault',
      model: 'Clio',
      yil: 2018,
      muayeneTarihi: '2026-09-01',
      sigortaTarihi: '2026-06-15',
      kaskoTarihi: '2026-07-10',
      bakimTarihi: '2026-05-20',
      bildirimler: { gun60: true, gun30: true, gun7: true, gun1: true, saat: '09:00' },
      olusturmaTarihi: new Date().toISOString(),
      guncellemeTarihi: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      plaka: '06XYZ789',
      marka: 'Toyota',
      model: 'Corolla',
      yil: 2020,
      muayeneTarihi: '2026-10-05',
      sigortaTarihi: '2026-08-20',
      kaskoTarihi: null,
      bakimTarihi: '2026-06-01',
      bildirimler: { gun60: true, gun30: true, gun7: true, gun1: true, saat: '10:00' },
      olusturmaTarihi: new Date().toISOString(),
      guncellemeTarihi: new Date().toISOString(),
    },
  ];
  veriyiKaydet();
};
