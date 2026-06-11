import { useNavigate } from 'react-router-dom';
import { useAraclar } from '../contexts/AraclarContext';
import { enYakinTarihBul, kalanGunMetni, tarihFormatla } from '../utils/tarihHesapla';
import { durumRengiBelirle, durumRengiCSS } from '../utils/renkBelirle';
import { KATEGORI_BASLIKLARI } from '../types/Arac';
import { useMemo } from 'react';

export default function Dashboard() {
  const { araclar, yukleniyor, yenile } = useAraclar();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    let toplamTarih = 0;
    let acilSayisi = 0;
    let yakinSayisi = 0;

    araclar.forEach(arac => {
      const tarihler = [arac.muayeneTarihi, arac.sigortaTarihi, arac.kaskoTarihi, arac.bakimTarihi]
        .filter(Boolean);
      toplamTarih += tarihler.length;

      const enYakin = enYakinTarihBul(arac);
      if (enYakin) {
        if (enYakin.kalanGun <= 7) acilSayisi++;
        else if (enYakin.kalanGun <= 30) yakinSayisi++;
      }
    });

    return { toplamTarih, acilSayisi, yakinSayisi };
  }, [araclar]);

  if (yukleniyor) {
    return (
      <div className="empty-state">
        <div className="spinner" style={{ width: 40, height: 40 }} />
        <p className="mt-16 text-secondary">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="animate-slideUp">
      <div className="page-header">
        <h1>Araçlarım</h1>
        <p>Araç takip panelinize hoş geldiniz.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-icon accent">🚗</div>
          <div className="stat-value">{araclar.length}</div>
          <div className="stat-label">Kayıtlı Araç</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green">📅</div>
          <div className="stat-value">{stats.toplamTarih}</div>
          <div className="stat-label">Takip Edilen Tarih</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-icon yellow">⚠️</div>
          <div className="stat-value">{stats.yakinSayisi}</div>
          <div className="stat-label">Yaklaşan (30 gün)</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red">🔴</div>
          <div className="stat-value">{stats.acilSayisi}</div>
          <div className="stat-label">Acil (7 gün)</div>
        </div>
      </div>

      {/* Vehicle List */}
      {araclar.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🚗</div>
          <h3>Henüz araç eklemediniz</h3>
          <p>
            Araçlarınızın muayene, sigorta ve bakım tarihlerini takip etmek için
            ilk aracınızı ekleyin.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/arac/ekle')}>
            ＋ Araç Ekle
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-16">
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>Araç Listesi</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => yenile()}>
              🔄 Yenile
            </button>
          </div>
          <div className="arac-grid">
            {araclar.map(arac => {
              const enYakin = enYakinTarihBul(arac);
              const durum = enYakin ? durumRengiBelirle(enYakin.kalanGun) : 'neutral';
              const stripeColor = durumRengiCSS(durum);
              const badgeBg = durum === 'red' ? 'var(--color-red-glow)' :
                              durum === 'yellow' ? 'var(--color-yellow-glow)' :
                              durum === 'green' ? 'var(--color-green-glow)' :
                              'var(--color-card-dark)';
              const badgeColor = durum === 'neutral' ? 'var(--color-text-secondary)' : stripeColor;

              return (
                <div
                  key={arac.id}
                  className="arac-card"
                  onClick={() => navigate(`/arac/${arac.id}`)}
                >
                  <div className="arac-card-stripe" style={{ background: stripeColor }} />
                  <div className="arac-card-body">
                    <div className="arac-card-top">
                      <div>
                        <div className="arac-card-title">
                          {[arac.marka, arac.model].filter(Boolean).join(' ')}{' '}
                          <span className="arac-card-year">({arac.yil})</span>
                        </div>
                        <div className="arac-card-plaka">
                          <span>#</span>
                          <span>{arac.plaka}</span>
                        </div>
                      </div>
                    </div>
                    <div className="arac-card-bottom">
                      <div className="arac-card-info">
                        📅{' '}
                        {enYakin
                          ? `${KATEGORI_BASLIKLARI[enYakin.kategori]}: ${tarihFormatla(enYakin.tarih)}`
                          : 'Tarih eklenmedi'}
                      </div>
                      <div
                        className="arac-card-badge"
                        style={{ background: badgeBg, color: badgeColor }}
                      >
                        {enYakin ? kalanGunMetni(enYakin.kalanGun) : 'Takip Et'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* FAB */}
      <button className="fab" onClick={() => navigate('/arac/ekle')} title="Araç Ekle">
        ＋
      </button>
    </div>
  );
}
