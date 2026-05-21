import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { seedDatabase } from './database';
import routes from './routes';
import { errorHandler } from './middleware';
import { createApiRouter, securityHeaders, API_VERSION } from './apiLayer';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:8081,http://localhost:19006,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// ─── Temel Middleware'ler ─────────────────────────────────────────────────────

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('CORS origin izinli degil'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Email', 'X-Admin-API-Key'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(securityHeaders);

// ─── API Katmanı (Rate-limit + Loglama + Versiyonlama) ───────────────────────

// /api  → apiLayer middleware zincirinden geçen rotalar
app.use('/api', createApiRouter(routes));

// ─── Root Endpoint ────────────────────────────────────────────────────────────

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'CareMind API Sunucusu',
    version: `1.0.0 (API ${API_VERSION})`,
    endpoints: {
      araclar          : '/api/araclar',
      aracDetay        : '/api/araclar/:id',
      plakaArama       : '/api/araclar/plaka/:plaka',
      ayarlar          : '/api/ayarlar/bildirim-saati',
      raporlar         : '/api/raporlar/bildirim',
      saglik           : '/api/saglik-kontrol',
      aiTavsiye        : '/api/ai/tavsiye/:id?tip=tavsiye|ozet|uyari',
      aiOnbellekSifirla: '/api/yonetim/ai-onbellek (DELETE)',
    },
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint bulunamadı',
    path: req.path,
  });
});

// ─── Hata Handler ─────────────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Sunucuyu Başlat ──────────────────────────────────────────────────────────

const sunucu = app.listen(port, () => {
  console.log('\n🚀 CareMind Backend API');
  console.log(`📡 Sunucu  → http://localhost:${port}`);
  console.log(`🌐 API     → http://localhost:${port}/api`);
  console.log(`🤖 AI      → http://localhost:${port}/api/ai/tavsiye/:id`);
  console.log(`🔑 Gemini  → ${process.env.GEMINI_API_KEY ? '✅ Yapılandırıldı' : '⚠️  GEMINI_API_KEY eksik'}\n`);

  if (process.env.NODE_ENV !== 'production' && process.env.SEED_DATABASE !== 'false') {
    seedDatabase();
    console.log('✅ Örnek veriler yüklendi\n');
  }
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

process.on('SIGTERM', () => {
  console.log('SIGTERM alındı. Sunucu kapatılıyor...');
  sunucu.close(() => {
    console.log('Sunucu kapatıldı.');
    process.exit(0);
  });
});

export default app;
