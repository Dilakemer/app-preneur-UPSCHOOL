# CareMind Gelişim Günlüğü

Son güncelleme: 11 Haziran 2026

Bu günlük, projenin nereden nereye geldiğini ve şu an hangi noktada olduğunu özetler.

## Özet Durum

| Alan | Durum |
|---|---|
| Mobil uygulama | Geliştirildi, Expo tabanlı akışlar mevcut |
| Web uygulaması | Geliştirildi, dashboard ve demo ekranları mevcut |
| Backend API | Geliştirildi, araç/AI/sigorta endpointleri mevcut |
| Testler | Jest altyapısı ve temel testler mevcut |
| Dokümantasyon | README ve prodocs güncellendi |
| Deployment | Checklist mevcut, production doğrulaması devam ediyor |

## Hafta 1-4: Planlama ve Temel Kurulum

Tamamlananlar:

- Ürün fikri ve MVP kapsamı belirlendi.
- React Native + Expo yaklaşımı seçildi.
- PRD, plan ve teknoloji dokümanlarının ilk taslakları oluşturuldu.
- Temel klasör yapısı ayrıldı: `frontend`, `backend`, `prodocs`, `tests`.

Alınan kararlar:

- Araç takibinin internet olmadan çalışması önceliklendirildi.
- Mobil uygulama için Expo tercih edildi.
- TypeScript tüm ana katmanlarda standart olarak benimsendi.

## Hafta 5-6: Mobil Veri ve Bildirimler

Tamamlananlar:

- Araç veri modeli oluşturuldu.
- AsyncStorage tabanlı mobil veri akışı geliştirildi.
- Bildirim tercihleri için 60/30/7/1 gün yapısı kuruldu.
- Expo notification servisleri ve izin akışı eklendi.
- Araç ekleme, detay ve listeleme ekranları şekillendi.

Alınan kararlar:

- Bildirimler başlangıçta yerel planlama ile çözülecek.
- Sunucu taraflı push Faz 2 kapsamına bırakılacak.

## Hafta 7: Backend ve API Katmanı

Tamamlananlar:

- Express + TypeScript backend kuruldu.
- Araç CRUD endpointleri eklendi.
- Kullanıcı e-postasına göre veri ayrımı yapıldı.
- Sağlık kontrol endpointi eklendi.
- Yönetim endpointleri `ADMIN_API_KEY` ile korunacak şekilde tasarlandı.
- API response helperları ve validation katmanı oluşturuldu.

Alınan kararlar:

- Backend ilk aşamada hafif ve taşınabilir kalacak.
- Production ortamında dosya tabanlı persistence persistent disk ile kullanılabilecek.
- İleride Supabase/PostgreSQL geçişi mümkün olacak şekilde katmanlar ayrılacak.

## Hafta 8: AI ve Sigorta Akışları

Tamamlananlar:

- Gemini API entegrasyonu backend tarafına eklendi.
- AI danışman için `tavsiye`, `ozet`, `uyari` tipleri tanımlandı.
- AI cache/rate-limit mantığı için temel altyapı eklendi.
- Sigorta teklifleri için provider adapter yapısı oluşturuldu.
- Varsayılan affiliate/tahmini teklif modu eklendi.

Alınan kararlar:

- AI anahtarı istemciye verilmez; tüm AI istekleri backend üzerinden gider.
- Gerçek sigorta sağlayıcıları `.env` ile sonradan etkinleştirilebilir.

## Hafta 9: Web Uygulaması

Tamamlananlar:

- Vite + React web uygulaması oluşturuldu.
- Dashboard, araç ekleme, araç detay, sigorta, profil, ayarlar ve giriş ekranları eklendi.
- React Router ile sayfa geçişleri kuruldu.
- Web tarafında localStorage fallback yapısı kuruldu.
- Giriş yapılan kullanıcı için backend API çağrıları eklendi.
- Mobil deneyimi göstermek için web içi Mobil Demo ekranı eklendi.

Alınan kararlar:

- Web paneli sadece admin paneli değil, kullanıcıya dönük takip yüzeyi olarak ele alınacak.
- Demo ekranı backend kaydı oluşturmadan mock veriyle çalışacak.

## Hafta 10: Test, Deployment ve Dokümantasyon

Tamamlananlar:

- Jest test yapısı düzenlendi.
- Backend database, API layer ve AI servis testleri eklendi.
- Frontend storage ve AI servis testleri eklendi.
- `.env.example` güncellendi.
- `DEPLOYMENT.md` production checklist olarak yazıldı.
- README daha detaylı hale getirildi.
- Web ekran görüntüleri `screenshoots/web-*.png` olarak eklendi.
- `prodocs` belgeleri güncel ve okunabilir hale getirildi.

## Güncel Ekran Görüntüleri

Eklenen web görselleri:

- `screenshoots/web-dashboard.png`
- `screenshoots/web-arac-detay.png`
- `screenshoots/web-arac-ekle.png`
- `screenshoots/web-sigorta.png`
- `screenshoots/web-mobil-demo.png`

Mevcut mobil görseller:

- `screenshoots/WhatsApp Image 2026-06-05 at 11.13.53*.jpeg`

## Açık İşler

| Öncelik | İş |
|---|---|
| Yüksek | Web kaynak kodundaki Türkçe karakter bozulmalarını düzeltmek |
| Yüksek | Production API ve web domainlerini kesinleştirmek |
| Orta | AI hata/kota durumlarında daha iyi fallback deneyimi |
| Orta | Web için smoke/E2E test akışı eklemek |
| Orta | Mobil bildirimleri gerçek cihazlarda tekrar doğrulamak |
| Düşük | İkon setini harflerden gerçek ikonlara taşımak |
| Düşük | Daha kapsamlı demo senaryoları eklemek |

## Bilinen Riskler

- Gemini anahtarı yoksa AI danışman çalışmaz.
- Backend production dosya yolu persistent değilse veri kalıcılığı kaybolabilir.
- Web ve mobilde yerel veri ile backend verisi arasında çakışma senaryoları daha detaylı ele alınmalıdır.
- Gerçek sigorta sağlayıcı entegrasyonları sağlayıcı sözleşmesi ve sandbox erişimi gerektirir.

## Sonraki En Mantıklı Adım

Kod tarafındaki öncelik, web kaynak dosyalarında görülen karakter bozulmalarını düzeltmek ve ardından `npm run build`, `npm test`, `cd web && npm run build` komutlarıyla son doğrulamayı almaktır.
