# Teknoloji Yığını (Tech Stack)

CareMind projesinde kullanılan teknolojiler ve servis seçimlerinin gerekçeleri aşağıda detaylandırılmıştır.

## 1. Frontend (Mobil)
- **React Native & Expo SDK 55**: Çapraz platform (iOS & Android) geliştirme hızı ve geniş topluluk desteği nedeniyle tercih edildi.
- **TypeScript**: Tip güvenliği sağlayarak çalışma zamanı hatalarını minimize etmek için zorunlu kılındı.
- **React Navigation v6**: Mobil uygulama içi gezinme standartlarını karşıladığı için kullanıldı.
- **NativeWind (Tailwind CSS)**: Hızlı UI geliştirme ve tasarım tutarlılığı sağlamak amacıyla tercih edildi.
- **Expo Notifications**: Cihaz üzerinde yerel bildirimler planlamak için kullanıldı.

## 2. Backend (API)
- **Node.js & Express**: Hızlı ve hafif bir API yapısı kurmak için tercih edildi.
- **TypeScript**: Frontend ile dil birliği sağlamak ve veri modellerini paylaşmak için kullanıldı.
- **In-Memory / AsyncStorage Mimarisi**: MVP aşamasında karmaşıklığı azaltmak ve çevrimdışı çalışma kabiliyetini korumak için başlangıçta yerel depolama tercih edildi. Backend, ileride Supabase/PostgreSQL'e geçiş yapılabilecek şekilde modüler yazıldı.

## 3. Yapay Zeka (AI) Entegrasyonu
- **Google Gemini 1.5 Flash API**: 
  - **Kullanım Amacı**: Araçların durumuna göre kullanıcılara özel bakım ve sigorta tavsiyeleri sunmak (AI Danışman).
  - **Gerekçe**: Ücretsiz kota avantajı, yüksek hızı ve Türkçe dil desteği başarısı nedeniyle tercih edildi.
  - **Entegrasyon**: Backend üzerinden güvenli bir şekilde API'ye bağlanarak çekirdek mantığa dahil edildi.

## 4. Geliştirme Sürecinde AI Kullanımı
- **Kod Üretimi**: Temel CRUD operasyonları ve tip tanımlamaları için AI asistanlarından faydalanıldı.
- **Problem Çözme**: Navigasyon ve bildirim yönetimi gibi karmaşık Expo modüllerinin entegrasyonunda hata ayıklama desteği alındı.
- **Dokümantasyon**: PRD ve Plan dosyalarının taslak aşamasında yapılandırılmış çıktı üretimi sağlandı.
