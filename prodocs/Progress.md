# Gelişim Günlüğü (Progress Log)

CareMind projesinin haftalık gelişim ve karar günlüğü.

## Hafta 1-4: Planlama ve Temel Yapı
- **Karar**: React Native + Expo mimarisi seçildi.
- **İşlem**: PRD ve Plan dokümanları oluşturuldu.
- **İşlem**: Temel UI bileşenleri ve navigasyon yapısı kuruldu.

## Hafta 5-6: Veri ve Bildirimler
- **Karar**: Başlangıçta tam çevrimdışı (offline-first) deneyim için AsyncStorage kullanıldı.
- **İşlem**: `expo-notifications` entegre edildi.
- **Hata/Çözüm**: Android'de bildirim izinleri sorunu yaşandı; `app.json` ve izin kontrol mantığı güncellendi.

## Hafta 7: Backend ve API
- **Karar**: Uygulamanın ölçeklenebilirliği için Express.js tabanlı bir backend katmanı eklendi.
- **İşlem**: Araç yönetimi için REST API endpoint'leri yazıldı.
- **İşlem**: Frontend'in AsyncStorage verilerini backend ile senkronize edebilmesi için servis katmanı hazırlandı.

## Hafta 8: AI Entegrasyonu ve Yayına Hazırlık
- **Karar**: Kullanıcı etkileşimini artırmak için AI Danışman özelliği eklendi.
- **İşlem**: Google Gemini API entegrasyonu backend tarafında tamamlandı.
- **İşlem**: Proje dosyaları brief kriterlerine göre organize edildi (/prodocs, /frontend, /backend).
- **İşlem**: `.env.example` ve deployment kılavuzu README'ye eklendi.
