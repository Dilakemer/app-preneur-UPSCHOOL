const axios = require('axios');

async function testAPI() {
  const baseURL = 'http://localhost:3001/araclar';
  // 1. GET (listele)
  const getRes = await axios.get(baseURL);
  console.log('GET /araclar:', getRes.data);

  // 2. POST (ekle)
  const postRes = await axios.post(baseURL, {
    plaka: '35XYZ789',
    marka: 'Toyota',
    model: 'Corolla',
    yil: 2020,
    muayeneTarihi: '2026-10-01',
    sigortaTarihi: '2026-07-15',
    kaskoTarihi: '2026-08-10',
    bakimTarihi: '2026-06-20',
    bildirimler: { gun60: true, gun30: false }
  });
  console.log('POST /araclar:', postRes.data);

  // 3. PUT (güncelle)
  const putRes = await axios.put(`${baseURL}/${postRes.data.id}`, { marka: 'Honda' });
  console.log('PUT /araclar/:id:', putRes.data);

  // 4. DELETE (sil)
  const delRes = await axios.delete(`${baseURL}/${postRes.data.id}`);
  console.log('DELETE /araclar/:id:', delRes.data);
}

testAPI().catch(console.error);
