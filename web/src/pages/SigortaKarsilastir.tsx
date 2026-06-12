import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAraclar } from '../contexts/AraclarContext';
import type { Arac } from '../types/Arac';

interface Insurer {
  id: string;
  name: string;
  logo: string;
  base: number;
  rating: number;
  yorumSayisi: number;
  quoteUrl: string;
  ozellikler: {
    ikameArac: boolean;
    sinirsisMali: boolean;
    yolYardim: boolean;
    camSigorta: boolean;
    dogalAfet: boolean;
  };
  badges: { label: string; renk: 'gold' | 'green' | 'blue' | 'purple' }[];
}

const INSURERS: Insurer[] = [
  {
    id: 'allianz',
    name: 'Allianz Sigorta',
    logo: '🏛️',
    base: 1800,
    rating: 4.6,
    yorumSayisi: 12840,
    quoteUrl: 'https://www.allianz.com.tr/tr_TR/urunler/arac-sigortalari/trafik-sigortasi.html',
    ozellikler: { ikameArac: true, sinirsisMali: true, yolYardim: true, camSigorta: true, dogalAfet: false },
    badges: [{ label: '🏆 En Kapsamlı', renk: 'gold' }, { label: '⭐ Çok Satan', renk: 'purple' }],
  },
  {
    id: 'aksigorta',
    name: 'Aksigorta',
    logo: '🛡️',
    base: 1620,
    rating: 4.3,
    yorumSayisi: 8720,
    quoteUrl: 'https://www.aksigorta.com.tr/trafik-sigortasi',
    ozellikler: { ikameArac: true, sinirsisMali: false, yolYardim: true, camSigorta: false, dogalAfet: false },
    badges: [{ label: '💰 Fiyat/Performans', renk: 'green' }],
  },
  {
    id: 'anadolu',
    name: 'Anadolu Sigorta',
    logo: '🌙',
    base: 1900,
    rating: 4.5,
    yorumSayisi: 9450,
    quoteUrl: 'https://www.anadolusigorta.com.tr/trafik-sigortasi',
    ozellikler: { ikameArac: true, sinirsisMali: true, yolYardim: true, camSigorta: true, dogalAfet: true },
    badges: [{ label: '🌟 Premium', renk: 'gold' }],
  },
  {
    id: 'groupama',
    name: 'Groupama',
    logo: '🌱',
    base: 1480,
    rating: 4.1,
    yorumSayisi: 5230,
    quoteUrl: 'https://www.groupama.com.tr/',
    ozellikler: { ikameArac: false, sinirsisMali: false, yolYardim: true, camSigorta: false, dogalAfet: false },
    badges: [{ label: '💚 En Ucuz', renk: 'green' }],
  },
  {
    id: 'mapfre',
    name: 'Mapfre',
    logo: '🗺️',
    base: 1560,
    rating: 4.0,
    yorumSayisi: 4100,
    quoteUrl: 'https://www.mapfre.com.tr/sigorta/tr-tr/kisisel/arac-sigortalari/trafik-sigortasi/',
    ozellikler: { ikameArac: false, sinirsisMali: true, yolYardim: false, camSigorta: true, dogalAfet: false },
    badges: [{ label: '🔵 Dijital Hizmet', renk: 'blue' }],
  },
  {
    id: 'ray',
    name: 'Ray Sigorta',
    logo: '⚡',
    base: 1520,
    rating: 3.9,
    yorumSayisi: 2800,
    quoteUrl: 'https://www.raysigorta.com.tr/',
    ozellikler: { ikameArac: true, sinirsisMali: false, yolYardim: true, camSigorta: false, dogalAfet: false },
    badges: [],
  },
];

interface FiltreState {
  ikameArac: boolean;
  sinirsisMali: boolean;
  yolYardim: boolean;
  camSigorta: boolean;
  dogalAfet: boolean;
  maxFiyat: number;
  minPuan: number;
  siralama: 'fiyat' | 'puan' | 'kapsam';
}

const BASLANGIC_FILTRE: FiltreState = {
  ikameArac: false,
  sinirsisMali: false,
  yolYardim: false,
  camSigorta: false,
  dogalAfet: false,
  maxFiyat: 5000,
  minPuan: 0,
  siralama: 'fiyat',
};

const teklifLinkiOlustur = (insurer: Insurer, arac?: Arac) => {
  const url = new URL(insurer.quoteUrl);
  url.searchParams.set('utm_source', 'caremind');
  url.searchParams.set('utm_medium', 'web');
  if (arac) {
    url.searchParams.set('plaka', arac.plaka);
    url.searchParams.set('marka', arac.marka);
    url.searchParams.set('model', arac.model);
    url.searchParams.set('yil', String(arac.yil));
  }
  return url.toString();
};

export default function SigortaKarsilastir() {
  const { araclar } = useAraclar();
  const navigate = useNavigate();
  const [secilenAracId, setSecilenAracId] = useState(araclar[0]?.id ?? '');
  const [filtre, setFiltre] = useState<FiltreState>(BASLANGIC_FILTRE);
  const [filtreAcik, setFiltreAcik] = useState(false);

  const arac = araclar.find(a => a.id === secilenAracId) ?? araclar[0];

  const fiyatliTeklifler = useMemo(() => {
    const ageFactor = arac
      ? Math.max(0.6, 1 - (new Date().getFullYear() - arac.yil) * 0.035)
      : 0.9;
    return INSURERS.map(ins => ({
      ...ins,
      hesaplananFiyat: Math.round(ins.base * ageFactor),
    }));
  }, [arac]);

  const filtrelenmis = useMemo(() => {
    let liste = fiyatliTeklifler.filter(t => {
      if (filtre.ikameArac && !t.ozellikler.ikameArac) return false;
      if (filtre.sinirsisMali && !t.ozellikler.sinirsisMali) return false;
      if (filtre.yolYardim && !t.ozellikler.yolYardim) return false;
      if (filtre.camSigorta && !t.ozellikler.camSigorta) return false;
      if (filtre.dogalAfet && !t.ozellikler.dogalAfet) return false;
      if (t.hesaplananFiyat > filtre.maxFiyat) return false;
      if (t.rating < filtre.minPuan) return false;
      return true;
    });

    if (filtre.siralama === 'fiyat') liste.sort((a, b) => a.hesaplananFiyat - b.hesaplananFiyat);
    else if (filtre.siralama === 'puan') liste.sort((a, b) => b.rating - a.rating);
    else if (filtre.siralama === 'kapsam') {
      liste.sort((a, b) => {
        const kapsamA = Object.values(a.ozellikler).filter(Boolean).length;
        const kapsamB = Object.values(b.ozellikler).filter(Boolean).length;
        return kapsamB - kapsamA;
      });
    }
    return liste;
  }, [fiyatliTeklifler, filtre]);

  const aktifFiltreAdet = Object.entries(filtre).filter(([k, v]) =>
    k !== 'siralama' && k !== 'maxFiyat' && k !== 'minPuan'
      ? v === true
      : k === 'maxFiyat'
      ? v < 5000
      : k === 'minPuan'
      ? v > 0
      : false
  ).length;

  const toggleFiltre = (key: keyof Pick<FiltreState, 'ikameArac' | 'sinirsisMali' | 'yolYardim' | 'camSigorta' | 'dogalAfet'>) => {
    setFiltre(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const FiltrePanel = () => (
    <div className="sigorta-filtre-panel">
      <div className="sigorta-filtre-title">
        🎛️ Filtreler
        {aktifFiltreAdet > 0 && (
          <span style={{ background: 'var(--color-accent)', color: 'white', borderRadius: '99px', padding: '2px 8px', fontSize: 11 }}>
            {aktifFiltreAdet}
          </span>
        )}
      </div>

      <div className="sigorta-filtre-group">
        <div className="sigorta-filtre-group-title">Sıralama</div>
        {([['fiyat', '💰 En Ucuz Önce'], ['puan', '⭐ Puana Göre'], ['kapsam', '🛡️ En Kapsamlı']] as const).map(([val, label]) => (
          <label key={val} className="sigorta-filtre-check">
            <input
              type="radio"
              name="siralama"
              checked={filtre.siralama === val}
              onChange={() => setFiltre(prev => ({ ...prev, siralama: val }))}
              style={{ accentColor: 'var(--color-accent)' }}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <div className="sigorta-filtre-group">
        <div className="sigorta-filtre-group-title">Özellikler</div>
        <label className="sigorta-filtre-check">
          <input type="checkbox" checked={filtre.ikameArac} onChange={() => toggleFiltre('ikameArac')} />
          <span>🚗 Sadece İkame Araç Verenler</span>
        </label>
        <label className="sigorta-filtre-check">
          <input type="checkbox" checked={filtre.sinirsisMali} onChange={() => toggleFiltre('sinirsisMali')} />
          <span>🔓 Sınırsız İhtiyari Mali Mesuliyet</span>
        </label>
        <label className="sigorta-filtre-check">
          <input type="checkbox" checked={filtre.yolYardim} onChange={() => toggleFiltre('yolYardim')} />
          <span>🛻 Acil Yol Yardımı Dahil</span>
        </label>
        <label className="sigorta-filtre-check">
          <input type="checkbox" checked={filtre.camSigorta} onChange={() => toggleFiltre('camSigorta')} />
          <span>🪟 Cam Sigortası Dahil</span>
        </label>
        <label className="sigorta-filtre-check">
          <input type="checkbox" checked={filtre.dogalAfet} onChange={() => toggleFiltre('dogalAfet')} />
          <span>🌪️ Doğal Afet Güvencesi</span>
        </label>
      </div>

      <div className="sigorta-filtre-group">
        <div className="sigorta-filtre-group-title">Maks. Fiyat</div>
        <input
          type="range"
          className="sigorta-slider"
          min={1000}
          max={5000}
          step={100}
          value={filtre.maxFiyat}
          onChange={e => setFiltre(prev => ({ ...prev, maxFiyat: Number(e.target.value) }))}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6 }}>
          <span>1.000 ₺</span>
          <span style={{ fontWeight: 800, color: 'var(--color-text)' }}>{filtre.maxFiyat.toLocaleString('tr-TR')} ₺</span>
        </div>
      </div>

      <div className="sigorta-filtre-group">
        <div className="sigorta-filtre-group-title">Min. Puan</div>
        <input
          type="range"
          className="sigorta-slider"
          min={0}
          max={5}
          step={0.5}
          value={filtre.minPuan}
          onChange={e => setFiltre(prev => ({ ...prev, minPuan: Number(e.target.value) }))}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6 }}>
          <span>0</span>
          <span style={{ fontWeight: 800, color: 'var(--color-text)' }}>⭐ {filtre.minPuan.toFixed(1)}+</span>
        </div>
      </div>

      {aktifFiltreAdet > 0 && (
        <button
          className="btn btn-secondary btn-sm btn-full"
          onClick={() => setFiltre(BASLANGIC_FILTRE)}
        >
          🔄 Filtreleri Sıfırla
        </button>
      )}
    </div>
  );

  return (
    <div className="animate-slideUp">
      <div className="flex justify-between items-center mb-24">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Geri</button>
        {/* Mobilde filtre butonu */}
        <button
          className="btn btn-secondary btn-sm"
          style={{ display: 'none' }}
          id="filtre-btn-mobil"
          onClick={() => setFiltreAcik(!filtreAcik)}
        >
          🎛️ Filtreler {aktifFiltreAdet > 0 && `(${aktifFiltreAdet})`}
        </button>
      </div>

      <div className="page-header">
        <h1>🛡️ Sigorta Karşılaştır</h1>
        <p>
          {arac
            ? `${arac.plaka} • ${arac.marka} ${arac.model} (${arac.yil})`
            : 'Tahmini fiyatları karşılaştırın'}
        </p>
      </div>

      {/* Araç seçici */}
      {araclar.length > 1 && (
        <div className="flex gap-8 mb-24" style={{ flexWrap: 'wrap' }}>
          {araclar.map(a => (
            <button
              key={a.id}
              className={`btn btn-sm ${secilenAracId === a.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSecilenAracId(a.id)}
            >
              🚗 {a.plaka}
            </button>
          ))}
        </div>
      )}

      <div className="card mb-24" style={{ background: 'var(--color-accent-soft)', borderColor: 'rgba(99,102,241,0.2)' }}>
        <p className="text-secondary" style={{ fontSize: 13, lineHeight: 1.6 }}>
          ℹ️ Gösterilen fiyatlar araç yaşına göre hesaplanmış <strong>tahmini başlangıç fiyatlarıdır.</strong> Kesin poliçe bedeli ilgili şirketin sitesinde hesaplanır.
        </p>
      </div>

      <div className="sigorta-layout">
        {/* Sol filtre paneli */}
        <FiltrePanel />

        {/* Sağ — sonuçlar */}
        <div>
          {/* Sonuç başlığı */}
          <div className="flex justify-between items-center mb-16">
            <span className="text-secondary" style={{ fontSize: 14 }}>
              <strong style={{ color: 'var(--color-text)' }}>{filtrelenmis.length}</strong> şirket bulundu
            </span>
          </div>

          {filtrelenmis.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>Sonuç bulunamadı</h3>
              <p>Filtrelerinizi gevşetip tekrar deneyin.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setFiltre(BASLANGIC_FILTRE)}>
                Filtreleri Sıfırla
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-16">
              {filtrelenmis.map((teklif, i) => {
                const kapsamSayisi = Object.values(teklif.ozellikler).filter(Boolean).length;
                const isFeatured = teklif.badges.some(b => b.renk === 'gold');

                return (
                  <div
                    key={teklif.id}
                    className={`sigorta-card-v2 ${isFeatured ? 'featured' : ''}`}
                    style={{ animation: `slideUp 0.35s ease ${i * 60}ms both` }}
                    onClick={() => window.open(teklifLinkiOlustur(teklif, arac), '_blank', 'noopener,noreferrer')}
                  >
                    {/* Başlık + fiyat */}
                    <div className="sigorta-card-header">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 28 }}>{teklif.logo}</span>
                          <span style={{ fontWeight: 900, fontSize: 18 }}>{teklif.name}</span>
                        </div>
                        <div className="sigorta-card-badges">
                          {teklif.badges.map(b => (
                            <span key={b.label} className={`sigorta-badge ${b.renk}`}>{b.label}</span>
                          ))}
                          {i === 0 && filtre.siralama === 'fiyat' && teklif.badges.length === 0 && (
                            <span className="sigorta-badge green">💰 En Ucuz</span>
                          )}
                        </div>
                      </div>
                      <div className="sigorta-card-price-block">
                        <div className="sigorta-card-price">
                          {teklif.hesaplananFiyat.toLocaleString('tr-TR')} ₺
                        </div>
                        <div className="sigorta-card-price-label">yıllık tahmini</div>
                        <div style={{ fontSize: 12, color: 'var(--color-yellow)', marginTop: 4 }}>
                          ⭐ {teklif.rating.toFixed(1)} ({teklif.yorumSayisi.toLocaleString('tr-TR')} yorum)
                        </div>
                      </div>
                    </div>

                    {/* Özellikler */}
                    <div className="sigorta-card-features">
                      {[
                        ['ikameArac', '🚗 İkame Araç'],
                        ['sinirsisMali', '🔓 Sınırsız İMM'],
                        ['yolYardim', '🛻 Yol Yardım'],
                        ['camSigorta', '🪟 Cam Sigortası'],
                        ['dogalAfet', '🌪️ Doğal Afet'],
                      ].map(([key, label]) => (
                        <div
                          key={key}
                          className={`sigorta-feature-tag ${teklif.ozellikler[key as keyof typeof teklif.ozellikler] ? 'yes' : 'no'}`}
                        >
                          {teklif.ozellikler[key as keyof typeof teklif.ozellikler] ? '✓' : '✗'} {label}
                        </div>
                      ))}
                      <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        {kapsamSayisi}/5 özellik
                      </div>
                    </div>

                    {/* CTA */}
                    <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{
                        background: 'var(--color-accent-soft)',
                        color: 'var(--color-accent)',
                        padding: '8px 16px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 800,
                      }}>
                        Teklif Al →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
