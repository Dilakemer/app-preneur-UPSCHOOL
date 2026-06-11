import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAraclar } from '../contexts/AraclarContext';

type Insurer = { id: string; name: string; base: number; rating: number };

const INSURERS: Insurer[] = [
  { id: 'allianz', name: 'Allianz', base: 1800, rating: 4.6 },
  { id: 'aksigorta', name: 'Aksigorta', base: 1750, rating: 4.3 },
  { id: 'anadolu', name: 'Anadolu Sigorta', base: 1900, rating: 4.5 },
  { id: 'groupama', name: 'Groupama', base: 1700, rating: 4.1 },
  { id: 'mapfre', name: 'Mapfre', base: 1650, rating: 4.0 },
];

export default function SigortaKarsilastir() {
  const { araclar } = useAraclar();
  const navigate = useNavigate();
  const arac = araclar.length > 0 ? araclar[0] : undefined;

  const teklifler = useMemo(() => {
    const ageFactor = arac ? Math.max(0.7, 1 - (new Date().getFullYear() - arac.yil) * 0.03) : 0.9;
    return INSURERS.map(s => ({
      ...s,
      price: Math.round(s.base * ageFactor),
    })).sort((a, b) => a.price - b.price);
  }, [arac]);

  const handleTeklifAl = (_insurerId: string) => {
    window.open('https://www.sigortam.net/', '_blank');
  };

  return (
    <div className="animate-slideUp" style={{ maxWidth: 700 }}>
      <div className="flex justify-between items-center mb-24">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
          ← Geri
        </button>
      </div>

      <div className="page-header">
        <h1>Sigorta Karşılaştır</h1>
        <p>
          {arac
            ? `${arac.plaka} • ${arac.marka} ${arac.model}`
            : 'Araç seçilmedi — tüm araçlara göre tahmini fiyatlar.'}
        </p>
      </div>

      <div className="card mb-24" style={{
        background: 'var(--color-accent-soft)',
        borderColor: 'rgba(99,102,241,0.2)'
      }}>
        <p className="text-secondary" style={{ fontSize: 13, lineHeight: 1.6 }}>
          ℹ️ Bu mod affiliate/tahmini modudur — herhangi bir şirkete ayrı ayrı kayıt olmadan
          tahmini fiyatları görebilirsiniz. Teklif almak için ilgili sayfaya yönlendirileceksiniz.
        </p>
      </div>

      <div className="flex flex-col gap-16">
        {teklifler.map((teklif, i) => (
          <div
            key={teklif.id}
            className="insurance-card"
            onClick={() => handleTeklifAl(teklif.id)}
            style={{
              animationDelay: `${i * 80}ms`,
              animation: `slideUp 0.4s ease ${i * 80}ms both`
            }}
          >
            <div>
              <div className="insurance-name">{teklif.name}</div>
              <div className="insurance-rating">⭐ Puan: {teklif.rating.toFixed(1)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="insurance-price">{teklif.price.toLocaleString('tr-TR')} TL</div>
              <div className="insurance-cta">Teklif Al →</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
