import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// In-memory araçlar verisi
let araclar: any[] = [];

// GET /araclar - Tüm araçları getir
app.get('/araclar', (req, res) => {
  res.json(araclar);
});

// POST /araclar - Yeni araç ekle
app.post('/araclar', (req, res) => {
  const yeniArac = { id: uuidv4(), ...req.body };
  araclar.push(yeniArac);
  res.status(201).json(yeniArac);
});

// PUT /araclar/:id - Araç güncelle
app.put('/araclar/:id', (req, res) => {
  const { id } = req.params;
  const index = araclar.findIndex(a => a.id === id);
  if (index === -1) return res.status(404).json({ error: 'Araç bulunamadı' });
  araclar[index] = { ...araclar[index], ...req.body };
  res.json(araclar[index]);
});

// DELETE /araclar/:id - Araç sil
app.delete('/araclar/:id', (req, res) => {
  const { id } = req.params;
  const index = araclar.findIndex(a => a.id === id);
  if (index === -1) return res.status(404).json({ error: 'Araç bulunamadı' });
  const silinen = araclar.splice(index, 1);
  res.json(silinen[0]);
});

app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`);
});
