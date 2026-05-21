# Tasarım Sistemi (Design System)

CareMind, güven veren, temiz ve kullanıcıyı yormayan modern bir "Otomotiv & Finans" estetiğine sahiptir.

## 1. Renk Paleti

| Kategori | Renk Kodu (HEX) | Kullanım Alanı |
|---|---|---|
| **Ana Renk (Primary)** | `#2563EB` (Blue 600) | Butonlar, linkler, vurgular |
| **Arka Plan (Background)** | `#F8FAFC` (Slate 50) | Genel ekran zemini |
| **Kartlar (Surface)** | `#FFFFFF` (White) | Araç kartları, form alanları |
| **Metin (Primary Text)** | `#1E293B` (Slate 800) | Başlıklar ve ana metinler |
| **Metin (Secondary Text)** | `#64748B` (Slate 500) | Açıklamalar ve yardımcı metinler |

### Durum Renkleri (Görsel Hiyerarşi)
- **Kritik (🔴)**: `#EF4444` (Red 500) - 15 günden az kalan işlemler.
- **Uyarı (🟡)**: `#F59E0B` (Amber 500) - 15-30 gün arası kalan işlemler.
- **Güvenli (🟢)**: `#10B981` (Emerald 500) - 30 günden fazla olan işlemler.

## 2. Tipografi

- **Font Ailesi**: `Inter` (Sistem varsayılanı fallback olarak kullanılır).
- **H1 (Ekran Başlığı)**: 24px, Bold, Slate 800.
- **H2 (Kart Başlığı)**: 18px, SemiBold, Slate 800.
- **Body**: 14px, Regular, Slate 600.
- **Caption**: 12px, Regular, Slate 500.

## 3. Bileşen Kuralları (Component Rules)

### Butonlar
- **Primary**: Full width, Blue 600 zemin, Beyaz metin, 8px border radius.
- **Secondary**: Outlined Blue 600, 8px border radius.

### Kartlar
- 1px Slate 200 border veya hafif shadow (`shadow-sm`).
- 12px padding.
- 10px rounded corners.

### Formlar
- Input yükseklik: 48px.
- Border: Slate 300.
- Focus: Blue 500 border-2.
