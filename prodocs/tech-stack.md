# CareMind Teknoloji Yığını

Son güncelleme: 11 Haziran 2026

Bu doküman projede kullanılan teknolojileri, neden seçildiklerini ve birbirleriyle nasıl çalıştıklarını açıklar.

## 1. Genel Mimari

CareMind üç istemci/servis alanından oluşur:

- Mobil uygulama: Expo + React Native.
- Web uygulaması: Vite + React.
- Backend API: Express + TypeScript.

Temel yaklaşım offline-first'tür. Araç takibi internet olmadan çalışabilir; backend ise senkronizasyon, AI ve sigorta teklif katmanı için kullanılır.

## 2. Mobil Uygulama

| Teknoloji | Kullanım |
|---|---|
| Expo SDK 54 | iOS/Android geliştirme, build ve native modül yönetimi |
| React Native 0.81 | Mobil UI ve platform ortak kod tabanı |
| Expo Router | Dosya tabanlı navigation |
| TypeScript | Tip güvenliği ve model tutarlılığı |
| AsyncStorage | Offline araç verisi ve ayar saklama |
| expo-notifications | Yerel bildirim planlama |
| expo-location | Yakın istasyon gibi konum tabanlı akışlar için altyapı |
| react-native-webview | Sigorta teklif/web yönlendirme akışları |
| date-fns veya yerel tarih yardımcıları | Kalan gün ve tarih formatlama |

Mobil uygulamada veri önce cihazda tutulur. Bu sayede kullanıcı internet yokken de araç listesini ve tarihleri görebilir.

## 3. Web Uygulaması

| Teknoloji | Kullanım |
|---|---|
| Vite | Hızlı geliştirme sunucusu ve production build |
| React 19 | Web UI bileşenleri |
| React Router 7 | Sayfa geçişleri |
| TypeScript | Ortak veri modeline yakın tipler |
| localStorage | Giriş yapılmadığında offline/local veri |
| CSS custom properties | Tasarım tokenları ve tema yönetimi |

Web sayfaları:

- Dashboard
- Araç ekleme/düzenleme
- Araç detay
- Profil
- Ayarlar
- Sigorta karşılaştırma
- Mobil demo
- Giriş/kayıt

Web uygulaması giriş yapılmadığında localStorage kullanır. Giriş yapıldığında `X-User-Email` header'ı üzerinden backend ile konuşur.

## 4. Backend API

| Teknoloji | Kullanım |
|---|---|
| Node.js | Çalışma zamanı |
| Express | REST API |
| TypeScript | Backend tip güvenliği |
| dotenv | Ortam değişkenleri |
| cors | İzinli origin yönetimi |
| uuid | Araç kimliği üretimi |
| axios/fetch adapterları | Sigorta sağlayıcı istekleri |

Backend sorumlulukları:

- Araç CRUD işlemleri.
- Kullanıcı e-postasına göre veri ayrımı.
- AI danışman isteklerini Gemini'ye güvenli şekilde iletme.
- Sigorta teklif sağlayıcılarını tek endpoint altında birleştirme.
- Sağlık kontrolü ve admin veri temizliği.

## 5. AI Katmanı

| Parça | Açıklama |
|---|---|
| Sağlayıcı | Google Gemini API |
| Varsayılan model | `gemini-2.0-flash` |
| Fallback model | `.env` ile `GEMINI_FALLBACK_MODELS` üzerinden ayarlanır |
| Endpointler | `GET /api/ai/tavsiye/:id`, `POST /api/ai/tavsiye` |
| Prompt tipleri | `tavsiye`, `ozet`, `uyari` |

AI anahtarı sadece backend ortamında tutulur. İstemci uygulamalar doğrudan Gemini API çağırmaz.

## 6. Veri ve Senkronizasyon

| Ortam | Depolama |
|---|---|
| Mobil | AsyncStorage |
| Web | localStorage |
| Backend development | in-memory veya dosya tabanlı JSON |
| Backend production | persistent disk üzerinde dosya veya ileride Supabase/PostgreSQL |

Senkronizasyon yaklaşımı:

1. Kullanıcı giriş yapmamışsa istemci kendi yerel verisini kullanır.
2. Kullanıcı e-posta/profil ile giriş yaparsa API çağrılarında `X-User-Email` header'ı gönderilir.
3. Backend bu header'a göre araçları filtreler.
4. API hatasında istemci local veriye geri düşer.

## 7. Sigorta Teklif Katmanı

| Mod | Açıklama |
|---|---|
| Tahmini/affiliate mod | Varsayılan olarak çalışır, ek sağlayıcı anahtarı gerektirmez. |
| Gerçek sağlayıcı modu | `.env` ile sağlayıcı URL ve anahtarları tanımlandığında devreye alınabilir. |
| Fallback | Sağlayıcı başarısızsa kullanıcıyı genel teklif sayfasına yönlendirir. |

Detaylar için `backend/INSURER_README.md` dosyası kullanılmalıdır.

## 8. Test Altyapısı

| Teknoloji | Kullanım |
|---|---|
| Jest | Birim test çerçevesi |
| ts-jest | TypeScript test dönüştürme |
| mocks | AsyncStorage, Expo modülleri ve fetch izolasyonu |

Komutlar:

```bash
npm test
npm run test:backend
npm run test:frontend
npm run test:coverage
```

## 9. Build ve Dağıtım

| Katman | Build | Dağıtım |
|---|---|---|
| Backend | `npm run build` | Render/Railway/Fly.io |
| Web | `cd web && npm run build` | Static hosting |
| Mobil | `cd frontend && eas build` | EAS, TestFlight, Play Internal |

Üretim ortamında dikkat edilmesi gerekenler:

- `GEMINI_API_KEY` sunucu tarafında tanımlı olmalı.
- `ADMIN_API_KEY` güçlü olmalı.
- `CORS_ORIGIN` sadece izinli domainleri içermeli.
- Backend veri dosyası persistent diske yazılmalı.
- Web production ortamında `VITE_API_URL` doğru backend adresini göstermeli.

## 10. Bilinen Teknik Borçlar

- Web kaynak dosyalarında bazı Türkçe karakterler mojibake olarak görünebiliyor; arayüz metinleri kod içinde temizlenmeli.
- Harf tabanlı ikonlar yerine tutarlı ikon seti tercih edilmeli.
- Backend kalıcı veri katmanı ileride dosya tabanlı yapıdan yönetilen veritabanına taşınmalı.
- E2E test altyapısı henüz yok.
- AI hata/kota durumları için daha zengin fallback deneyimi eklenmeli.
