# CareMind Backend API Testleri (Postman)

Aşağıdaki örnekleri Postman ile test edebilirsiniz. Sunucu: `http://localhost:3001`

## 1. Tüm Araçları Listele
- **GET** `/araclar`

## 2. Yeni Araç Ekle
- **POST** `/araclar`
- Body (JSON):
```json
{
  "plaka": "35XYZ789",
  "marka": "Toyota",
  "model": "Corolla",
  "yil": 2020,
  "muayeneTarihi": "2026-10-01",
  "sigortaTarihi": "2026-07-15",
  "kaskoTarihi": "2026-08-10",
  "bakimTarihi": "2026-06-20",
  "bildirimler": { "gun60": true, "gun30": false }
}
```

## 3. Araç Güncelle
- **PUT** `/araclar/{id}`
- Body (JSON):
```json
{
  "marka": "Honda"
}
```

## 4. Araç Sil
- **DELETE** `/araclar/{id}`

---

Başarılı yanıtlar ve hata mesajları JSON formatındadır. Tüm endpointler test edilebilir durumdadır.
