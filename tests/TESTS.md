# 🧪 CareMind — Birim Test Dokümantasyonu

> **Proje:** CareMind — Muayene & Sigorta Takip Uygulaması  
> **Test Çerçevesi:** Jest + ts-jest  
> **Son Güncelleme:** Mayıs 2026

---

## 📁 Klasör Yapısı

```
tests/
├── __mocks__/
│   ├── asyncStorage.ts          # @react-native-async-storage mock'u
│   └── expoConstants.ts         # expo-constants mock'u
│
├── backend/
│   ├── aiService.test.ts        # AI katmanı birim testleri
│   ├── apiLayer.test.ts         # API katmanı birim testleri
│   └── database.test.ts         # Veritabanı CRUD birim testleri
│
├── frontend/
│   ├── aiService.test.ts        # Frontend AI servis testleri
│   └── aracStorage.test.ts      # AsyncStorage servis testleri
│
├── coverage/                    # npm run test:coverage sonrası oluşur
│   └── index.html               # HTML coverage raporu
│
└── TESTS.md                     # Bu dosya
```

---

## ⚙️ Kurulum

Test bağımlılıklarını yükle (proje kök dizininde):

```bash
npm install
```

Yüklenen test paketleri:

| Paket | Sürüm | Açıklama |
|---|---|---|
| `jest` | ^29.7.0 | Test çerçevesi |
| `ts-jest` | ^29.1.4 | TypeScript → Jest dönüştürücü |
| `@types/jest` | ^29.5.12 | Jest tip tanımları |

---

## 🚀 Testleri Çalıştırma

| Komut | Açıklama |
|---|---|
| `npm test` | Tüm testleri çalıştırır |
| `npm run test:watch` | Değişiklikleri izleyerek testleri tekrar çalıştırır |
| `npm run test:coverage` | Coverage raporu ile çalıştırır |
| `npm run test:backend` | Yalnızca backend testleri |
| `npm run test:frontend` | Yalnızca frontend testleri |

---

## 📋 Test Dosyaları & Kapsam

### Backend

#### `tests/backend/database.test.ts`

Veritabanı CRUD işlemlerini test eder. Gerçek dosya sistemi veya ağ bağlantısı gerektirmez.

| Test Grubu | Test Sayısı | Açıklama |
|---|---|---|
| `createArac()` | 4 | UUID atama, timestamp, varsayılan saat |
| `getAllAraclar()` | 3 | Boş dizi, eleman sayısı, derin kopya |
| `getAracById()` | 2 | Mevcut/yok araç |
| `getAracByPlaka()` | 2 | Büyük/küçük harf, yok plaka |
| `updateArac()` | 3 | Alan güncelleme, timestamp, yok id |
| `deleteArac()` | 2 | Silme, yok id |
| `deleteAllAraclar()` | 1 | Toplu temizlik |
| `kalanGunHesapla()` | 4 | null, bugün, geçmiş, gelecek |
| `generateBildirimRaporu()` | 4 | Boş, dolu, sıralama, null tarih |
| Bildirim Saati | 2 | Get/set persistence |

**Toplam: ~31 test**

---

#### `tests/backend/apiLayer.test.ts`

API katmanı yardımcı fonksiyonlarını test eder. HTTP sunucusu gerektirmez — `mockResponse()` ile Response nesnesi simüle edilir.

| Test Grubu | Test Sayısı | Açıklama |
|---|---|---|
| `gecerliISOTarihMi()` | 10 | Geçerli/geçersiz ISO tarihler |
| `gecerliSaatMi()` | 8 | Geçerli/geçersiz HH:mm saatler |
| `gecerliPlakaMi()` | 6 | Geçerli/geçersiz plaka formatları |
| `getClientIP()` | 3 | x-forwarded-for, socket, unknown |
| `successResponse()` | 4 | Status kodu, success flag, meta |
| `errorResponse()` | 3 | Status kodu, success flag, meta |

**Toplam: ~34 test**

---

#### `tests/backend/aiService.test.ts`

AI servisi deterministik fonksiyonlarını test eder. Gemini API çağrısı yapılmaz.

| Test Grubu | Test Sayısı | Açıklama |
|---|---|---|
| `rateLimitAsildi()` | 4 | İlk istek, farklı kimlikler, 20 sınır, boş kimlik |
| `onbellekTemizle()` | 2 | Hata yok, ardışık çağrı |
| `aiDurumRaporu()` | 3 | Anahtar varlığı, tipler, başlangıç boyutu |

**Toplam: ~9 test**

> **Not:** `getAIAdvice()` Gemini API'ye gerçek istek yaptığından entegrasyon testi kapsamındadır.  
> Entegrasyon testleri için `.env` dosyasında `GEMINI_API_KEY` gereklidir.

---

### Frontend

#### `tests/frontend/aracStorage.test.ts`

AsyncStorage tamamen mock'lanır; gerçek depolama kullanılmaz.

| Test Grubu | Test Sayısı | Açıklama |
|---|---|---|
| `getAraclar()` | 2 | Boş dizi, eklenen araç |
| `addArac()` | 3 | UUID format, timestamp, persist |
| `updateArac()` | 2 | Alan güncelleme, timestamp değişimi |
| `deleteArac()` | 2 | Silme, yok id hata yok |
| `clearTumVeriler()` | 1 | Toplu temizlik |
| Bildirim Saati | 2 | Başlangıç değeri, set/get |

**Toplam: ~12 test**

---

#### `tests/frontend/aiService.test.ts`

`global.fetch` mock'lanır; ağ çağrısı yapılmaz.

| Test Grubu | Test Sayısı | Açıklama |
|---|---|---|
| `getAracTavsiyesi()` | 4 | Başarılı yanıt, hata yanıt, ağ hatası, URL doğrulama |

**Toplam: ~4 test**

---

## 📊 Coverage Hedefleri

| Metrik | Hedef |
|---|---|
| Satır (Lines) | ≥ %70 |
| Fonksiyon (Functions) | ≥ %70 |
| Dal (Branches) | ≥ %60 |
| İfade (Statements) | ≥ %70 |

Coverage raporu: `tests/coverage/index.html`

---

## 🏗️ Mock Stratejisi

| Bağımlılık | Mock Konumu | Yöntem |
|---|---|---|
| `@react-native-async-storage/async-storage` | `tests/__mocks__/asyncStorage.ts` | `moduleNameMapper` + in-memory store |
| `expo-constants` | `tests/__mocks__/expoConstants.ts` | `moduleNameMapper` + boş nesne |
| `global.fetch` | Test dosyasında | `jest.fn()` ile inline mock |
| Gemini API | Mock edilmez | Entegrasyon testleri ayrı çalıştırılır |

---

## ➕ Yeni Test Ekleme

1. İlgili klasörü seç: `tests/backend/` veya `tests/frontend/`
2. Dosyayı `*.test.ts` uzantısıyla oluştur — Jest otomatik algılar
3. Dışarıya bağımlı modülleri `jest.mock()` veya `moduleNameMapper` ile mockla
4. `npm test` ile tüm testlerin geçtiğini doğrula

```typescript
// Örnek test şablonu
describe('FonksiyonAdi()', () => {
  test('Beklenen davranış açıklaması', () => {
    // Arrange
    const girdi = '...';
    // Act
    const sonuc = fonksiyonAdi(girdi);
    // Assert
    expect(sonuc).toBe('beklenen');
  });
});
```

---

## ⚠️ Bilinen Kısıtlamalar

| Kısıtlama | Açıklama | Çözüm |
|---|---|---|
| Gemini API testi | Gerçek API anahtarı gerektirir | Entegrasyon test ortamına taşı |
| React Native bileşen testleri | Expo bağımlılıkları Jest'te çalışmaz | React Native Testing Library + Detox kullan |
| bildirimService.ts | expo-notifications mock'laması karmaşık | Ayrı entegrasyon test klasörü gerekli |

---

## 📅 Test Geliştirme Takvimi

| Faz | Kapsam | Durum |
|---|---|---|
| Faz 1 | Backend CRUD birim testleri | ✅ Tamamlandı |
| Faz 1 | API katmanı birim testleri | ✅ Tamamlandı |
| Faz 1 | AI servis birim testleri | ✅ Tamamlandı |
| Faz 1 | Frontend storage testleri | ✅ Tamamlandı |
| Faz 2 | Entegrasyon testleri (API) | 🔜 Planlı |
| Faz 2 | E2E testleri (Detox) | 🔜 Planlı |
| Faz 3 | Performans testleri | 🔜 Planlı |
