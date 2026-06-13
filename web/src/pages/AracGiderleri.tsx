import { useState, useCallback, useMemo } from 'react';
import { TarihSecici } from '../components/TarihSecici';
import { useGiderler, KATEGORI_BILGI, type GiderKategori } from '../contexts/GiderlerContext';
import { useAraclar } from '../contexts/AraclarContext';
import { giderAnalizAl, type GiderOzeti } from '../services/aiService';

const KATEGORILER = Object.keys(KATEGORI_BILGI) as GiderKategori[];

const buAy = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const formatTarih = (tarih: string) => {
  const d = new Date(tarih + 'T00:00:00');
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatTutar = (t: number) =>
  t.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';

function DonutChart({ data }: { data: { label: string; tutar: number; renk: string }[] }) {
  const toplam = data.reduce((t, d) => t + d.tutar, 0);
  if (toplam === 0) return null;

  let birikimli = 0;
  const dilimler = data.map(d => {
    const oran = d.tutar / toplam;
    const baslangic = birikimli;
    birikimli += oran;
    return { ...d, oran, baslangic };
  });

  // conic-gradient oluştur
  const stops = dilimler
    .map(d => `${d.renk} ${(d.baslangic * 360).toFixed(1)}deg ${((d.baslangic + d.oran) * 360).toFixed(1)}deg`)
    .join(', ');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
      <div className="donut-chart" style={{ background: `conic-gradient(${stops})` }}>
        <div className="donut-hole">
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 700 }}>Toplam</div>
          <div style={{ fontSize: 13, fontWeight: 900, marginTop: 2 }}>{formatTutar(toplam)}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {dilimler.map(d => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: d.renk, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{d.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, marginLeft: 'auto' }}>{formatTutar(d.tutar)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AracGiderleri() {
  const { giderler, giderEkle, giderSil } = useGiderler();
  const { araclar } = useAraclar();

  const [secilenArac, setSecilenArac] = useState<string>(araclar[0]?.id ?? '');
  const [formAcik, setFormAcik] = useState(false);
  const [kategori, setKategori] = useState<GiderKategori>('yakit');
  const [tutar, setTutar] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [tarih, setTarih] = useState(new Date().toISOString().slice(0, 10));
  const [filtre, setFiltre] = useState<GiderKategori | 'tumu'>('tumu');
  const [donemFiltre, setDonemFiltre] = useState<'tumu' | 'bu-ay' | 'bu-yil'>('tumu');
  const [silOnay, setSilOnay] = useState<string | null>(null);

  // AI Gider Analizi
  const [aiAnalizYukleniyor, setAiAnalizYukleniyor] = useState(false);
  const [aiAnalizIcerik, setAiAnalizIcerik] = useState<string | null>(null);
  const [aiAnalizHata, setAiAnalizHata] = useState<string | null>(null);

  const aracGiderleri = useMemo(() =>
    giderler.filter(g => g.aracId === secilenArac),
    [giderler, secilenArac]
  );

  const filtrelenmis = useMemo(() => {
    let liste = [...aracGiderleri];
    if (filtre !== 'tumu') liste = liste.filter(g => g.kategori === filtre);
    if (donemFiltre === 'bu-ay') {
      const ay = buAy();
      liste = liste.filter(g => g.tarih.startsWith(ay));
    } else if (donemFiltre === 'bu-yil') {
      const yil = new Date().getFullYear().toString();
      liste = liste.filter(g => g.tarih.startsWith(yil));
    }
    return liste.sort((a, b) => b.tarih.localeCompare(a.tarih));
  }, [aracGiderleri, filtre, donemFiltre]);

  const grafikData = useMemo(() => {
    const toplamlar: Record<GiderKategori, number> = {} as any;
    aracGiderleri.forEach(g => {
      toplamlar[g.kategori] = (toplamlar[g.kategori] ?? 0) + g.tutar;
    });
    return KATEGORILER
      .filter(k => (toplamlar[k] ?? 0) > 0)
      .map(k => ({
        label: KATEGORI_BILGI[k].label,
        tutar: toplamlar[k],
        renk: KATEGORI_BILGI[k].renk,
      }));
  }, [aracGiderleri]);

  const toplamTutar = useMemo(() =>
    filtrelenmis.reduce((t, g) => t + g.tutar, 0),
    [filtrelenmis]
  );

  const handleEkle = useCallback(() => {
    const t = parseFloat(tutar.replace(',', '.'));
    if (!secilenArac || isNaN(t) || t <= 0) return;
    giderEkle({ aracId: secilenArac, kategori, tutar: t, aciklama: aciklama.trim() || KATEGORI_BILGI[kategori].label, tarih });
    setTutar('');
    setAciklama('');
    setTarih(new Date().toISOString().slice(0, 10));
    setFormAcik(false);
  }, [secilenArac, kategori, tutar, aciklama, tarih, giderEkle]);

  const handleSil = useCallback((id: string) => {
    giderSil(id);
    setSilOnay(null);
  }, [giderSil]);

  const handleAiAnaliz = useCallback(async () => {
    const secilenAracObj = araclar.find(a => a.id === secilenArac);
    if (!secilenAracObj || aracGiderleri.length === 0) return;

    setAiAnalizYukleniyor(true);
    setAiAnalizIcerik(null);
    setAiAnalizHata(null);

    // Kategori bazlı özet oluştur
    const ozet: Record<string, GiderOzeti> = {};
    aracGiderleri.forEach(g => {
      const label = KATEGORI_BILGI[g.kategori]?.label ?? g.kategori;
      if (!ozet[label]) ozet[label] = { kategori: label, tutar: 0, adet: 0 };
      ozet[label].tutar += g.tutar;
      ozet[label].adet += 1;
    });
    const giderListesi = Object.values(ozet);
    const toplam = aracGiderleri.reduce((t, g) => t + g.tutar, 0);
    const email = localStorage.getItem('@caremind:kayitliEposta');

    try {
      const analiz = await giderAnalizAl(secilenAracObj, giderListesi, toplam, email);
      setAiAnalizIcerik(analiz);
    } catch {
      setAiAnalizHata('Analiz alınırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setAiAnalizYukleniyor(false);
    }
  }, [secilenArac, araclar, aracGiderleri]);

  return (
    <div className="animate-slideUp">
      <div className="page-header">
        <h1>💰 Araç Giderleri</h1>
        <p>Tüm araç masraflarınızı tek yerde takip edin.</p>
      </div>

      {/* Araç seçici */}
      {araclar.length > 1 && (
        <div className="flex gap-8 mb-24" style={{ flexWrap: 'wrap' }}>
          {araclar.map(a => (
            <button
              key={a.id}
              className={`btn btn-sm ${secilenArac === a.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSecilenArac(a.id)}
            >
              🚗 {a.plaka} — {a.marka} {a.model}
            </button>
          ))}
        </div>
      )}

      {araclar.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🚗</div>
          <h3>Önce araç ekleyin</h3>
          <p>Gider takibi için en az bir araç kayıtlı olmalıdır.</p>
        </div>
      )}

      {araclar.length > 0 && (
        <>
          {/* Grafik özet */}
          {grafikData.length > 0 && (
            <div className="card mb-24">
              <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Kategori Dağılımı</h3>
              <DonutChart data={grafikData} />

              {/* AI Gider Analizi */}
              <div style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid var(--color-border)',
              }}>
                {!aiAnalizIcerik && !aiAnalizYukleniyor && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleAiAnaliz}
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
                      border: '1px solid rgba(99,102,241,0.35)',
                      color: '#a5b4fc',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    🤖 AI ile Gider Analizi Yap
                  </button>
                )}

                {aiAnalizYukleniyor && (
                  <div className="ai-loading">
                    <span className="spinner" />
                    Gemini giderlerinizi analiz ediyor...
                  </div>
                )}

                {aiAnalizHata && (
                  <div style={{ color: 'var(--color-red)', fontSize: 13 }}>
                    {aiAnalizHata}
                    <button className="btn btn-secondary btn-sm mt-8" onClick={handleAiAnaliz}>🔄 Tekrar Dene</button>
                  </div>
                )}

                {aiAnalizIcerik && (
                  <div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginBottom: 10,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#a5b4fc' }}>🤖 AI Analizi</span>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setAiAnalizIcerik(null); setAiAnalizHata(null); }}
                        style={{ fontSize: 11 }}
                      >Kapat</button>
                    </div>
                    <div className="ai-content" style={{ marginTop: 0 }}>
                      {aiAnalizIcerik}
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={handleAiAnaliz}
                      style={{ marginTop: 8, fontSize: 12 }}
                    >
                      🔄 Yenile
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="stats-grid mb-24">
            <div className="stat-card accent">
              <div className="stat-icon accent">📊</div>
              <div className="stat-value">{formatTutar(aracGiderleri.reduce((t, g) => t + g.tutar, 0))}</div>
              <div className="stat-label">Toplam Gider</div>
            </div>
            <div className="stat-card yellow">
              <div className="stat-icon yellow">📅</div>
              <div className="stat-value">
                {formatTutar(
                  aracGiderleri.filter(g => g.tarih.startsWith(buAy())).reduce((t, g) => t + g.tutar, 0)
                )}
              </div>
              <div className="stat-label">Bu Ay</div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon green">📝</div>
              <div className="stat-value">{aracGiderleri.length}</div>
              <div className="stat-label">Toplam Kayıt</div>
            </div>
          </div>

          {/* Gider Ekle Butonu */}
          <div className="flex justify-between items-center mb-16">
            <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
              <button
                className={`btn btn-sm ${donemFiltre === 'tumu' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setDonemFiltre('tumu')}
              >Tümü</button>
              <button
                className={`btn btn-sm ${donemFiltre === 'bu-ay' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setDonemFiltre('bu-ay')}
              >Bu Ay</button>
              <button
                className={`btn btn-sm ${donemFiltre === 'bu-yil' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setDonemFiltre('bu-yil')}
              >Bu Yıl</button>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setFormAcik(true)}>
              ＋ Gider Ekle
            </button>
          </div>

          {/* Kategori filtreleri */}
          <div className="flex gap-8 mb-16" style={{ flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${filtre === 'tumu' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFiltre('tumu')}
            >Tüm Kategoriler</button>
            {KATEGORILER.map(k => (
              <button
                key={k}
                className={`btn btn-sm ${filtre === k ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFiltre(k)}
              >
                {KATEGORI_BILGI[k].icon} {KATEGORI_BILGI[k].label}
              </button>
            ))}
          </div>

          {/* Gider Listesi */}
          {filtrelenmis.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 24px' }}>
              <div className="empty-state-icon">💳</div>
              <h3>Gider bulunamadı</h3>
              <p>Bu dönem için kayıtlı gider yok.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-12">
                <span className="text-secondary" style={{ fontSize: 13 }}>
                  {filtrelenmis.length} kayıt
                </span>
                <span style={{ fontWeight: 800, color: 'var(--color-accent)' }}>
                  Toplam: {formatTutar(toplamTutar)}
                </span>
              </div>
              <div className="flex flex-col gap-8">
                {filtrelenmis.map(g => {
                  const kat = KATEGORI_BILGI[g.kategori];
                  return (
                    <div key={g.id} className="gider-row" style={{ animation: 'slideUp 0.3s ease both' }}>
                      <div className="gider-icon" style={{ background: kat.bg }}>
                        {kat.icon}
                      </div>
                      <div className="gider-info">
                        <div className="gider-info-title">{g.aciklama}</div>
                        <div className="gider-info-sub">{formatTarih(g.tarih)} · {kat.label}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className="gider-amount">{formatTutar(g.tutar)}</span>
                        <button
                          className="btn-icon"
                          onClick={() => setSilOnay(g.id)}
                          style={{ width: 32, height: 32, fontSize: 14, color: 'var(--color-red)', borderColor: 'rgba(239,68,68,0.2)' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* Gider Ekle Modal */}
      {formAcik && (
        <div className="modal-overlay" onClick={() => setFormAcik(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 className="modal-title">💳 Gider Ekle</h3>
              <button className="btn-icon" onClick={() => setFormAcik(false)}>✕</button>
            </div>

            {/* Kategori seçici */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
                Kategori
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {KATEGORILER.map(k => (
                  <button
                    key={k}
                    className={`gider-kat-btn ${kategori === k ? 'active' : ''}`}
                    onClick={() => setKategori(k)}
                  >
                    <span className="gider-kat-icon">{KATEGORI_BILGI[k].icon}</span>
                    {KATEGORI_BILGI[k].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group mb-16">
              <label className="form-label">Tutar (₺)</label>
              <input
                className="form-input"
                type="number"
                placeholder="0.00"
                value={tutar}
                onChange={e => setTutar(e.target.value)}
                min="0"
                step="0.01"
                autoFocus
              />
            </div>

            <div className="form-group mb-16">
              <label className="form-label">Açıklama (opsiyonel)</label>
              <input
                className="form-input"
                type="text"
                placeholder={`ör. ${KATEGORI_BILGI[kategori].label} gideri`}
                value={aciklama}
                onChange={e => setAciklama(e.target.value)}
              />
            </div>

            <div className="form-group mb-24">
              <TarihSecici label="Tarih" value={tarih} onChange={setTarih} clearable={false} />
            </div>

            <div className="flex gap-8">
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setFormAcik(false)}>
                İptal
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={handleEkle}
                disabled={!tutar || parseFloat(tutar) <= 0}
              >
                ＋ Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Silme onayı */}
      {silOnay && (
        <div className="modal-overlay" onClick={() => setSilOnay(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Gideri Sil</h3>
              <button className="btn-icon" onClick={() => setSilOnay(null)}>✕</button>
            </div>
            <p className="text-secondary mb-24">Bu gider kaydı silinecektir. Bu işlem geri alınamaz.</p>
            <div className="flex gap-8">
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSilOnay(null)}>
                Vazgeç
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleSil(silOnay)}>
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
