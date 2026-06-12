import { useState, useRef, useCallback } from 'react';

interface KazaWizardProps {
  onClose: () => void;
}

const ADIMLAR = [
  {
    id: 'guvenlik',
    icon: '⚠️',
    iconClass: 'red',
    baslik: 'Önce Güvenliğinizi Sağlayın',
    aciklama: 'Paniklemeden, sakin kalın. Aşağıdaki adımları sırayla uygulayın.',
    kontroller: [
      'Aracı güvenli bir yere çektim, dur lambaları yandı',
      'Motor kapalı, el freni çekili',
      'Üçgen reflektörü 30-50 metre arkaya koydum',
      'Herkes araçtan güvenli bir şekilde indi',
      'Yaralı varsa 112\'yi aradım',
    ],
  },
  {
    id: 'konum',
    icon: '📍',
    iconClass: 'blue',
    baslik: 'Konumunuzu Kaydedin',
    aciklama: 'GPS konumunuzu alarak kaza yerini belgeleyebilirsiniz. Yol yardımı için tam adresinizi paylaşın.',
  },
  {
    id: 'karsitaraf',
    icon: '📷',
    iconClass: 'yellow',
    baslik: 'Karşı Taraf Belgelerini Fotoğraflayın',
    aciklama: 'Karşı tarafın ehliyet, ruhsat ve zorunlu trafik sigortası belgelerinin fotoğrafını alın.',
    fotograflar: [
      { id: 'ehliyet', label: 'Ehliyet', icon: '🪪' },
      { id: 'ruhsat', label: 'Ruhsat', icon: '📄' },
      { id: 'sigorta', label: 'Sigorta Poliçesi', icon: '🛡️' },
      { id: 'plaka', label: 'Plaka Fotoğrafı', icon: '🚗' },
    ],
  },
  {
    id: 'hasar',
    icon: '🔍',
    iconClass: 'yellow',
    baslik: 'Hasar Fotoğrafları Çekin',
    aciklama: 'Hasarı 4 farklı açıdan belgeleyin. Geniş açı ve yakın çekim yapın.',
    fotograflar: [
      { id: 'on', label: 'Ön', icon: '⬆️' },
      { id: 'arka', label: 'Arka', icon: '⬇️' },
      { id: 'sag', label: 'Sağ Yan', icon: '➡️' },
      { id: 'sol', label: 'Sol Yan', icon: '⬅️' },
    ],
  },
  {
    id: 'yardim',
    icon: '🆘',
    iconClass: 'green',
    baslik: 'Acil Yardım & Çekici',
    aciklama: 'İlgili numaraları arayarak yardım isteyin. Tüm araçlar ücretsiz çekici hakkına sahiptir.',
  },
];

const ACIL_NUMARALAR = [
  { ad: 'Trafik Kazası — İmdat', numara: '155', ikon: '🚔', aciklama: 'Polis' },
  { ad: 'Ambulans / Sağlık', numara: '112', ikon: '🚑', aciklama: 'Acil Sağlık' },
  { ad: 'Trafik Kazası Bildirim', numara: '154', ikon: '🚗', aciklama: 'Trafik Hattı' },
  { ad: 'Sigortam (Çekici Hattı)', numara: '0850 XXX XX XX', ikon: '🛡️', aciklama: 'Poliçenizdeki hat' },
];

function Adim1Guvenlik({ kontroller, checked, onToggle }: {
  kontroller: string[];
  checked: boolean[];
  onToggle: (i: number) => void;
}) {
  return (
    <div className="kaza-checklist">
      {kontroller.map((k, i) => (
        <div
          key={i}
          className={`kaza-check-item ${checked[i] ? 'checked' : ''}`}
          onClick={() => onToggle(i)}
        >
          <div className="kaza-check-box">
            {checked[i] && <span style={{ color: 'white', fontSize: 14 }}>✓</span>}
          </div>
          <span style={{ fontSize: 14, lineHeight: 1.5 }}>{k}</span>
        </div>
      ))}
    </div>
  );
}

function Adim2Konum({ konum, yukleniyor, onKonumAl }: {
  konum: { lat: number; lng: number } | null;
  yukleniyor: boolean;
  onKonumAl: () => void;
}) {
  const mapsUrl = konum
    ? `https://maps.google.com/?q=${konum.lat},${konum.lng}`
    : null;

  return (
    <div>
      {konum ? (
        <div className="kaza-location-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 28 }}>📍</span>
            <div>
              <div style={{ fontWeight: 800, marginBottom: 4 }}>Konum Alındı ✓</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                {konum.lat.toFixed(6)}, {konum.lng.toFixed(6)}
              </div>
            </div>
          </div>
          <a
            href={mapsUrl!}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#3b82f6',
              color: 'white',
              padding: '10px 16px',
              borderRadius: 10,
              fontWeight: 800,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            🗺️ Google Maps'te Aç
          </a>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <button
            className="btn btn-primary"
            onClick={onKonumAl}
            disabled={yukleniyor}
            style={{ fontSize: 16, padding: '16px 32px' }}
          >
            {yukleniyor ? <><span className="spinner" /> Konum alınıyor...</> : '📍 GPS Konumumu Al'}
          </button>
          <p style={{ marginTop: 12, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Tarayıcı konum iznine izin verin
          </p>
        </div>
      )}

      <div style={{
        background: 'rgba(245,158,11,0.1)',
        border: '1px solid rgba(245,158,11,0.3)',
        borderRadius: 12,
        padding: 16,
        fontSize: 13,
        color: 'var(--color-text-secondary)',
        lineHeight: 1.6,
      }}>
        💡 <strong style={{ color: 'white' }}>İpucu:</strong> Konum bilgisini çekici ve sigorta şirketine iletebilirsiniz.
        Tutanak tutulurken de adres gereklidir.
      </div>
    </div>
  );
}

function FotografAdimi({ fotograflar, photos, onPhoto }: {
  fotograflar: { id: string; label: string; icon: string }[];
  photos: Record<string, string>;
  onPhoto: (id: string, url: string) => void;
}) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFile = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onPhoto(id, url);
  };

  return (
    <div className="kaza-photo-grid">
      {fotograflar.map(f => (
        <div key={f.id}>
          <input
            ref={el => { inputRefs.current[f.id] = el; }}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={e => handleFile(f.id, e)}
          />
          <div
            className={`kaza-photo-slot ${photos[f.id] ? 'has-photo' : ''}`}
            onClick={() => inputRefs.current[f.id]?.click()}
          >
            {photos[f.id] ? (
              <>
                <img src={photos[f.id]} alt={f.label} />
                <div style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  background: 'var(--color-green)',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                }}>✓</div>
              </>
            ) : (
              <>
                <div className="kaza-photo-slot-icon">{f.icon}</div>
                <span>{f.label}</span>
                <span style={{ fontSize: 11, opacity: 0.7 }}>Fotoğraf çek</span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Adim5Yardim() {
  return (
    <div className="kaza-emergency-list">
      {ACIL_NUMARALAR.map(n => (
        <div key={n.numara} className="kaza-emergency-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{n.ikon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{n.ad}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{n.aciklama}</div>
            </div>
          </div>
          <a href={`tel:${n.numara.replace(/\s/g, '')}`}>
            📞 {n.numara}
          </a>
        </div>
      ))}
    </div>
  );
}

function KazaWizard({ onClose }: KazaWizardProps) {
  const [adim, setAdim] = useState(0);
  const [checked, setChecked] = useState<boolean[]>(
    new Array(ADIMLAR[0].kontroller?.length ?? 0).fill(false)
  );
  const [konum, setKonum] = useState<{ lat: number; lng: number } | null>(null);
  const [konumYukleniyor, setKonumYukleniyor] = useState(false);
  const [photos, setPhotos] = useState<Record<string, string>>({});

  const toggleCheck = useCallback((i: number) => {
    setChecked(prev => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }, []);

  const konumAl = useCallback(() => {
    setKonumYukleniyor(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setKonum({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setKonumYukleniyor(false);
      },
      () => {
        setKonumYukleniyor(false);
        alert('Konum alınamadı. Lütfen tarayıcı konumuna izin verin.');
      }
    );
  }, []);

  const handlePhoto = useCallback((id: string, url: string) => {
    setPhotos(prev => ({ ...prev, [id]: url }));
  }, []);

  const mevcutAdim = ADIMLAR[adim];

  const renderContent = () => {
    switch (mevcutAdim.id) {
      case 'guvenlik':
        return (
          <Adim1Guvenlik
            kontroller={mevcutAdim.kontroller!}
            checked={checked}
            onToggle={toggleCheck}
          />
        );
      case 'konum':
        return (
          <Adim2Konum
            konum={konum}
            yukleniyor={konumYukleniyor}
            onKonumAl={konumAl}
          />
        );
      case 'karsitaraf':
      case 'hasar':
        return (
          <FotografAdimi
            fotograflar={mevcutAdim.fotograflar!}
            photos={photos}
            onPhoto={handlePhoto}
          />
        );
      case 'yardim':
        return <Adim5Yardim />;
      default:
        return null;
    }
  };

  return (
    <div className="kaza-wizard">
      {/* Header */}
      <div className="kaza-wizard-header">
        <div style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.6)' }}>
          Adım {adim + 1} / {ADIMLAR.length}
        </div>
        <div className="kaza-wizard-progress">
          {ADIMLAR.map((_, i) => (
            <div
              key={i}
              className={`kaza-wizard-progress-dot ${i < adim ? 'done' : i === adim ? 'active' : ''}`}
            />
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: 8,
            color: 'white',
            cursor: 'pointer',
            fontSize: 16,
            padding: '6px 12px',
          }}
        >
          ✕ Kapat
        </button>
      </div>

      {/* Body */}
      <div className="kaza-wizard-body">
        <div className={`kaza-step-icon ${mevcutAdim.iconClass}`}>
          {mevcutAdim.icon}
        </div>
        <h2 className="kaza-step-title">{mevcutAdim.baslik}</h2>
        <p className="kaza-step-desc">{mevcutAdim.aciklama}</p>
        {renderContent()}
      </div>

      {/* Footer */}
      <div className="kaza-wizard-footer">
        {adim > 0 && (
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={() => setAdim(a => a - 1)}
          >
            ← Geri
          </button>
        )}
        {adim < ADIMLAR.length - 1 ? (
          <button
            className="btn btn-primary"
            style={{ flex: 2 }}
            onClick={() => setAdim(a => a + 1)}
          >
            Devam Et →
          </button>
        ) : (
          <button
            className="btn btn-primary"
            style={{ flex: 2, background: 'linear-gradient(135deg,#10b981,#059669)' }}
            onClick={onClose}
          >
            ✓ Tamamlandı
          </button>
        )}
      </div>
    </div>
  );
}

export default function KazaAsistani() {
  const [wizardAcik, setWizardAcik] = useState(false);

  return (
    <>
      <button className="kaza-btn" onClick={() => setWizardAcik(true)} id="kaza-btn">
        <div className="kaza-btn-icon">🚨</div>
        <div className="kaza-btn-text">
          <strong>Kaza Yaptım!</strong>
          <span>Adım adım yönlendirme, konum ve fotoğraf rehberi</span>
        </div>
      </button>

      {wizardAcik && (
        <KazaWizard onClose={() => setWizardAcik(false)} />
      )}
    </>
  );
}
