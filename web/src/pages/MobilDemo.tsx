import { useMemo, useState, useCallback } from 'react';
import { useAraclar } from '../contexts/AraclarContext';
import { useAuth } from '../contexts/AuthContext';
import { enYakinTarihBul, kalanGunMetni, tarihFormatla } from '../utils/tarihHesapla';
import { KATEGORI_BASLIKLARI } from '../types/Arac';
import { aiTavsiyeAl as aiServis } from '../services/aiService';
import type { Arac } from '../types/Arac';
import type { AIPromptTipi } from '../services/aiService';
import { useNavigate } from 'react-router-dom';

type DeviceKey = 'iphone' | 'android' | 'compact';
type ScreenKey = 'home' | 'detay' | 'sigorta' | 'ai';

const DEVICES: Record<DeviceKey, { label: string; className: string }> = {
  iphone: { label: 'iPhone', className: 'device-iphone' },
  android: { label: 'Android', className: 'device-android' },
  compact: { label: 'Kompakt', className: 'device-compact' },
};

const SCREEN_LABELS: Record<ScreenKey, string> = {
  home: 'Ana Ekran',
  detay: 'Araç Detay',
  sigorta: 'Sigorta',
  ai: 'AI Danışman',
};

const TAB_ICONS: Record<ScreenKey, string> = {
  home: '🏠',
  detay: '🚗',
  sigorta: '🛡️',
  ai: '🤖',
};

function PhoneHeader() {
  const now = new Date();
  const saat = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="phone-status">
      <span>{saat}</span>
      <span className="phone-status-icons">LTE 86%</span>
    </div>
  );
}

function HomeScreen({
  araclar,
  secilenArac,
  onAracSec,
  onScreenChange,
}: {
  araclar: Arac[];
  secilenArac: Arac | null;
  onAracSec: (a: Arac) => void;
  onScreenChange: (s: ScreenKey) => void;
}) {
  if (araclar.length === 0) {
    return (
      <div className="phone-screen-content">
        <div className="phone-title-row">
          <div>
            <span className="phone-kicker">CareMind</span>
            <h3>Başlayalım</h3>
          </div>
          <button className="phone-icon-btn" onClick={() => onScreenChange('ai')}>🤖</button>
        </div>
        <div className="phone-empty">
          <div className="phone-empty-icon">🚗</div>
          <strong>Araç eklemediniz</strong>
          <span>Ana sayfadan araç ekleyerek mobil deneyimi deneyin.</span>
        </div>
      </div>
    );
  }

  const acilSayisi = araclar.filter(a => {
    const en = enYakinTarihBul(a);
    return en && en.kalanGun <= 7;
  }).length;

  const yaklasanSayisi = araclar.filter(a => {
    const en = enYakinTarihBul(a);
    return en && en.kalanGun > 7 && en.kalanGun <= 30;
  }).length;

  return (
    <div className="phone-screen-content">
      <div className="phone-title-row">
        <div>
          <span className="phone-kicker">CareMind</span>
          <h3>Araçlarım</h3>
        </div>
        <button className="phone-icon-btn" onClick={() => onScreenChange('ai')}>🤖</button>
      </div>

      <div className="phone-summary-card">
        <div>
          <span className="phone-muted">Toplam Araç</span>
          <strong>{araclar.length}</strong>
        </div>
        <div>
          <span className="phone-muted">Acil</span>
          <strong style={{ color: acilSayisi > 0 ? '#f87171' : 'inherit' }}>{acilSayisi}</strong>
        </div>
        <div>
          <span className="phone-muted">Yaklaşan</span>
          <strong style={{ color: yaklasanSayisi > 0 ? '#fbbf24' : 'inherit' }}>{yaklasanSayisi}</strong>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {araclar.map(arac => {
          const en = enYakinTarihBul(arac);
          const isSelected = secilenArac?.id === arac.id;
          const durum = en ? (en.kalanGun <= 7 ? 'kırmızı' : en.kalanGun <= 30 ? 'sarı' : 'yeşil') : 'nötr';
          const borderColor = durum === 'kırmızı' ? '#f87171' : durum === 'sarı' ? '#fbbf24' : durum === 'yeşil' ? '#4ade80' : '#6366f1';

          return (
            <button
              key={arac.id}
              className="phone-vehicle-card"
              style={{ borderLeft: `3px solid ${borderColor}`, background: isSelected ? 'rgba(99,102,241,0.1)' : undefined }}
              onClick={() => { onAracSec(arac); onScreenChange('detay'); }}
            >
              <div className="phone-plate">{arac.plaka}</div>
              <div className="phone-vehicle-name">{arac.marka} {arac.model} ({arac.yil})</div>
              {en && (
                <div className="phone-date-line">
                  <span>{KATEGORI_BASLIKLARI[en.kategori]}</span>
                  <strong style={{ color: borderColor }}>{kalanGunMetni(en.kalanGun)}</strong>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DetayScreen({
  arac,
  onScreenChange,
}: {
  arac: Arac | null;
  onScreenChange: (s: ScreenKey) => void;
}) {
  if (!arac) {
    return (
      <div className="phone-screen-content">
        <div className="phone-title-row">
          <div><h3>Araç Seçin</h3></div>
        </div>
        <div className="phone-empty">
          <div className="phone-empty-icon">🚗</div>
          <span>Ana ekrandan bir araç seçin.</span>
        </div>
      </div>
    );
  }

  const tarihler = [
    { label: 'Muayene', tarih: arac.muayeneTarihi },
    { label: 'Sigorta', tarih: arac.sigortaTarihi },
    { label: 'Kasko', tarih: arac.kaskoTarihi },
    { label: 'Bakım', tarih: arac.bakimTarihi },
  ].filter(t => t.tarih);

  return (
    <div className="phone-screen-content">
      <div className="phone-title-row">
        <div>
          <span className="phone-kicker">{arac.plaka}</span>
          <h3>{arac.marka} {arac.model}</h3>
        </div>
      </div>

      <div className="phone-date-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {tarihler.map(t => (
          <div key={t.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 12px' }}>
            <span style={{ fontSize: 11, color: 'var(--phone-muted, #8e9bb7)' }}>{t.label}</span>
            <br />
            <strong style={{ fontSize: 13 }}>{tarihFormatla(t.tarih!)}</strong>
          </div>
        ))}
        {tarihler.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#8e9bb7', fontSize: 13, padding: 16 }}>
            Tarih bilgisi eklenmemiş
          </div>
        )}
      </div>

      <button className="phone-primary" onClick={() => onScreenChange('sigorta')}>
        🛡️ Sigorta Teklifleri
      </button>
      <button className="phone-secondary" onClick={() => onScreenChange('ai')}>
        🤖 AI Danışmana Sor
      </button>
    </div>
  );
}

function SigortaScreen({ arac }: { arac: Arac | null }) {
  const teklifler = arac
    ? [
        { name: 'Quick Sigorta', price: `${(10000 + arac.yil % 100 * 120).toLocaleString('tr-TR')} TL`, tag: 'Ekonomik' },
        { name: 'Aksigorta', price: `${(11500 + arac.yil % 100 * 140).toLocaleString('tr-TR')} TL`, tag: 'Dengeli' },
        { name: 'Anadolu Sigorta', price: `${(13000 + arac.yil % 100 * 160).toLocaleString('tr-TR')} TL`, tag: 'Kapsamlı' },
      ]
    : [];

  return (
    <div className="phone-screen-content">
      <div className="phone-title-row">
        <div>
          <span className="phone-kicker">{arac?.plaka ?? 'Araç Seçilmedi'}</span>
          <h3>Sigorta Teklifleri</h3>
        </div>
        <span className="phone-live-pill">Tahmini</span>
      </div>

      {arac ? (
        <>
          <div className="phone-offer-summary">
            <span>En iyi başlangıç</span>
            <strong>{teklifler[0].price}</strong>
            <small>Kesin poliçe bedeli teklif sayfasında hesaplanır.</small>
          </div>
          <div className="phone-offer-list">
            {teklifler.map(offer => (
              <div key={offer.name} className="phone-offer">
                <div>
                  <strong>{offer.name}</strong>
                  <span>{offer.tag}</span>
                </div>
                <div className="phone-offer-price">{offer.price}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="phone-empty">
          <div className="phone-empty-icon">🛡️</div>
          <span>Ana ekrandan bir araç seçin.</span>
        </div>
      )}
    </div>
  );
}

function AiScreen({ arac, email }: { arac: Arac | null; email: string }) {
  const [mesajlar, setMesajlar] = useState<{ tip: 'user' | 'bot'; metin: string }[]>([
    { tip: 'bot', metin: arac ? `${arac.marka} ${arac.model} (${arac.yil}) için ne öğrenmek istersiniz?` : 'Merhaba! Bir araç seçin, size yardımcı olayım.' },
  ]);
  const [yukleniyor, setYukleniyor] = useState(false);

  const soruSor = useCallback(async (tip: AIPromptTipi, soruMetni: string) => {
    if (!arac) return;
    setMesajlar(prev => [...prev, { tip: 'user', metin: soruMetni }]);
    setYukleniyor(true);
    try {
      const yanit = await aiServis(arac, tip, email);
      setMesajlar(prev => [...prev, { tip: 'bot', metin: yanit }]);
    } catch {
      setMesajlar(prev => [...prev, { tip: 'bot', metin: 'Yanıt alınamadı. Lütfen tekrar deneyin.' }]);
    } finally {
      setYukleniyor(false);
    }
  }, [arac, email]);

  return (
    <div className="phone-screen-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="phone-title-row">
        <div>
          <span className="phone-kicker">AI Destek</span>
          <h3>Danışman</h3>
        </div>
      </div>

      <div className="phone-chat" style={{ flex: 1, overflowY: 'auto' }}>
        {mesajlar.map((m, i) => (
          <div key={i} className={`phone-message ${m.tip}`}>{m.metin}</div>
        ))}
        {yukleniyor && (
          <div className="phone-message bot" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className="spinner" style={{ width: 14, height: 14 }} /> Düşünüyor...
          </div>
        )}
      </div>

      {arac && (
        <div className="phone-quick-actions">
          <button onClick={() => soruSor('tavsiye', 'Tavsiye ver')} disabled={yukleniyor}>💡 Tavsiye</button>
          <button onClick={() => soruSor('ozet', 'Özetle')} disabled={yukleniyor}>📋 Özet</button>
          <button onClick={() => soruSor('uyari', 'Uyarılar')} disabled={yukleniyor}>⚠️ Uyarı</button>
        </div>
      )}
    </div>
  );
}

export default function MobilDemo() {
  const { araclar } = useAraclar();
  const { email } = useAuth();
  const navigate = useNavigate();
  const [device, setDevice] = useState<DeviceKey>('iphone');
  const [screen, setScreen] = useState<ScreenKey>('home');
  const [secilenArac, setSecilenArac] = useState<Arac | null>(araclar[0] ?? null);

  const handleAracSec = useCallback((a: Arac) => {
    setSecilenArac(a);
  }, []);

  const activeScreen = useMemo(() => {
    switch (screen) {
      case 'detay':
        return <DetayScreen arac={secilenArac} onScreenChange={setScreen} />;
      case 'sigorta':
        return <SigortaScreen arac={secilenArac} />;
      case 'ai':
        return <AiScreen arac={secilenArac} email={email} />;
      default:
        return (
          <HomeScreen
            araclar={araclar}
            secilenArac={secilenArac}
            onAracSec={handleAracSec}
            onScreenChange={setScreen}
          />
        );
    }
  }, [screen, araclar, secilenArac, email, handleAracSec]);

  return (
    <div className="mobile-demo-page animate-slideUp">
      <div className="page-header">
        <h1>Mobil Deneyim Simülasyonu</h1>
        <p>CareMind'ın mobil akışlarını gerçek araç verilerinizle deneyin.</p>
      </div>

      <section className="demo-workbench">
        <div className="demo-control-panel">
          <div>
            <span className="demo-eyebrow">Canlı Demo</span>
            <h2>Gerçek Verileriniz</h2>
            <p>
              {araclar.length === 0
                ? 'Araç eklenmemiş. Gerçek veri görmek için önce araç ekleyin.'
                : `${araclar.length} araç, ${araclar.filter(a => { const e = enYakinTarihBul(a); return e && e.kalanGun <= 30; }).length} yaklaşan tarih.`}
            </p>
          </div>

          {/* Araç Seçici */}
          {araclar.length > 0 && (
            <div className="demo-control-group">
              <span>Araç Seç</span>
              <div className="demo-segmented" style={{ flexWrap: 'wrap' }}>
                {araclar.map(a => (
                  <button
                    key={a.id}
                    className={secilenArac?.id === a.id ? 'active' : ''}
                    onClick={() => { handleAracSec(a); setScreen('detay'); }}
                  >
                    {a.plaka}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ekran */}
          <div className="demo-control-group">
            <span>Ekran</span>
            <div className="demo-screen-grid">
              {(Object.keys(SCREEN_LABELS) as ScreenKey[]).map(key => (
                <button key={key} className={screen === key ? 'active' : ''} onClick={() => setScreen(key)}>
                  {TAB_ICONS[key]} {SCREEN_LABELS[key].split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Cihaz */}
          <div className="demo-control-group">
            <span>Cihaz Boyutu</span>
            <div className="demo-segmented">
              {(Object.keys(DEVICES) as DeviceKey[]).map(key => (
                <button key={key} className={device === key ? 'active' : ''} onClick={() => setDevice(key)}>
                  {DEVICES[key].label}
                </button>
              ))}
            </div>
          </div>

          {araclar.length === 0 && (
            <button className="btn btn-primary btn-sm mt-16" onClick={() => navigate('/arac/ekle')}>
              ＋ Araç Ekle
            </button>
          )}

          <div className="demo-insight">
            <strong>💡 Not</strong>
            <span>
              Bu simülasyon gerçek araç verilerinizi ve Gemini AI'ı kullanır. Yaptığınız işlemler gerçek hesabınıza kaydedilmez.
            </span>
          </div>
        </div>

        <div className="phone-stage">
          <div className={`phone-frame ${DEVICES[device].className}`}>
            <div className="phone-speaker" />
            <PhoneHeader />
            <div className="phone-app-shell">
              {activeScreen}
              <nav className="phone-tabbar">
                {(Object.keys(SCREEN_LABELS) as ScreenKey[]).map(key => (
                  <button key={key} className={screen === key ? 'active' : ''} onClick={() => setScreen(key)}>
                    <span>{TAB_ICONS[key]}</span>
                    {SCREEN_LABELS[key].split(' ')[0]}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
