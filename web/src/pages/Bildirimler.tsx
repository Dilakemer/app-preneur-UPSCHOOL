import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAraclar } from '../contexts/AraclarContext';
import { kalanGunHesapla, kalanGunMetni, tarihFormatla } from '../utils/tarihHesapla';
import { KATEGORI_BASLIKLARI, KATEGORI_IKONLARI, TARIH_KATEGORILERI } from '../types/Arac';
import type { TarihKategorisi } from '../types/Arac';

interface BildirimItem {
  aracId: string;
  plaka: string;
  marka: string;
  model: string;
  kategori: TarihKategorisi;
  tarih: string;
  kalanGun: number;
}

type Filtre = 'tumu' | 'acil' | 'yaklasan' | 'gecmis';

const FILTRE_LABELS: Record<Filtre, string> = {
  tumu: 'Tümü',
  acil: '🔴 Acil (7 gün)',
  yaklasan: '🟡 Yaklaşan (30 gün)',
  gecmis: '⚫ Geçmiş',
};

function durumBelirle(kalanGun: number): 'gecmis' | 'acil' | 'yaklasan' | 'iyi' {
  if (kalanGun < 0) return 'gecmis';
  if (kalanGun <= 7) return 'acil';
  if (kalanGun <= 30) return 'yaklasan';
  return 'iyi';
}

const DURUM_RENK: Record<string, string> = {
  gecmis: 'var(--color-red)',
  acil: 'var(--color-red)',
  yaklasan: 'var(--color-yellow)',
  iyi: 'var(--color-green)',
};

const DURUM_BG: Record<string, string> = {
  gecmis: 'var(--color-red-glow)',
  acil: 'var(--color-red-glow)',
  yaklasan: 'var(--color-yellow-glow)',
  iyi: 'var(--color-green-glow)',
};

export default function Bildirimler() {
  const { araclar } = useAraclar();
  const navigate = useNavigate();
  const [filtre, setFiltre] = useState<Filtre>('tumu');
  const [bildirimIzni, setBildirimIzni] = useState<NotificationPermission | 'unsupported'>('default');
  const [testGonderildi, setTestGonderildi] = useState(false);

  // Tüm tarih bildirimlerini araclardan hesapla
  const tumBildirimler: BildirimItem[] = [];
  for (const arac of araclar) {
    for (const kat of TARIH_KATEGORILERI) {
      const tarihKey = `${kat}Tarihi` as keyof typeof arac;
      const tarih = arac[tarihKey] as string | null;
      if (tarih) {
        tumBildirimler.push({
          aracId: arac.id,
          plaka: arac.plaka,
          marka: arac.marka,
          model: arac.model,
          kategori: kat,
          tarih,
          kalanGun: kalanGunHesapla(tarih),
        });
      }
    }
  }
  tumBildirimler.sort((a, b) => a.kalanGun - b.kalanGun);

  const filtrelenmis = tumBildirimler.filter((b) => {
    if (filtre === 'tumu') return true;
    const d = durumBelirle(b.kalanGun);
    if (filtre === 'acil') return d === 'acil' || d === 'gecmis';
    if (filtre === 'yaklasan') return d === 'yaklasan';
    if (filtre === 'gecmis') return d === 'gecmis';
    return true;
  });

  const acilSayisi = tumBildirimler.filter((b) => {
    const d = durumBelirle(b.kalanGun);
    return d === 'acil' || d === 'gecmis';
  }).length;

  // Bildirim izni kontrolü
  useEffect(() => {
    if (!('Notification' in window)) {
      setBildirimIzni('unsupported');
    } else {
      setBildirimIzni(Notification.permission);
    }
  }, []);

  const izinIste = useCallback(async () => {
    if (!('Notification' in window)) return;
    const izin = await Notification.requestPermission();
    setBildirimIzni(izin);
  }, []);

  const testBildirimiGonder = useCallback(() => {
    if (bildirimIzni !== 'granted') return;
    const aciller = tumBildirimler.filter((b) => {
      const d = durumBelirle(b.kalanGun);
      return d === 'acil' || d === 'gecmis';
    });

    if (aciller.length === 0) {
      new Notification('CareMind — Araç Takip', {
        body: '✅ Tüm tarihleriniz güncel. Yaklaşan acil durum yok.',
        icon: '/favicon.ico',
      });
    } else {
      aciller.slice(0, 3).forEach((b) => {
        new Notification(`CareMind — ${b.marka} ${b.model} (${b.plaka})`, {
          body: `${KATEGORI_BASLIKLARI[b.kategori]}: ${b.kalanGun < 0 ? `${Math.abs(b.kalanGun)} gün geçmiş!` : `${b.kalanGun} gün kaldı`}`,
          icon: '/favicon.ico',
        });
      });
    }
    setTestGonderildi(true);
    setTimeout(() => setTestGonderildi(false), 3000);
  }, [bildirimIzni, tumBildirimler]);

  return (
    <div className="animate-slideUp">
      <div className="page-header">
        <h1>Bildirimler</h1>
        <p>Yaklaşan ve geçmiş araç tarihlerinizi takip edin.</p>
      </div>

      {/* Browser Notification Banner */}
      {bildirimIzni !== 'unsupported' && bildirimIzni !== 'granted' && (
        <div
          className="card mb-24"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.06))',
            borderColor: 'rgba(99,102,241,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 28 }}>🔔</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Tarayıcı Bildirimleri</div>
            <div className="text-secondary" style={{ fontSize: 13 }}>
              {bildirimIzni === 'denied'
                ? 'Bildirim izni reddedildi. Tarayıcı ayarlarından etkinleştirin.'
                : 'Tarayıcı bildirimlerine izin vererek araç tarihlerinizi kaçırmayın.'}
            </div>
          </div>
          {bildirimIzni === 'default' && (
            <button className="btn btn-primary btn-sm" onClick={izinIste}>
              İzin Ver
            </button>
          )}
        </div>
      )}

      {/* Test Notification */}
      {bildirimIzni === 'granted' && (
        <div className="card mb-24" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 28 }}>✅</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>Bildirimler Aktif</div>
            <div className="text-secondary" style={{ fontSize: 13 }}>Test bildirimi göndererek çalışıp çalışmadığını kontrol edin.</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={testBildirimiGonder}>
            {testGonderildi ? '✓ Gönderildi' : '🧪 Test Gönder'}
          </button>
        </div>
      )}

      {/* Özet Kartlar */}
      <div className="stats-grid mb-24">
        <div className="stat-card accent">
          <div className="stat-icon accent">📋</div>
          <div className="stat-value">{tumBildirimler.length}</div>
          <div className="stat-label">Toplam Tarih</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red">🔴</div>
          <div className="stat-value">{acilSayisi}</div>
          <div className="stat-label">Acil / Geçmiş</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-icon yellow">🟡</div>
          <div className="stat-value">{tumBildirimler.filter(b => durumBelirle(b.kalanGun) === 'yaklasan').length}</div>
          <div className="stat-label">Yaklaşan</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green">✅</div>
          <div className="stat-value">{tumBildirimler.filter(b => durumBelirle(b.kalanGun) === 'iyi').length}</div>
          <div className="stat-label">Güncel</div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex gap-8 mb-16" style={{ flexWrap: 'wrap' }}>
        {(Object.keys(FILTRE_LABELS) as Filtre[]).map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filtre === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltre(f)}
          >
            {FILTRE_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Liste */}
      {araclar.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔔</div>
          <h3>Henüz araç eklemediniz</h3>
          <p>Araçlarınızı ekleyerek tarih takibini ve bildirimleri kullanmaya başlayın.</p>
          <button className="btn btn-primary" onClick={() => navigate('/arac/ekle')}>
            ＋ Araç Ekle
          </button>
        </div>
      ) : filtrelenmis.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <h3>Bu kategoride bildirim yok</h3>
          <p>Farklı bir filtre seçin veya araç ekleyin.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {filtrelenmis.map((b, i) => {
            const durum = durumBelirle(b.kalanGun);
            const renk = DURUM_RENK[durum];
            const bg = DURUM_BG[durum];
            return (
              <div
                key={`${b.aracId}-${b.kategori}`}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  cursor: 'pointer',
                  borderLeft: `3px solid ${renk}`,
                  animation: `slideUp 0.3s ease ${i * 0.05}s both`,
                }}
                onClick={() => navigate(`/arac/${b.aracId}`)}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {KATEGORI_IKONLARI[b.kategori]}
                </div>

                {/* Bilgi */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
                    {b.marka} {b.model}
                    <span style={{ fontWeight: 400, color: 'var(--color-text-secondary)', fontSize: 13, marginLeft: 6 }}>
                      ({b.plaka})
                    </span>
                  </div>
                  <div className="text-secondary" style={{ fontSize: 13 }}>
                    {KATEGORI_BASLIKLARI[b.kategori]} — {tarihFormatla(b.tarih)}
                  </div>
                </div>

                {/* Badge */}
                <div
                  style={{
                    background: bg,
                    color: renk,
                    borderRadius: 8,
                    padding: '4px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {kalanGunMetni(b.kalanGun)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
