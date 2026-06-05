# CareMind — Muayene & Sigorta Takip Uygulaması

CareMind, Türkiye'deki araç sahiplerinin muayene, trafik sigortası, kasko ve periyodik bakım tarihlerini yapay zeka desteğiyle takip etmelerini sağlayan modern bir mobil uygulamadır.

## 🚀 Proje Hakkında
Bu proje, araç sahiplerinin kritik tarihleri kaçırarak yasal cezalarla veya maddi kayıplarla karşılaşmasını önlemek amacıyla geliştirilmiştir. Uygulama, sadece hatırlatıcı bir takvim olmanın ötesinde, **Google Gemini AI** entegrasyonu ile kullanıcılara araçlarına özel bakım ve sigorta danışmanlığı sunar.

### Temel Özellikler
- **AI Danışman**: Araç bilgilerine ve yaklaşan tarihlere göre kişiselleştirilmiş bakım tavsiyeleri.
- **Akıllı Bildirimler**: 60, 30, 7 ve 1 gün kala otomatik push bildirimleri.
- **Hibrit Veri Yapısı**: Backend API ile senkronize çalışırken, internet olmayan durumlarda `AsyncStorage` ile tam çevrimdışı destek.
- **Hızlı Araç Kaydı**: Plaka, marka ve model bilgileriyle saniyeler içinde takip başlatma.
- **Sigorta Teklifleri**: Yaklaşan sigorta tarihleri için tek tıkla teklif alma yönlendirmesi.

## 📁 Klasör Yapısı
- **/frontend**: React Native & Expo ile geliştirilen mobil uygulama kodları.
- **/backend**: Node.js & Express.js ile geliştirilen ve AI entegrasyonu içeren API kodları.
- **/prodocs**: Proje geliştirme belgeleri (PRD, Plan, Tech Stack, Design System, Progress).

## 🛠️ Kurulum ve Çalıştırma

### 1. Gereksinimler
- Node.js (v18+)
- Expo Go (Mobil cihazda test için)
- Google Gemini API Anahtarı

### 2. Backend Kurulumu
```bash
# Bağımlılıkları yükleyin
npm install

# .env dosyasını oluşturun ve API anahtarınızı ekleyin
cp .env.example .env

# Sunucuyu başlatın
npm run dev
# Sunucu varsayılan olarak http://localhost:3001 adresinde çalışır.
```

### 3. Frontend Kurulumu
```bash
cd frontend
npm install

# Uygulamayı başlatın
npx expo start
```

## 📄 Dokümantasyon
Proje ile ilgili detaylı teknik belgelere `/prodocs` klasöründen ulaşabilirsiniz:
- [PRD.md](./prodocs/PRD.md): Ürün gereksinimleri ve kapsam.
- [tech-stack.md](./prodocs/tech-stack.md): Kullanılan teknolojiler ve AI mimarisi.
- [Plan.md](./prodocs/Plan.md): Geliştirme adımları ve kullanıcı hikayeleri.
- [DesignSystem.md](./prodocs/DesignSystem.md): Renk paleti ve tasarım kuralları.
- [Progress.md](./prodocs/Progress.md): Gelişim günlüğü ve alınan kararlar.

## 🌐 Canlı Yayın (Deploy)
- **Backend**: Render/Railway/Heroku üzerinde yayına alınabilir.
- **Frontend**: Expo Application Services (EAS) ile APK/IPA olarak veya web build olarak sunulabilir.

---
*Hazırlayan: Dila KEMER*

## 🖼️ Ekran Görüntüleri
Projeyi inceleyecek işverenler ve test kullanıcıları için önemli ekran görüntüleri:
- [Dashboard](screenshoots/dashboard.png)
- [Araç Detayı](screenshoots/detail.png)
- [Araç Ekleme](screenshoots/add_vehicle.png)
- [Raporlar](screenshoots/reports.png)
- [Ayarlar](screenshoots/settings.png)
- Mobil ekranlardan örnekler: [WhatsApp Images](screenshoots/WhatsApp%20Image%202026-06-05%20at%2011.13.53%20(1).jpeg) (birkaçı)
- Mobil ekranlardan örnekler:
	- [WhatsApp Image 1](screenshoots/WhatsApp%20Image%202026-06-05%20at%2011.13.53%20%281%29.jpeg)
	- [WhatsApp Image 2](screenshoots/WhatsApp%20Image%202026-06-05%20at%2011.13.53%20%282%29.jpeg)
	- [WhatsApp Image 3](screenshoots/WhatsApp%20Image%202026-06-05%20at%2011.13.53%20%283%29.jpeg)
	- [WhatsApp Image 4](screenshoots/WhatsApp%20Image%202026-06-05%20at%2011.13.53%20%284%29.jpeg)
	- [WhatsApp Image 5](screenshoots/WhatsApp%20Image%202026-06-05%20at%2011.13.53%20%285%29.jpeg)
	- [WhatsApp Image 6](screenshoots/WhatsApp%20Image%202026-06-05%20at%2011.13.53%20%286%29.jpeg)
	- [WhatsApp Image (original)](screenshoots/WhatsApp%20Image%202026-06-05%20at%2011.13.53.jpeg)

## ▶️ İşverenler için Hızlı Test Rehberi
1. Depoyu klonlayın ve hem backend hem frontend bağımlılıklarını yükleyin:
```bash
git clone <repo-url>
cd "Yeni klasör"
npm install
cd frontend && npm install
```
2. Ortam değişkenlerini ayarlayın: root dizinde `.env.example` bulunur; kopyalayın ve gerekirse düzenleyin.
```bash
cp .env.example .env
# frontend için EXPO_PUBLIC_API_URL doğruysa (ör: http://localhost:3001/api) bırakın
```
3. Backend ve frontend'i ayrı terminallerde çalıştırın:
```bash
# Backend
npm run dev

# Frontend (expo)
cd frontend
npx expo start
```
4. Uygulamayı Expo Go ile cihazınızda açın veya emülatörde test edin. Profil sekmesinden `Sigorta Fiyatlarını Karşılaştır` ekranına gidin.

## Sigorta Karşılaştırma Özelliği
- Özellik: `Sigorta Fiyatlarını Karşılaştır` ekranı eklendi — işlev hem "affiliate/tahmini" modu (kayıt olmadan çalışır) hem de isteğe bağlı gerçek sağlayıcı entegrasyonlarını destekler.
- Varsayılan (affiliate/tahmini) mod: hiçbir sağlayıcı API anahtarına gerek yok; uygulama örnek/tahmini fiyatlar gösterir ve kullanıcıyı teklif sayfasına yönlendirir.
- Gerçek teklif toplamak isterseniz: sağlayıcı sandbox/production URL'lerini ve anahtarlarını `.env` içinde ayarlayın (backend `insurers.ts` dosyasında kullanılan env isimleri). Daha fazla bilgi için `backend/INSURER_README.md` dosyasına bakın.

## Docker (örnek)
Projeyi konteynerize etmek isterseniz, basit bir `Dockerfile` ve `docker-compose.yml` şablonu eklemeyi öneriyorum; isterseniz sizin için hazırlarım.

