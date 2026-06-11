# CareMind Tasarım Sistemi

Son güncelleme: 11 Haziran 2026

CareMind'in görsel dili güven veren, okunabilir ve operasyonel bir araç takip paneli hissi vermelidir. Ürün otomotiv, finans ve kişisel takip alanlarının kesişiminde olduğu için arayüz sakin, net ve hızlı taranabilir olmalıdır.

## 1. Tasarım İlkeleri

- Bilgi önce gelir: yaklaşan tarihler, kalan gün ve araç kimliği hızlı görünmelidir.
- Durum renkleri tutarlı kullanılmalıdır.
- Kullanıcıyı teknik ayrıntıyla yormadan hata ve boş durumlar açıklanmalıdır.
- Mobil ve web deneyimleri aynı ürün ailesinden geliyormuş gibi hissettirmelidir.
- Kartlar bilgi gruplamak için kullanılmalı, sayfa düzeni gereksiz kart içine kart yapısından kaçınmalıdır.

## 2. Renk Paleti

### Web Mevcut Tema

| Token | Değer | Kullanım |
|---|---|---|
| `--color-bg` | `#0B0F19` | Ana koyu zemin |
| `--color-bg-dark` | `#070A11` | Sidebar ve derin zemin |
| `--color-card` | `#131A2A` | Kart ve panel yüzeyi |
| `--color-card-dark` | `#1E293B` | İkincil panel yüzeyi |
| `--color-text` | `#FFFFFF` | Ana metin |
| `--color-text-secondary` | `#94A3B8` | Yardımcı metin |
| `--color-border` | `#1E293B` | İnce ayrım çizgileri |
| `--color-accent` | `#6366F1` | Ana vurgu, butonlar |
| `--color-blue` | `#3B82F6` | Destekleyici vurgu |

### Durum Renkleri

| Durum | Renk | Kullanım |
|---|---|---|
| Güvenli | `#10B981` | 30 günden fazla kalan tarihler |
| Yaklaşan | `#F59E0B` | 8-30 gün arası yaklaşan tarihler |
| Acil/gecikmiş | `#EF4444` | 7 gün ve altı veya geçmiş tarihler |
| Nötr | `#94A3B8` | Tarih girilmemiş alanlar |

## 3. Tipografi

| Kullanım | Öneri |
|---|---|
| Font | Inter, sistem fallback |
| Sayfa başlığı | 28-32px, 800/900 weight |
| Bölüm başlığı | 20-24px, 700/800 weight |
| Kart başlığı | 16-18px, 700/800 weight |
| Gövde metni | 14-16px, 400/500 weight |
| Yardımcı metin | 12-14px, 500/600 weight |

Kurallar:

- Dar alanlarda başlıklar taşmamalı, gerekirse satır kırılmalıdır.
- Buton metinleri kısa ve eylem odaklı olmalıdır.
- Teknik terimler kullanıcıya gösterilecekse anlaşılır Türkçe karşılıkla desteklenmelidir.

## 4. Bileşen Kuralları

### Sidebar

- Desktop webde sabit sol navigasyon kullanılır.
- Aktif sayfa `accent` tonuyla vurgulanır.
- Kullanıcı giriş yapmadıysa sidebar footer'da giriş bağlantısı gösterilir.
- Mobilde sidebar yerine alt navigasyon önceliklidir.

### Dashboard Kartları

- İstatistik kartları aynı yükseklikte kalmalıdır.
- Araç kartlarında plaka rozeti, araç adı ve en yakın tarih görünmelidir.
- Sol renk şeridi aracın en yakın tarih durumunu temsil etmelidir.

### Tarih Kartları

- Her tarih kategorisi ayrı kartta gösterilir.
- Kategori adı, tarih ve kalan gün birlikte görünmelidir.
- Tarih yoksa nötr durum kullanılmalıdır.

### Formlar

- Zorunlu alanlar açık işaretlenmelidir.
- Validasyon hataları ilgili alanın altında gösterilmelidir.
- Kaydet butonu form geçersizken disabled olmalıdır.
- Tarih alanları ISO değeri üretmeli, kullanıcıya okunabilir format gösterilmelidir.

### Butonlar

| Tip | Kullanım |
|---|---|
| Primary | Kaydet, giriş yap, tavsiye al gibi ana eylemler |
| Secondary | Geri, yenile, alternatif seçimler |
| Danger | Silme ve geri alınamayan işlemler |
| Icon button | Düzenle, sil, menü gibi kompakt eylemler |

## 5. Boş ve Hata Durumları

Boş durumlar:

- Kullanıcının ne olmadığı değil, ne yapabileceği anlatılmalıdır.
- Ana CTA görünür olmalıdır.
- İlk araç ekleme akışı kısa tutulmalıdır.

Hata durumları:

- Backend bağlantı hatasında kullanıcıya tekrar deneme önerilmelidir.
- AI hatası ayrı bir mesajla gösterilmeli, tüm sayfa kırılmamalıdır.
- Silme işleminde onay modalı kullanılmalıdır.

## 6. Responsive Davranış

Desktop:

- Sidebar sabit.
- İçerik maksimum genişliği kontrollü.
- Dashboard kartları grid düzeninde.

Tablet:

- Grid kartları iki kolona düşebilir.
- Form satırları iki veya tek kolon olabilir.

Mobil:

- Alt navigasyon görünür.
- Sidebar hamburger ile açılır.
- Form alanları tek kolon olur.
- FAB alt navigasyonu kapatmayacak şekilde yukarı taşınır.

## 7. Görsel Varlıklar

- README'de hem web hem mobil ekran görüntüleri bulunur.
- Yeni web görselleri `screenshoots/web-*.png` adlarıyla tutulur.
- Mobil görseller mevcut WhatsApp export dosya adlarıyla korunmuştur.
- Ürün sunumlarında web dashboard ve mobil demo görselleri öncelikli kullanılmalıdır.

## 8. İyileştirme Notları

- Web kodundaki bozulmuş Türkçe karakterler temizlenmelidir.
- Harf ikonları yerine tutarlı ikon kütüphanesi veya mevcut SVG ikon seti kullanılmalıdır.
- Mobil ve web renk tokenları ortak adlandırmaya yaklaştırılmalıdır.
- Kart radius değerleri ürün genelinde daha tutarlı hale getirilebilir.
