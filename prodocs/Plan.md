# CareMind Geliştirme Planı

Son güncelleme: 11 Haziran 2026

Bu plan, projenin mevcut durumunu ve sonraki adımları geliştirici, ürün sahibi veya değerlendirici tarafından hızlı anlaşılacak şekilde özetler.

## 1. Mimari Görünüm

```text
CareMind
├── Mobil uygulama
│   ├── Expo + React Native
│   ├── Expo Router
│   ├── AsyncStorage
│   └── expo-notifications
├── Web uygulaması
│   ├── Vite + React
│   ├── React Router
│   ├── localStorage
│   └── responsive dashboard
└── Backend API
    ├── Express + TypeScript
    ├── araç CRUD
    ├── AI danışman
    ├── sigorta teklif adapterı
    └── sağlık/yönetim endpointleri
```

## 2. Tamamlanan Fazlar

| Faz | Durum | Çıktı |
|---|---|---|
| Faz 0 | Tamamlandı | Proje yapısı, TypeScript, temel paketler |
| Faz 1 | Tamamlandı | Araç veri modeli, local/offline depolama |
| Faz 2 | Tamamlandı | Mobil bildirim servisleri ve izin akışı |
| Faz 3 | Tamamlandı | Express API, kullanıcı e-postasına göre veri ayrımı |
| Faz 4 | Tamamlandı | AI danışman endpointleri |
| Faz 5 | Tamamlandı | Web dashboard, araç detay, araç ekleme, ayarlar, profil |
| Faz 6 | Tamamlandı | Sigorta karşılaştırma ve sağlayıcı adapter yapısı |
| Faz 7 | Devam ediyor | Deployment dokümantasyonu, web ekran görüntüleri, polish |

## 3. Güncel Yol Haritası

### Öncelik 1: Kararlılık

- Web ve backend build komutlarının düzenli çalıştığını doğrula.
- Mobilde gerçek cihaz bildirim akışını tekrar test et.
- API hatalarını kullanıcı arayüzünde daha tutarlı göster.
- Local/offline veri ile backend senkronu çakıştığında davranışı netleştir.

### Öncelik 2: Ürün Deneyimi

- Web tarafındaki Türkçe karakter bozulmalarını kod içinde de temizle.
- Profil ekranında oturum durumunu daha anlaşılır hale getir.
- Araç detay ekranında sigorta teklif aksiyonunu daha görünür yap.
- Mobil demo ekranını satış/demo sunumlarına uygun kısa senaryolarla genişlet.

### Öncelik 3: Entegrasyonlar

- Sigorta sağlayıcı sandbox bilgilerini `.env` üzerinden yapılandır.
- Gemini hata/kota durumları için kontrollü fallback metni ekle.
- Render backend URL ve web production URL değerlerini kesinleştir.
- EAS build profillerini production bilgileriyle doğrula.

### Öncelik 4: Kalite

- Jest testlerini CI ortamında koştur.
- Web için temel smoke test senaryosu ekle.
- Backend route seviyesinde entegrasyon testleri ekle.
- Mobilde bildirim ve navigation akışları için manuel test matrisi hazırla.

## 4. Sprint Bazlı İş Listesi

### Sprint A: Dokümantasyon ve Sunum

- README detaylandırıldı.
- Web ekran görüntüleri eklendi.
- PRD, plan, tech stack, design system ve progress dokümanları güncellendi.
- Deployment kontrol listesi ile README bağlantısı kuruldu.

### Sprint B: Kod Temizliği

- Web kaynak dosyalarındaki mojibake/Türkçe karakter bozulmalarını düzelt.
- İkon alanlarında harf yerine tutarlı ikon seti kullan.
- Sidebar ve mobil nav etiketlerini son ürün diliyle hizala.
- Web hata/boş durum metinlerini sadeleştir.

### Sprint C: Backend Sertleştirme

- `ADMIN_API_KEY` production ortamında zorunlu hale getirildiğini doğrula.
- DB persistence dosya yolunun platform persistent diskine yazdığını kontrol et.
- CORS origin listesini web production domaini ile sınırla.
- AI rate limit ve cache davranışını dokümante et.

### Sprint D: Yayın Hazırlığı

- `npm run build` ve `npm test` sonuçlarını kaydet.
- Render backend deploy ayarlarını tamamla.
- Web static deploy için `web/dist` çıktısını doğrula.
- EAS preview build üret ve gerçek cihaz smoke test yap.

## 5. Manuel Test Senaryoları

| Kod | Senaryo | Beklenen Sonuç |
|---|---|---|
| T-01 | Webde ilk açılış | Dashboard açılır, veri yoksa boş durum görünür. |
| T-02 | Webde araç ekleme | Araç localStorage'a yazılır ve listede görünür. |
| T-03 | Plaka boş kayıt | Kayıt engellenir, hata gösterilir. |
| T-04 | Geçersiz yıl | Kayıt engellenir, yıl hatası gösterilir. |
| T-05 | Araç detay | Dört tarih kartı ve kalan günler görünür. |
| T-06 | AI tavsiye | Backend açıksa AI cevabı veya anlamlı hata döner. |
| T-07 | Sigorta ekranı | Tahmini teklifler fiyat sırasıyla listelenir. |
| T-08 | Mobil demo | Senaryo ve cihaz seçimleri ekranı değiştirir. |
| T-09 | Backend sağlık | `/api/saglik-kontrol` online status döndürür. |
| T-10 | Mobil bildirim | Gerçek cihazda seçili günler için planlama hata vermez. |

## 6. Komutlar

Backend:

```bash
npm install
npm run dev
npm run build
npm test
```

Web:

```bash
cd web
npm install
npm run dev
npm run build
```

Mobil:

```bash
cd frontend
npm install
npm start
npm run build:web
```

## 7. Yayına Hazırlık Kontrolü

- `.env` production değerleri oluşturuldu.
- Gemini anahtarı backend ortamında tanımlandı.
- `ADMIN_API_KEY` güçlü ve gizli tutuluyor.
- `CORS_ORIGIN` sadece izinli domainleri içeriyor.
- Web screenshot ve README güncel.
- Mobil ikon/splash varlıkları doğru.
- EAS preview build gerçek cihazda açılıyor.
- Backend health check public URL üzerinden başarılı.

## 8. Faz 2 Fikirleri

- Bulut kullanıcı hesabı ve çoklu cihaz senkronizasyonu.
- Araç bazlı doküman/fotoğraf saklama.
- Servis geçmişi ve kilometre takibi.
- Gerçek sigorta teklif API entegrasyonu.
- Premium hatırlatma ve gelişmiş raporlar.
- Filo veya aile hesabı modu.
