# CareMind Ürün Gereksinim Dokümanı

Son güncelleme: 11 Haziran 2026  
Durum: MVP geliştirildi, web paneli ve backend entegrasyonları güncellendi.

## 1. Ürün Özeti

CareMind, araç sahiplerinin muayene, trafik sigortası, kasko ve bakım tarihlerini tek yerde takip etmesini sağlar. Ürün; mobil uygulama, web paneli ve backend API olmak üzere üç katmandan oluşur.

Ana değer önerisi:

> Araç bilgilerini bir kez gir, kritik tarihleri kaçırma, gerektiğinde AI destekli bakım ve sigorta önerisi al.

## 2. Hedef Kullanıcılar

| Kullanıcı | İhtiyaç |
|---|---|
| Bireysel araç sahibi | Muayene, sigorta ve bakım tarihlerini unutmak istemez. |
| Ailede birden fazla araç takip eden kişi | Birden çok aracın tarihlerini tek panelde görmek ister. |
| Sigorta yenileme dönemindeki kullanıcı | Fiyatları hızlıca karşılaştırmak ve teklif sayfasına gitmek ister. |
| Teknik/demo izleyicisi | Mobil deneyimi web üzerinde hızlıca görmek ister. |

## 3. Başarı Metrikleri

| Metrik | Hedef |
|---|---|
| Aktif takipteki araç sayısı | Kullanıcı başına en az 1 araç |
| Takip edilen tarih sayısı | Araç başına en az 2 tarih |
| Sigorta ekranı etkileşimi | Yaklaşan sigorta tarihli kullanıcılarda düzenli kullanım |
| AI danışman kullanımı | Araç detay ekranında tavsiye/özet/uyarı tıklamaları |
| Offline kullanım başarısı | İnternet yokken araç listesinin açılması ve kaydın korunması |

## 4. Kapsam

### MVP Kapsamında

- Araç ekleme, düzenleme ve silme.
- Plaka, marka, model, yıl bilgisi.
- Muayene, sigorta, kasko ve bakım tarihleri.
- Kalan gün hesabı ve renkli durum göstergeleri.
- Mobilde yerel bildirim tercihleri.
- Webde localStorage tabanlı offline kullanım.
- Giriş varsa backend API ile kullanıcıya göre araç senkronizasyonu.
- AI danışman: tavsiye, özet ve uyarı tipleri.
- Sigorta karşılaştırma: tahmini/affiliate mod.
- Mobil deneyim simülasyonu: web içi mock demo ekranı.
- Yönetim ve sağlık kontrol endpointleri.

### Kapsam Dışı

- e-Devlet veya TÜVTÜRK üzerinden otomatik araç verisi çekme.
- HGS/OGS bakiye takibi.
- Gerçek zamanlı sunucu push bildirimleri.
- Kurumsal filo yönetimi.
- Premium abonelik ve ödeme altyapısı.
- App Store/Play Store production yayın sürecinin tamamlanması.

## 5. Platformlar

| Platform | Durum | Not |
|---|---|---|
| Mobil iOS/Android | Var | Expo + React Native ile geliştirildi. |
| Web panel | Var | Vite + React ile geliştirildi. |
| Backend API | Var | Express + TypeScript. |
| Web demo | Var | Mobil akışları mock veriyle gösterir. |

## 6. Veri Modeli

Araç modeli mobil, web ve backend tarafında aynı ana alanları taşır.

| Alan | Tip | Açıklama |
|---|---|---|
| `id` | string | Araç kimliği |
| `plaka` | string | Araç plakası |
| `marka` | string | Marka |
| `model` | string | Model |
| `yil` | number | Model yılı |
| `muayeneTarihi` | string/null | ISO tarih |
| `sigortaTarihi` | string/null | ISO tarih |
| `kaskoTarihi` | string/null | ISO tarih |
| `bakimTarihi` | string/null | ISO tarih |
| `bildirimler.gun60` | boolean | 60 gün kala bildirim |
| `bildirimler.gun30` | boolean | 30 gün kala bildirim |
| `bildirimler.gun7` | boolean | 7 gün kala bildirim |
| `bildirimler.gun1` | boolean | 1 gün kala bildirim |
| `bildirimler.saat` | string | `HH:mm` formatında bildirim saati |
| `olusturmaTarihi` | string | ISO timestamp |
| `guncellemeTarihi` | string | ISO timestamp |
| `kullaniciEposta` | string/opsiyonel | Backend tarafında kullanıcı ayrımı |

## 7. Kullanıcı Akışları

### 7.1 Araç Ekleme

1. Kullanıcı araç ekleme ekranına gider.
2. Plaka ve yıl alanlarını doldurur.
3. İsteğe bağlı olarak marka, model ve takip tarihlerini girer.
4. Bildirim tercihlerini seçer.
5. Kaydeder.
6. Araç listeye eklenir ve offline depoya yazılır.
7. Kullanıcı giriş yaptıysa backend ile senkronize edilir.

Kabul kriterleri:

- Plaka boşsa kayıt yapılmaz.
- Yıl 1980 ile mevcut yıl arasında değilse hata gösterilir.
- Tarih girilmemiş araç kaydedilebilir fakat takip değeri düşük kalır.
- Kayıt sonrası dashboard istatistikleri güncellenir.

### 7.2 Araç Detayı ve AI Danışman

1. Kullanıcı dashboard üzerinden bir araca tıklar.
2. Dört tarih kategorisini ve kalan günleri görür.
3. AI danışmandan tavsiye, özet veya uyarı isteyebilir.

Kabul kriterleri:

- Araç bulunamazsa kullanıcı hata ekranı görür.
- AI çağrısı sırasında yüklenme durumu gösterilir.
- Backend erişilemiyorsa kullanıcı anlaşılır hata mesajı alır.

### 7.3 Sigorta Karşılaştırma

1. Kullanıcı sigorta ekranına gider.
2. Kayıtlı araç varsa tahmini fiyatlar araç yılına göre hesaplanır.
3. Kullanıcı teklif almak istediğinde sigorta sağlayıcısı sayfasına yönlendirilir.

Kabul kriterleri:

- Araç yokken de tahmini fiyat listesi gösterilir.
- Teklif kartları fiyat sırasına göre listelenir.
- Varsayılan affiliate hedefi `https://www.sigortam.net/` adresidir.

### 7.4 Web Mobil Demo

1. Kullanıcı Mobil Demo ekranına gider.
2. Senaryo, ekran ve cihaz boyutu seçer.
3. Mobil akışı web üzerinde mock veriyle inceler.

Kabul kriterleri:

- Demo backend kaydı oluşturmaz.
- Senaryo değişince ilgili başlangıç ekranı açılır.
- Telefon çerçevesi desktop ve mobil genişliklerde taşmadan görünür.

## 8. API Gereksinimleri

| Endpoint | Gereksinim |
|---|---|
| `GET /api/araclar` | `X-User-Email` varsa kullanıcı araçlarını döndürür, yoksa boş liste döner. |
| `POST /api/araclar` | Giriş yapan kullanıcı için doğrulanmış araç oluşturur. |
| `PUT /api/araclar/:id` | Aracı kullanıcı sahipliği içinde günceller. |
| `DELETE /api/araclar/:id` | Aracı kullanıcı sahipliği içinde siler. |
| `GET /api/ai/tavsiye/:id` | Kayıtlı araç üzerinden AI tavsiyesi üretir. |
| `POST /api/ai/tavsiye` | Gönderilen araç nesnesiyle AI tavsiyesi üretir. |
| `POST /api/sigorta/teklifler` | Sağlayıcı tekliflerini veya fallback tahminlerini döndürür. |
| `GET /api/saglik-kontrol` | Sunucu durumunu ve AI yapılandırmasını özetler. |

## 9. Fonksiyonel Olmayan Gereksinimler

- TypeScript kullanımı zorunludur.
- Offline temel kullanım korunmalıdır.
- API hataları kullanıcıya anlaşılır mesajla dönmelidir.
- Admin işlemleri `ADMIN_API_KEY` ile korunmalıdır.
- AI anahtarı istemciye sızdırılmamalıdır.
- Ekranlar responsive olmalı, web paneli desktop ve mobilde kullanılabilir kalmalıdır.

## 10. Riskler

| Risk | Etki | Önlem |
|---|---|---|
| Gemini API anahtarı yok veya kota dolu | AI danışman çalışmaz | Fallback hata mesajı ve sonradan tekrar deneme |
| Backend erişilemez | Senkronizasyon aksar | Local/offline veri ile devam |
| Sigorta sağlayıcıları değişir | Teklif akışı kırılır | Affiliate/tahmini mod ve sağlayıcı adapter yapısı |
| Bildirim izinleri reddedilir | Hatırlatma değeri düşer | Mobilde izin bannerı ve ayarlara yönlendirme |
| LocalStorage/AsyncStorage bozulur | Veri kaybı riski | Try/catch, boş durum ve yeniden kayıt akışı |

## 11. Sonraki Sürüm Adayları

- Supabase/PostgreSQL ile kalıcı bulut senkronizasyonu.
- Firebase Cloud Messaging ile sunucu taraflı push bildirimleri.
- Gerçek sigorta sağlayıcı sandbox entegrasyonları.
- e-Devlet/TÜVTÜRK kurumsal entegrasyon araştırması.
- E2E testler ve mobil cihaz test matrisi.
- Mağaza yayın varlıkları ve production release süreci.
