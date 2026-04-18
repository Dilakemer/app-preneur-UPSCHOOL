# 🧠 CareMind — MVP Geliştirme Planı

> **Proje:** CareMind — Muayene & Sigorta Takip Uygulaması
> **Platform:** iOS & Android (React Native + Expo)
> **Aşama:** Faz 1 — MVP
> **Son Güncelleme:** 18 Nisan 2026

---

## 📌 Kuzey Yıldızı Metrikleri

| Öncelik | Metrik | Hedef (MVP) |
|---|---|---|
| 🥇 Birincil | Aktif bildirim kurulumu tamamlanmış araç sayısı | Kullanıcı başına ≥1 araç |
| 🥈 İkincil | Sigorta teklif ekranından affiliate linkine tıklama oranı | ≥%15 |

---

## 🏗️ Mimari & Tech Stack

```
CareMind (Faz 1 — Fully Offline)
│
├── 📱 Mobil İstemci
│    ├── React Native 0.73+ / Expo SDK 50+
│    ├── TypeScript (zorunlu)
│    ├── React Navigation v6 (Stack + Bottom Tab)
│    └── NativeWind (Tailwind CSS for RN)
│
├── 💾 Yerel Veri
│    └── AsyncStorage — JSON, backend yok, offline-first
│
├── 🔔 Bildirim
│    └── expo-notifications — yerel zamanlı push, backend gerektirmez
│
├── 📅 Tarih İşlemleri
│    └── date-fns
│
├── 🔌 Dış API'ler (MVP)
│    ├── Google Maps Deep Link     → Yakın istasyon (v1.0 — hemen)
│    ├── Google Places API         → Yakın istasyon listesi (v1.1)
│    ├── Sigortam.net Affiliate    → Gelir modeli
│    └── Sentry                   → Crash & hata izleme
│
└── 🔌 Dış API'ler (Faz 2)
     ├── Firebase Cloud Messaging → Sunucu taraflı push
     ├── Supabase                 → Backend + bulut sync
     ├── e-Devlet OAuth           → Araç verisi otomatik çekme
     └── RevenueCat               → Premium abonelik
```

---

## 📁 Klasör Yapısı

```
caremind/
├── app/
│   ├── _layout.tsx                  # Root layout, onboarding kontrolü
│   ├── onboarding/
│   │   └── index.tsx                # SCR-01
│   ├── (tabs)/
│   │   ├── _layout.tsx              # Tab navigator
│   │   ├── index.tsx                # SCR-02 Ana Ekran
│   │   └── ayarlar.tsx              # SCR-06
│   ├── arac/
│   │   ├── ekle.tsx                 # SCR-03 (yeni)
│   │   └── [id]/
│   │       ├── index.tsx            # SCR-04 Detay
│   │       └── duzenle.tsx          # SCR-03 (düzenleme)
│   └── sigorta-teklifi.tsx          # SCR-05
│
├── components/
│   ├── AracKarti.tsx
│   ├── RenkGostergesi.tsx
│   ├── BildirimIzinBanner.tsx
│   ├── TarihSatiri.tsx
│   ├── DatePickerField.tsx
│   └── EmptyState.tsx
│
├── services/
│   ├── aracStorage.ts               # AsyncStorage CRUD
│   ├── bildirimService.ts           # expo-notifications
│   ├── googleMapsService.ts         # Places API & deep link
│   └── sigortaService.ts            # Affiliate API
│
├── hooks/
│   ├── useAraclar.ts
│   ├── useNotificationObserver.ts
│   └── useKonum.ts                  # expo-location
│
├── types/
│   ├── Arac.ts
│   └── Api.ts                       # API response tipleri
│
├── utils/
│   ├── tarihHesapla.ts
│   ├── renkBelirle.ts
│   └── bildirimOnceliklendir.ts
│
├── constants/
│   ├── bildirimAraliklari.ts
│   ├── renkler.ts
│   └── apiKeys.ts                   # env'den okunan keyler
│
└── assets/
    ├── images/
    └── fonts/
```

---

## 🗂️ FAZLAR, GÖREVLER & MİLESTONE'LAR

---

### ▸ FAZ 0 — Proje Kurulumu `[~1 gün]`

#### T-0.1 · Expo Projesi Oluşturma
- [ ] `npx create-expo-app caremind --template expo-template-blank-typescript` komutunu çalıştır
- [ ] Node.js sürümünü doğrula (≥18.x)
- [ ] Expo Go uygulamasında fiziksel cihazda ilk çalıştırmayı doğrula
- [ ] `app.json`'u güncelle: `name`, `slug`, `version: "1.0.0"`, `orientation: "portrait"`

#### T-0.2 · EAS Yapılandırması
- [ ] `npm install -g eas-cli` ile EAS CLI kur
- [ ] `eas login` → Expo hesabına bağlan
- [ ] `eas build:configure` → `eas.json` oluştur
- [ ] `eas.json`'a üç profil ekle:
  ```json
  {
    "build": {
      "development": { "developmentClient": true, "distribution": "internal" },
      "preview":     { "distribution": "internal" },
      "production":  { "autoIncrement": true }
    }
  }
  ```

#### T-0.3 · Bağımlılık Kurulumu
- [ ] Navigasyon:
  ```bash
  npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
  npx expo install react-native-screens react-native-safe-area-context
  ```
- [ ] Veri & Bildirim:
  ```bash
  npx expo install @react-native-async-storage/async-storage
  npx expo install expo-notifications expo-device
  npx expo install expo-location
  ```
- [ ] UI & Yardımcı:
  ```bash
  npm install nativewind && npm install --save-dev tailwindcss
  npm install date-fns react-native-uuid
  npx expo install react-native-webview
  npx expo install @react-native-community/datetimepicker
  ```
- [ ] API & İzleme:
  ```bash
  npx expo install @sentry/react-native
  npx expo install react-native-maps
  npm install @googlemaps/google-maps-services-js
  npx expo install @react-native-community/netinfo
  ```

#### T-0.4 · Geliştirme Ortamı Konfigürasyonu
- [ ] `.eslintrc.js` oluştur (Airbnb + TypeScript kuralları)
- [ ] `.prettierrc` oluştur (`semi: true`, `singleQuote: true`, `trailingComma: "all"`)
- [ ] `tailwind.config.js` oluştur; `content: ["./app/**/*.tsx", "./components/**/*.tsx"]`
- [ ] `babel.config.js`'e NativeWind plugin'i ekle
- [ ] `tsconfig.json` path alias'larını ayarla: `@/components`, `@/services`, `@/types`, `@/utils`
- [ ] `.env` dosyası oluştur (API key'leri burada, `.gitignore`'a ekle)
- [ ] `constants/apiKeys.ts` oluştur:
  ```typescript
  export const GOOGLE_MAPS_API_KEY   = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '';
  export const SENTRY_DSN            = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';
  export const SIGORTAM_AFFILIATE_URL = process.env.EXPO_PUBLIC_SIGORTAM_URL ?? '';
  ```

#### T-0.5 · Sentry Kurulumu `[API #1]`
- [ ] [sentry.io](https://sentry.io) → "caremind" projesi oluştur (React Native platform seç)
- [ ] DSN değerini `.env`'e ekle: `EXPO_PUBLIC_SENTRY_DSN=https://...`
- [ ] `App.tsx`'e Sentry init ekle:
  ```typescript
  import * as Sentry from '@sentry/react-native';
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: 0.2,
  });
  ```
- [ ] `app.json`'a Sentry plugin'i ekle (source map upload için)
- [ ] ✔ Doğrulama: Kasıtlı hata fırlat → Sentry dashboard'unda göründüğünü teyit et

#### T-0.6 · Git & Versiyon Kontrolü
- [ ] `git init` + GitHub/GitLab remote repo oluştur
- [ ] `.gitignore`'a ekle: `node_modules/`, `.env`, `*.jks`, `*.p8`, `*.p12`, `ios/`, `android/`
- [ ] `main` → production, `develop` → geliştirme, `feature/*` → özellik branch stratejisi belirle
- [ ] İlk commit: `feat: initial project setup`

**✅ Milestone 0 → Proje TypeScript hatasız derleniyor, Sentry aktif, EAS yapılandırması hazır.**

---

### ▸ FAZ 1 — Veri Katmanı `[~2 gün]`

#### T-1.1 · Tip Tanımları
- [ ] `types/Arac.ts` dosyasını oluştur:
  ```typescript
  export type TarihKategorisi = 'muayene' | 'sigorta' | 'kasko' | 'bakim';

  export interface Bildirimler {
    gun60: boolean;
    gun30: boolean;
    gun7: boolean;
    gun1: boolean;
    saat: string;   // "HH:mm" — örn: "09:00"
  }

  export interface Arac {
    id: string;                   // UUID v4
    plaka: string;                // "34ABC123"
    marka: string;
    model: string;
    yil: number;
    muayeneTarihi: string | null; // ISO 8601: "2025-06-15"
    sigortaTarihi: string | null;
    kaskoTarihi: string | null;
    bakimTarihi: string | null;
    bildirimler: Bildirimler;
    olusturmaTarihi: string;      // ISO 8601
    guncellemeTarihi: string;     // ISO 8601
  }

  export const VARSAYILAN_BILDIRIMLER: Bildirimler = {
    gun60: true, gun30: true, gun7: true, gun1: true, saat: '09:00',
  };
  ```
- [ ] `types/Api.ts` dosyasını oluştur (Places API ve Sigorta response tipleri)

#### T-1.2 · Yardımcı Fonksiyonlar
- [ ] `utils/tarihHesapla.ts`:
  - [ ] `kalanGunHesapla(tarih: string): number` — `date-fns differenceInDays` kullan
  - [ ] `tarihFormatla(tarih: string): string` — "15 Haziran 2025" formatı
  - [ ] `enYakinTarihBul(arac: Arac): { kategori: TarihKategorisi; kalanGun: number } | null`
  - [ ] `tarihGecmisMi(tarih: string): boolean`
- [ ] `utils/renkBelirle.ts`:
  - [ ] `durumRengiBelirle(kalanGun: number): 'green' | 'yellow' | 'red'`
    - `> 30` → `'green'` | `15–30` → `'yellow'` | `< 15` veya geçmiş → `'red'`
- [ ] `constants/bildirimAraliklari.ts`:
  ```typescript
  export const BILDIRIM_GUNLERI = [60, 30, 7, 1] as const;
  export type BildirimGunu = typeof BILDIRIM_GUNLERI[number];
  ```

#### T-1.3 · AsyncStorage Servis Katmanı
- [ ] `services/aracStorage.ts` dosyasını oluştur:
  - [ ] `DEPOLAMA_ANAHTARI = '@caremind:araclar'` sabiti
  - [ ] `getAraclar(): Promise<Arac[]>` — hata durumunda boş dizi döner, Sentry'e loglar:
    ```typescript
    export const getAraclar = async (): Promise<Arac[]> => {
      try {
        const json = await AsyncStorage.getItem(DEPOLAMA_ANAHTARI);
        return json ? (JSON.parse(json) as Arac[]) : [];
      } catch (err) {
        Sentry.captureException(err);
        return [];
      }
    };
    ```
  - [ ] `saveAraclar(araclar: Arac[]): Promise<void>` — temel yazma fonksiyonu
  - [ ] `addArac(data: Omit<Arac, 'id' | 'olusturmaTarihi' | 'guncellemeTarihi'>): Promise<Arac>` — UUID üretir, timestamp ekler
  - [ ] `updateArac(arac: Arac): Promise<void>` — `guncellemeTarihi`'ni günceller
  - [ ] `deleteArac(id: string): Promise<void>`
  - [ ] `getOnboardingTamamlandi(): Promise<boolean>`
  - [ ] `setOnboardingTamamlandi(): Promise<void>`
  - [ ] `getVarsayilanBildirimSaati(): Promise<string>` — Ayarlar ekranı için
  - [ ] `setVarsayilanBildirimSaati(saat: string): Promise<void>`

#### T-1.4 · React Hook
- [ ] `hooks/useAraclar.ts` hook'unu oluştur:
  - [ ] `araclar: Arac[]` state'i + `yukleniyor: boolean` state'i
  - [ ] `araciEkle`, `araciGuncelle`, `araciSil` fonksiyonları
  - [ ] `useEffect` ile uygulama açılışında otomatik yükleme
  - [ ] Her mutasyondan sonra AsyncStorage'a otomatik kayıt

**✅ Milestone 1 → Araç CRUD çalışıyor, veri kalıcı, hook hazır.**

---

### ▸ FAZ 2 — Bildirim Motoru `[~2 gün]`

#### T-2.1 · İzin Yönetimi
- [ ] `services/bildirimService.ts` dosyasını oluştur
- [ ] `izinIste(): Promise<'granted' | 'denied' | 'undetermined'>` fonksiyonu:
  ```typescript
  export const izinIste = async () => {
    if (!Device.isDevice) return 'undetermined'; // Simülatör
    const { status } = await Notifications.requestPermissionsAsync();
    return status;
  };
  ```
- [ ] iOS: `UNAuthorizationOptions` → `alert`, `badge`, `sound` talep et
- [ ] İzin durumunu `@caremind:bildirim_izni` anahtarıyla AsyncStorage'a kaydet
- [ ] `izinDurumunuKontrolEt(): Promise<boolean>` — mevcut izni sorgular, yeni istek göndermez

#### T-2.2 · Bildirim Planlayıcı
- [ ] `aracBildirimleriniPlanla(arac: Arac): Promise<string[]>` fonksiyonu:
  - [ ] Her `TarihKategorisi` için döngü: `['muayene', 'sigorta', 'kasko', 'bakim']`
  - [ ] Tarih `null` ise o kategori atlanır
  - [ ] Her aktif toggle için (`BILDIRIM_GUNLERI`):
    - [ ] Kalan gün < bildirim günü ise geçmiş, planlanmaz
    - [ ] Bildirim ID formatı: `{plaka}_{kategori}_{gun}` — örn: `34ABC123_muayene_30`
    - [ ] Bildirim saatini `arac.bildirimler.saat` ("HH:mm") alanından al
    - [ ] `Notifications.scheduleNotificationAsync` çağrısı:
      ```typescript
      await Notifications.scheduleNotificationAsync({
        identifier: `${arac.plaka}_${kategori}_${gun}`,
        content: {
          title: `${arac.marka} ${arac.model}`,
          body: `${kategoriAdi} için ${gun} gün kaldı`,
          data: { aracId: arac.id, kategori },
          sound: true,
        },
        trigger: { date: hedefTarih },
      });
      ```
  - [ ] Planlanan ID'leri `@caremind:bildirimler:{aracId}` anahtarıyla AsyncStorage'a kaydet

#### T-2.3 · Bildirim İptal & Güncelleme
- [ ] `aracBildirimleriniIptalEt(aracId: string): Promise<void>`:
  - [ ] AsyncStorage'dan ID listesini oku
  - [ ] Her biri için `Notifications.cancelScheduledNotificationAsync(id)` çağır
  - [ ] AsyncStorage'dan kaydı temizle
- [ ] `aracBildirimleriniYenile(arac: Arac): Promise<void>` = iptal → yeniden planla
- [ ] `updateArac` çağrısı her zaman `aracBildirimleriniYenile` ile zincirlenir

#### T-2.4 · Bildirim Kotası Yönetimi ⚠️ Kritik
- [ ] `utils/bildirimOnceliklendir.ts` dosyasını oluştur:
  - [ ] `MAX_BILDIRIM = 64` sabiti (Expo cihaz limiti)
  - [ ] Öncelik sırası: 🔴 kırmızı araçlar → 🟡 sarı araçlar → 🟢 yeşil araçlar
  - [ ] Her grup içinde daha yakın tarih önce gelir
  - [ ] `bildirimIcinOnceliklendir(araclar: Arac[]): Arac[]` — kota dahilinde kalacak araçları döner
  - [ ] Kota dışında kalan araçlar için `aracBildirimleriniIptalEt` + UI'da bilgi uyarısı

#### T-2.5 · Deep Link — Bildirim Tıklaması
- [ ] `hooks/useNotificationObserver.ts` oluştur:
  ```typescript
  export const useNotificationObserver = () => {
    const router = useRouter();
    useEffect(() => {
      const sub = Notifications.addNotificationResponseReceivedListener(res => {
        const { aracId } = res.notification.request.content.data;
        if (aracId) router.push(`/arac/${aracId}`);
      });
      return () => sub.remove();
    }, []);
  };
  ```
- [ ] `_layout.tsx` içinde hook'u çağır
- [ ] Uygulama kapalıyken açılma: `Notifications.getLastNotificationResponseAsync()` ile kontrol

#### T-2.6 · Android Bildirim Kanalı
- [ ] `Notifications.setNotificationChannelAsync` çağrısı:
  ```typescript
  await Notifications.setNotificationChannelAsync('caremind-hatirlatici', {
    name: 'Araç Hatırlatıcıları',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF6B35',
  });
  ```
- [ ] Tüm bildirim planlamalarında `channelId: 'caremind-hatirlatici'` kullan

**✅ Milestone 2 → Gerçek cihazda push tetikleniyor, deep link doğru ekranı açıyor, kota aşılmıyor.**

---

### ▸ FAZ 3 — API Entegrasyonları `[~2 gün]`

#### T-3.1 · Google Maps — Yakın İstasyon `[API #2 & #3]`

**v1.0 — Deep Link (hemen, sıfır maliyet):**
- [ ] `services/googleMapsService.ts` dosyasını oluştur
- [ ] `tuvturkIstasyonAc(konum?: { lat: number; lng: number }): void`:
  ```typescript
  export const tuvturkIstasyonAc = (konum?: { lat: number; lng: number }) => {
    const query = konum
      ? `TÜVTÜRK istasyon@${konum.lat},${konum.lng}`
      : 'TÜVTÜRK araç muayene istasyonu';
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(query)}`);
  };
  ```

**v1.1 — Places API (1.000+ kullanıcı sonrası aktifleştir):**
- [ ] Google Cloud Console → proje `caremind-prod` oluştur
- [ ] Şunları etkinleştir: Maps SDK for Android, Maps SDK for iOS, Places API (New)
- [ ] API Key oluştur → `.env`'e `EXPO_PUBLIC_GOOGLE_MAPS_KEY=...` ekle
- [ ] `app.config.ts`'e Maps plugin ekle:
  ```typescript
  plugins: [
    ["expo-location", {
      locationWhenInUsePermission: "Yakın TÜVTÜRK istasyonlarını bulmak için konumunuz kullanılır."
    }],
    ["react-native-maps", { googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY }]
  ]
  ```
- [ ] `yakınIstasyonlariBul(lat: number, lng: number): Promise<Istasyon[]>`:
  ```typescript
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
    `?location=${lat},${lng}&radius=15000&keyword=TÜVTÜRK&key=${GOOGLE_MAPS_API_KEY}`
  );
  ```
- [ ] `hooks/useKonum.ts` oluştur:
  - [ ] `expo-location` ile `requestForegroundPermissionsAsync`
  - [ ] `getCurrentPositionAsync` ile anlık konum al
  - [ ] İzin reddedilirse `null` döner (deep link fallback devreye girer)
- [ ] SCR-04 "Yakın İstasyon Bul" butonu: konum varsa → liste ekranı, yoksa → deep link

#### T-3.2 · Sigorta Affiliate Entegrasyonu `[API #4]`
- [ ] [partner.sigortam.net](https://partner.sigortam.net) üzerinden iş ortağı başvurusu yap → API key al
- [ ] `.env`'e `EXPO_PUBLIC_SIGORTAM_URL=https://partner.sigortam.net/teklif` ekle
- [ ] `services/sigortaService.ts` dosyasını oluştur:
  - [ ] `sigortaTeklifURLiOlustur(arac: Arac): string`:
    ```typescript
    export const sigortaTeklifURLiOlustur = (arac: Arac): string => {
      const params = new URLSearchParams({
        utm_source:   'caremind',
        utm_medium:   'app',
        utm_campaign: 'sigorta_yenileme',
        lead_id:      arac.id,
        plaka:        arac.plaka,
        marka:        arac.marka,
        model:        arac.model,
        yil:          String(arac.yil),
      });
      return `${SIGORTAM_AFFILIATE_URL}?${params.toString()}`;
    };
    ```
  - [ ] `internetBaglantisiVarMi(): Promise<boolean>` — `@react-native-community/netinfo` ile
  - [ ] Fallback URL listesi (Sigortam.net erişilemezse):
    ```
    1. Sigortam.net  → ana
    2. Aksigorta     → yedek 1
    3. Allianz TR    → yedek 2
    ```

**✅ Milestone 3 → Google Maps deep link çalışıyor, sigorta URL'i UTM parametreleriyle doğru oluşturuluyor.**

---

### ▸ FAZ 4 — Ekranlar `[~6 gün]`

#### T-4.1 · SCR-01 — Onboarding `[0.5 gün]`
- [ ] 3 sayfalık yatay `FlatList` slider
- [ ] **Sayfa 1 — Değer Önerisi:** Başlık + ikon animasyonu + kısa açıklama metni
- [ ] **Sayfa 2 — Bildirim İzni:**
  - [ ] İznin neden gerekli olduğunu anlat (yasal ceza vurgusu)
  - [ ] "Bildirimlere İzin Ver" butonu → `izinIste()` çağır
  - [ ] Ret durumunda: "Ayarlardan açabilirsiniz" uyarısı + devam butonu
  - [ ] Ret durumunu global state'e yaz
- [ ] **Sayfa 3 — Başla:**
  - [ ] "İlk Aracımı Ekle" CTA → `SCR-03`'e yönlendir
  - [ ] "Atla" linki → `SCR-02`'ye yönlendir
- [ ] Alt dot indicator (sayfa pozisyonu göstergesi)
- [ ] Onboarding bitişinde `setOnboardingTamamlandi()` çağır
- [ ] `_layout.tsx`'te kontrol: tamamlandıysa Tab Navigator'a yönlendir

#### T-4.2 · SCR-02 — Ana Ekran `[1 gün]`
- [ ] `useAraclar` hook'undan araç listesini çek
- [ ] `FlatList` ile araç kartları (performans için `keyExtractor`, `getItemLayout`)
- [ ] **`<AracKarti />` bileşeni:**
  - [ ] Araç adı: `{marka} {model} ({yil})`
  - [ ] Plaka rozeti (styled)
  - [ ] En yakın tarih: `{kategori adı}: {tarihFormatla(tarih)}`
  - [ ] Kalan gün metni: `{N} gün kaldı` veya `⚠️ Süresi geçti`
  - [ ] `<RenkGostergesi />`: sol kenarda dikey renkli şerit (green-500 / yellow-400 / red-500)
  - [ ] Karta tıklayınca → `SCR-04 Araç Detay`
- [ ] **`<BildirimIzinBanner />`** (yalnızca izin reddedildiyse):
  - [ ] "Bildirimleri Aç" butonu → `Linking.openSettings()`
  - [ ] "×" ile kapatılabilir (oturum boyunca gizle)
- [ ] **`<EmptyState />`** (hiç araç yoksa):
  - [ ] İllüstrasyon + açıklama + "Araç Ekle" butonu
- [ ] Sağ alt FAB butonu (+) → `SCR-03 Araç Ekle` (modal)
- [ ] Pull-to-refresh → `getAraclar()` ile yeniden yükle

#### T-4.3 · SCR-03 — Araç Ekle / Düzenle `[1.5 gün]`
- [ ] `route.params.aracId` varsa düzenleme modu, yoksa ekleme modu
- [ ] Düzenleme modunda mevcut değerleri forma yükle
- [ ] **Form Alanları:**
  - [ ] Plaka (zorunlu): `TextInput`, `autoCapitalize: "characters"`, max 9 karakter
  - [ ] Marka: `TextInput`
  - [ ] Model: `TextInput`
  - [ ] Yıl: `TextInput`, `keyboardType: "numeric"`, 1980–2026 doğrulama
- [ ] **`<DatePickerField />` bileşeni** (4 tarih kategorisi için):
  - [ ] iOS: native `DateTimePicker` modal
  - [ ] Android: native `DatePickerDialog`
  - [ ] "Temizle" butonu (tarihi `null`'a sıfırla)
  - [ ] Seçilen tarihi `"dd MMMM yyyy"` formatında göster
- [ ] **Bildirim Tercihleri Bölümü:**
  - [ ] 60 / 30 / 7 / 1 gün `Switch` toggle'ları (varsayılan: tümü `true`)
  - [ ] Bildirim saati `TimePicker` (varsayılan: `"09:00"`)
- [ ] **Validasyon Kuralları:**
  - [ ] Plaka boş → `"Plaka alanı boş bırakılamaz"` inline kırmızı hata
  - [ ] Yıl geçersiz → `"Geçerli bir yıl girin (1980–2026)"` inline hata
  - [ ] Tarih yok → sarı teşvik mesajı (engelleyici değil)
  - [ ] Herhangi bir hata varsa Kaydet butonu devre dışı bırakılır
- [ ] **Kaydet Butonu:**
  - [ ] Kaydederken `ActivityIndicator` spinner göster
  - [ ] Ekle modu: `addArac()` → `aracBildirimleriniPlanla()` → `SCR-02`'ye dön
  - [ ] Düzenle modu: `updateArac()` → `aracBildirimleriniYenile()` → `SCR-04`'e dön
- [ ] **Sil Butonu** (yalnızca düzenleme modunda):
  - [ ] Kırmızı renk, formun altında
  - [ ] `Alert.alert` onay diyaloğu
  - [ ] Onayda: `deleteArac()` → `aracBildirimleriniIptalEt()` → `SCR-02`'ye dön

#### T-4.4 · SCR-04 — Araç Detay `[1 gün]`
- [ ] `route.params.aracId` ile araç verisini `useAraclar`'dan çek
- [ ] Araç bulunamazsa hata ekranı göster ("Bu araç bulunamadı")
- [ ] Sağ üstte düzenle ikonu → `SCR-03 Düzenle`'ye git
- [ ] **Araç Özet Kartı:** plaka + marka + model + yıl
- [ ] **`<TarihSatiri />` bileşeni** (4 kategori):
  - [ ] Kategori ikonu + adı
  - [ ] Tarih (`"dd MMMM yyyy"`) veya `"Tarih girilmedi"` (gri)
  - [ ] Kalan gün: `"{N} gün kaldı"` ya da `"⚠️ Süresi {N} gün önce doldu"`
  - [ ] Sol renk şeridi (green / yellow / red)
- [ ] **"Yakın İstasyon Bul" butonu** (Muayene satırında):
  - [ ] `useKonum` hook'u çalıştır
  - [ ] Konum izni var: Places API listesi (v1.1) ya da deep link (v1.0 fallback)
  - [ ] Konum izni yok: direkt `tuvturkIstasyonAc()` deep link
- [ ] **"Sigorta Teklifi Al" butonu** (Sigorta satırında):
  - [ ] 30 gün içindeyse turuncu vurgu
  - [ ] Tıklayınca → `SCR-05`'e git

#### T-4.5 · SCR-05 — Sigorta Teklifi `[0.5 gün]`
- [ ] `route.params.aracId` ile araç bilgisini al
- [ ] `sigortaTeklifURLiOlustur(arac)` ile UTM parametreli URL oluştur
- [ ] `internetBaglantisiVarMi()` kontrolü — bağlantı yoksa `Alert.alert` göster ve geri dön
- [ ] `react-native-webview` entegrasyonu:
  ```tsx
  <WebView
    source={{ uri: teklifUrl }}
    startInLoadingState={true}
    renderLoading={() => <ActivityIndicator size="large" />}
    onError={e => Sentry.captureException(e)}
  />
  ```
- [ ] Header'da "Geri" butonu
- [ ] WebView hataları Sentry'e loglanır

#### T-4.6 · SCR-06 — Ayarlar `[0.5 gün]`
- [ ] **Varsayılan Bildirim Saati:**
  - [ ] Mevcut saat `getVarsayilanBildirimSaati()` ile yüklenir
  - [ ] `TimePicker` bileşeni ile değiştir
  - [ ] "Kaydet" → `setVarsayilanBildirimSaati()` + tüm araçların bildirimlerini yenile
- [ ] **Uygulama Bilgisi:**
  - [ ] `expo-constants`'tan versiyon ve build numarası
- [ ] **Destek & Geri Bildirim:**
  - [ ] "Bize Ulaşın" → `Linking.openURL("mailto:destek@caremind.app")`
  - [ ] "Uygulamayı Değerlendir" → `expo-store-review` veya store URL
- [ ] **Gizlilik & Veri:**
  - [ ] "Tüm Verileri Sil" (kırmızı) → onay diyaloğu → `AsyncStorage.clear()` + uygulama yeniden başlar

**✅ Milestone 4 → 6 ekran tamamlandı, API entegrasyonları aktif, uygulama baştan sona gezinilebilir.**

---

### ▸ FAZ 5 — Navigasyon & Global State `[~1 gün]`

#### T-5.1 · Navigation Stack Yapılandırması
- [ ] `app/_layout.tsx`'te başlangıç yönlendirmesi:
  ```
  onboardingTamamlandi = false → Onboarding Stack
  onboardingTamamlandi = true  → Tab Navigator
  ```
- [ ] **Tab Navigator:**
  ```
  Bottom Tab
  ├── Ana Ekran  (ev ikonu)
  └── Ayarlar    (dişli ikonu)
  ```
- [ ] **Modal & Push Stack:**
  ```
  ├── Araç Ekle       → modal presentasyon (SCR-03)
  ├── Araç Düzenle    → modal presentasyon (SCR-03)
  ├── Araç Detay      → push (SCR-04)
  └── Sigorta Teklifi → push (SCR-05)
  ```
- [ ] Header ve tab bar görsel stilini NativeWind ile konfigure et

#### T-5.2 · Global State & Context
- [ ] Bildirim izin durumunu `NotificationContext` ile sarmala (Provider pattern)
- [ ] `useNotificationObserver` hook'unu `_layout.tsx`'e ekle
- [ ] `AppState` event'i dinle: uygulama ön plana gelince izin durumunu yeniden kontrol et

**✅ Milestone 5 → Tüm navigasyon akışları çalışıyor, global state hazır.**

---

### ▸ FAZ 6 — Test & Kalite `[~2 gün]`

#### T-6.1 · Manuel Fonksiyonel Test Senaryoları

| # | Senaryo | Beklenen Sonuç | Platform |
|---|---|---|---|
| T-01 | İlk açılış, onboarding tamamla | Sonraki açılışta onboarding görünmez | iOS + Android |
| T-02 | Araç ekle (tüm alanlar dolu) | Kart ana ekranda doğru renkle görünür | iOS + Android |
| T-03 | Plaka boş bırak, kaydet | Inline kırmızı hata, kayıt olmaz | iOS + Android |
| T-04 | Muayene tarihi 7 gün sonra | Kart 🔴 kırmızı, "7 gün kaldı" metni | iOS + Android |
| T-05 | Muayene tarihi geçmiş | "Süresi N gün önce doldu" ⚠️ uyarısı | iOS + Android |
| T-06 | 60 gün toggle kapat → kaydet | Yalnızca o bildirim iptal edildi | iOS + Android |
| T-07 | Ayarlar'dan bildirim saatini değiştir | Tüm araçların bildirimleri yenilendi | iOS + Android |
| T-08 | 5+ araç ekle | 64 bildirim kotası aşılmaz, önceliklendirme çalışır | iOS + Android |
| T-09 | "Yakın İstasyon Bul" + konum izni verildi | Places API listesi açılır (v1.1) | iOS + Android |
| T-10 | "Yakın İstasyon Bul" + konum izni reddedildi | Google Maps deep link açılır | iOS + Android |
| T-11 | Sigorta 15 gün → "Teklif Al" butonuna bas | WebView açılır, UTM parametreli URL doğru | iOS + Android |
| T-12 | Offline → Sigorta Teklifi ekranı | "İnternet bağlantısı gerekli" alert'i | iOS + Android |
| T-13 | Bildirimi aç, uygulama kapalıyken | Doğru araç detay ekranı açılır | iOS + Android |
| T-14 | Araç sil | Karttan kalktı, bildirimleri iptal edildi | iOS + Android |
| T-15 | Onboarding'de bildirim iznini reddet | Ana ekranda sarı banner görünür | iOS + Android |

#### T-6.2 · Uç Durum Testleri
- [ ] `AsyncStorage.clear()` sonrası uygulama baştan başlar (onboarding görünür)
- [ ] Türkçe karakterler: İ, Ö, Ü, Ş, Ğ, Ç içeren plaka / marka doğru kaydedilip okunuyor
- [ ] Cihaz saati manuel değiştirilince mevcut bildirimler etkilenmiyor
- [ ] Çok uzun marka/model adı → UI taşmıyor (metin tek satırda kesiyor)
- [ ] Yıl sınırları: 1980 ve 2026 araç ekleme → hata yok
- [ ] Tüm tarihler boş araç kaydı → UI düzgün gösteriyor

#### T-6.3 · Sentry Doğrulaması
- [ ] Production build'de kasıtlı hata → Sentry dashboard'unda görünüyor
- [ ] Stack trace okunabilir (source map doğru yüklenmiş)
- [ ] AsyncStorage hatasını simüle et → Sentry'e loglandı

**✅ Milestone 6 → T-01–T-15 tümü geçiyor, Sentry aktif, crash yok.**

---

### ▸ FAZ 7 — Build & Dağıtım `[~1 gün]`

#### T-7.1 · app.config.ts Yapılandırması
- [ ] Bundle ID: `com.caremind.app`
- [ ] iOS izin açıklamaları:
  ```typescript
  "NSUserNotificationUsageDescription": "Araç muayene ve sigorta tarihlerinizi hatırlatmak için bildirim göndeririz.",
  "NSLocationWhenInUseUsageDescription": "Yakın TÜVTÜRK istasyonlarını bulmak için konumunuz kullanılır."
  ```
- [ ] Splash screen (1242×2688) ve uygulama ikonu (1024×1024) ekle
- [ ] Android adaptive icon (512×512 foreground + background) ekle

#### T-7.2 · EAS Build & Dağıtım
- [ ] `eas build --platform ios --profile preview` → TestFlight IPA
- [ ] `eas build --platform android --profile preview` → Play Internal Track AAB
- [ ] Build hatalarını çöz (CocoaPods, Gradle uyumsuzlukları)
- [ ] TestFlight'a yükle → iç test kullanıcılarına davet gönder
- [ ] Google Play Console → Internal Testing → test kullanıcılarına aç
- [ ] Her iki platformda gerçek cihazda (simülatör değil) son kontrol

#### T-7.3 · Mağaza Varlıkları (Production Hazırlığı)
- [ ] App Store ve Play Store açıklamaları (TR + EN)
- [ ] Ekran görüntüleri: iPhone 6.7", 6.5" ve iPad 12.9"
- [ ] Android: telefon + 7" tablet ekran görüntüleri
- [ ] Anahtar kelimeler: "araç muayene", "sigorta takip", "muayene hatırlatıcı", "kasko takip"

**✅ Milestone 7 → Uygulama TestFlight ve Play Internal Track'te yayında, test başlıyor.**

---

## 🔌 API Özet & Başvuru Rehberi

| # | API | Amaç | Faz | Maliyet | Başvuru |
|---|---|---|---|---|---|
| 1 | **Sentry** | Crash & hata izleme | MVP ✅ | 5K hata/ay ücretsiz | sentry.io → yeni proje |
| 2 | **Google Maps Deep Link** | Yakın istasyon (basit) | MVP v1.0 ✅ | Ücretsiz, key gerekmez | — |
| 3 | **Google Places API** | Yakın istasyon listesi | MVP v1.1 ✅ | 28.5K istek/ay ücretsiz | Google Cloud Console |
| 4 | **Sigortam.net Affiliate** | Sigorta teklif geliri | MVP ✅ | Komisyon bazlı | partner.sigortam.net |
| 5 | **Firebase Cloud Messaging** | Sunucu taraflı push | Faz 2 🔜 | Ücretsiz (quota) | Firebase Console |
| 6 | **e-Devlet OAuth + TÜVTÜRK** | Araç verisi otomatik çekme | Faz 2 🔜 | Ücretsiz (kurumsal) | turkiye.gov.tr/e-ntegre |
| 7 | **Supabase** | Backend + bulut sync | Faz 2 🔜 | 500MB DB ücretsiz | supabase.com |
| 8 | **RevenueCat** | Premium abonelik | Faz 2 🔜 | %0 (ilk $2.5K gelir) | revenuecat.com |

### e-Devlet Entegrasyonu — Şimdiden Başlat
MVP yayına alındıktan hemen sonra aşağıdaki adımları başlat (onay 4–8 hafta sürebilir):

```
1. turkiye.gov.tr/bilgilendirme?konu=entegre → kurumsal başvuru formu
2. Vergi levhası + ticaret sicil kaydı hazırla
3. KVKK uyumluluk belgesi hazırla (veri işleme amaçlarını belgele)
4. Onay sonrası erişilebilecek servisler:
   ├── TÜVTÜRK Muayene Durum Sorgulama   → muayene bitiş tarihi
   ├── TÜVTÜRK İstasyon Bilgisi Sorgulama → yakın istasyon listesi
   ├── TÜVTÜRK Randevu Kayıt / İptal      → randevu akışı
   └── Barkodlu Muayene Raporu Sorgulama  → rapor doğrulama
```

---

## ⚠️ Riskler ve Önlemler

| Risk | Olasılık | Etki | Önlem |
|---|---|---|---|
| Expo bildirim kotası (64 limit, 5+ araçta) | Yüksek | Yüksek | `bildirimOnceliklendir.ts` algoritması |
| iOS bildirim izni reddedilmesi | Orta | Yüksek | Onboarding'de net gerekçe + sonradan açılabilir banner |
| Google Places API kotası aşımı | Düşük (başlangıçta) | Orta | v1.1 aktifleştirme eşiği: 1.000+ aktif kullanıcı |
| Sigortam.net API değişikliği / downtime | Orta | Orta | 2 yedek affiliate hazır tut (Aksigorta, Allianz) |
| AsyncStorage bozulması / veri kaybı | Düşük | Yüksek | try/catch + Sentry log + graceful empty state |
| DatePicker iOS vs Android farklılıkları | Orta | Orta | `<DatePickerField />` platform wrapper bileşeni |
| e-Devlet kurumsal başvuru reddedilmesi | Orta | Orta (Faz 2) | MVP'de manuel giriş yeterli, ret olursa TÜVTÜRK scraping araştır |

---

## 📅 Toplam Geliştirme Takvimi

| Faz | Konu | Süre |
|---|---|---|
| 0 | Proje kurulumu + Sentry | 1 gün |
| 1 | Veri katmanı + tipler | 2 gün |
| 2 | Bildirim motoru | 2 gün |
| 3 | API entegrasyonları | 2 gün |
| 4 | 6 ekran geliştirme | 6 gün |
| 5 | Navigasyon & global state | 1 gün |
| 6 | Test & kalite | 2 gün |
| 7 | Build & dağıtım | 1 gün |
| **Toplam** | | **~17 iş günü** |

---

## 🔮 Faz 2 Yol Haritası

| Özellik | Bağımlılık | Hedef Versiyon |
|---|---|---|
| Bulut sync + çoklu cihaz | Supabase | v2.0 |
| Araç verisi otomatik çekme | e-Devlet kurumsal onay | v2.0 |
| Sunucu push bildirimi | Firebase FCM + Supabase | v2.0 |
| iOS / Android widget | Expo App Extensions | v2.1 |
| HGS / OGS bakiye takibi | Karayolları API (mevcut değil) | v2.2 |
| Premium abonelik | RevenueCat | v2.1 |
| Filo yönetimi (10+ araç) | Backend zorunlu | v3.0 |
| Motosiklet profili | UI + veri modeli değişikliği | v2.1 |
| Topluluk / forum | Backend + moderasyon altyapısı | v3.0 |

---
