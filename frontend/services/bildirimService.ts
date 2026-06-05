import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { BILDIRIM_GUNLERI } from '../constants/bildirimAraliklari';
import type { BildirimIzinDurumu } from '../types/Api';
import type { Arac, TarihKategorisi } from '../types/Arac';
import { KATEGORI_BASLIKLARI, TARIH_KATEGORILERI } from '../types/Arac';
import {
  clearAracBildirimIdleri,
  clearTumBildirimKayitlari,
  setAracBildirimIdleri,
  setCachedBildirimIzni,
} from './aracStorage';
import { bildirimIcinOnceliklendir } from '../utils/bildirimOnceliklendir';
import { saatStringiniParcala, tarihStringiniDateYap } from '../utils/tarihHesapla';

let handlerHazir = false;
const BILDIRIM_AKTIF_ANAHTARI = '@caremind:notificationsEnabled';

const bildirimTercihiAktifMi = async () => {
  const tercih = await AsyncStorage.getItem(BILDIRIM_AKTIF_ANAHTARI);
  return tercih === null || tercih === '1' || tercih === 'true';
};

export const bildirimleriYapilandir = async () => {
  if (!handlerHazir) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    handlerHazir = true;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('caremind-hatirlatici', {
      name: 'CareMind Hatirlaticilari',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#CC6B3E',
    });
  }
};

const statusDegeriniCevir = (durum?: Notifications.PermissionStatus): BildirimIzinDurumu => {
  if (durum === 'granted') {
    return 'granted';
  }

  if (durum === 'denied') {
    return 'denied';
  }

  return 'undetermined';
};

export const izinIste = async (): Promise<BildirimIzinDurumu> => {
  if (Platform.OS === 'web' || !Device.isDevice) {
    return 'undetermined';
  }

  await bildirimleriYapilandir();

  const mevcut = await Notifications.getPermissionsAsync();

  if (mevcut.granted) {
    await setCachedBildirimIzni('granted');
    return 'granted';
  }

  const sonuc = await Notifications.requestPermissionsAsync();
  const durum = statusDegeriniCevir(sonuc.status);
  await setCachedBildirimIzni(durum);
  return durum;
};

export const izinDurumunuKontrolEt = async (): Promise<BildirimIzinDurumu> => {
  if (Platform.OS === 'web') {
    return 'undetermined';
  }

  const sonuc = await Notifications.getPermissionsAsync();
  const durum = statusDegeriniCevir(sonuc.status);
  await setCachedBildirimIzni(durum);
  return durum;
};

const gunAktifMi = (arac: Arac, gun: number) => {
  if (gun === 60) {
    return arac.bildirimler.gun60;
  }

  if (gun === 30) {
    return arac.bildirimler.gun30;
  }

  if (gun === 7) {
    return arac.bildirimler.gun7;
  }

  return arac.bildirimler.gun1;
};

const kategoriTarihiniAl = (arac: Arac, kategori: TarihKategorisi) =>
  arac[`${kategori}Tarihi` as keyof Arac] as string | null;

const tarihIcinBildirimler = async (arac: Arac, kategori: TarihKategorisi) => {
  const tarih = kategoriTarihiniAl(arac, kategori);

  if (!tarih) {
    return [] as string[];
  }

  const hedef = tarihStringiniDateYap(tarih);
  const { saat, dakika } = saatStringiniParcala(arac.bildirimler.saat);
  const idler: string[] = [];

  for (const gun of BILDIRIM_GUNLERI) {
    if (!gunAktifMi(arac, gun)) {
      continue;
    }

    const tetikTarihi = new Date(hedef);
    tetikTarihi.setDate(tetikTarihi.getDate() - gun);
    tetikTarihi.setHours(saat, dakika, 0, 0);

    if (tetikTarihi.getTime() <= Date.now()) {
      continue;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${arac.marka} ${arac.model}`.trim() || arac.plaka,
        body: `${KATEGORI_BASLIKLARI[kategori]} icin ${gun} gun kaldi.`,
        data: {
          aracId: arac.id,
          kategori,
        },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: tetikTarihi,
        channelId: Platform.OS === 'android' ? 'caremind-hatirlatici' : undefined,
      },
    });

    idler.push(id);
  }

  return idler;
};

export const aracBildirimleriniPlanla = async (arac: Arac) => {
  if (Platform.OS === 'web') {
    return [] as string[];
  }

  const tumIdler: string[] = [];

  for (const kategori of TARIH_KATEGORILERI) {
    const idler = await tarihIcinBildirimler(arac, kategori);
    tumIdler.push(...idler);
  }

  await setAracBildirimIdleri(arac.id, tumIdler);
  return tumIdler;
};

export const aracBildirimleriniIptalEt = async (aracId: string) => {
  if (Platform.OS === 'web') {
    return;
  }

  const mevcut = await Notifications.getAllScheduledNotificationsAsync();
  const aracIdleri = new Set(
    mevcut
      .filter((kalem) => kalem.content.data?.aracId === aracId)
      .map((kalem) => kalem.identifier),
  );

  await Promise.all(
    Array.from(aracIdleri).map((identifier) =>
      Notifications.cancelScheduledNotificationAsync(identifier),
    ),
  );

  await clearAracBildirimIdleri(aracId);
};

export const senkronizeTumBildirimler = async (araclar: Arac[]) => {
  if (Platform.OS === 'web') {
    return {
      atlananAracIdleri: [] as string[],
      planlananBildirimSayisi: 0,
    };
  }

  const izin = await izinDurumunuKontrolEt();

  if (izin !== 'granted' || !(await bildirimTercihiAktifMi())) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await clearTumBildirimKayitlari();

    return {
      atlananAracIdleri: [] as string[],
      planlananBildirimSayisi: 0,
    };
  }

  await bildirimleriYapilandir();
  await Notifications.cancelAllScheduledNotificationsAsync();
  await clearTumBildirimKayitlari();

  const oncelikliAraclar = bildirimIcinOnceliklendir(araclar);
  const secilenler = new Set(oncelikliAraclar.map((arac) => arac.id));
  let planlananBildirimSayisi = 0;

  for (const arac of oncelikliAraclar) {
    const idler = await aracBildirimleriniPlanla(arac);
    planlananBildirimSayisi += idler.length;
  }

  const atlananAracIdleri = araclar
    .filter((arac) => !secilenler.has(arac.id))
    .map((arac) => arac.id);

  return {
    atlananAracIdleri,
    planlananBildirimSayisi,
  };
};
