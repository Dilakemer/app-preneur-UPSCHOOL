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
