import { useParams, useNavigate } from 'react-router-dom';
import { useAraclar } from '../contexts/AraclarContext';
import { KATEGORI_BASLIKLARI, KATEGORI_IKONLARI, TARIH_KATEGORILERI } from '../types/Arac';
import { kalanGunHesapla, kalanGunMetni, tarihFormatla } from '../utils/tarihHesapla';
import { durumRengiBelirle, durumRengiCSS, durumRengiGlow } from '../utils/renkBelirle';
import { useState, useCallback } from 'react';
import { aiTavsiyeAl as aiServis } from '../services/aiService';
import type { AIPromptTipi } from '../services/aiService';

export default function AracDetay() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { aracGetir, araciSil } = useAraclar();
  const arac = id ? aracGetir(id) : undefined;

  const [aiLoading, setAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiTip, setAiTip] = useState<AIPromptTipi>('tavsiye');
  const [silOnay, setSilOnay] = useState(false);

  const aiTavsiyeAl = useCallback(async (tip: AIPromptTipi = 'tavsiye') => {
    if (!arac) return;
    setAiTip(tip);
    setAiLoading(true);
    setAiError(null);
    setAiContent(null);
    try {
      const email = localStorage.getItem('@caremind:kayitliEposta');
      const sonuc = await aiServis(arac, tip, email);
      setAiContent(sonuc);
    } catch {
      setAiError('AI tavsiyesi alınırken beklenmedik bir hata oluştu.');
    } finally {
      setAiLoading(false);
    }
  }, [arac]);

  const handleSil = async () => {
    if (!id) return;
    await araciSil(id);
    navigate('/');
  };

  if (!arac) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">❌</div>
        <h3>Araç bulunamadı</h3>
        <p>Bu ID'ye ait bir araç kaydı bulunmuyor.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Ana Sayfaya Dön</button>
      </div>
    );
  }

  const tarihler = TARIH_KATEGORILERI.map(kat => {
    const tarihKey = `${kat}Tarihi` as keyof typeof arac;
    const tarih = arac[tarihKey] as string | null;
    return {
      kategori: kat,
      tarih,
      kalanGun: tarih ? kalanGunHesapla(tarih) : null,
    };
  });

  return (
    <div className="animate-slideUp">
      {/* Back + Actions */}
      <div className="flex justify-between items-center mb-24">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
          ← Geri
        </button>
        <div className="flex gap-8">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/arac/${id}/duzenle`)}>
            ✏️ Düzenle
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => setSilOnay(true)}>
            🗑️ Sil
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="detail-hero">
        <div className="detail-hero-title">
          {[arac.marka, arac.model].filter(Boolean).join(' ')} ({arac.yil})
        </div>
        <div className="detail-hero-sub">
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--color-accent-soft)', padding: '4px 12px',
            borderRadius: 8, fontWeight: 700, color: 'var(--color-accent)', letterSpacing: 1
          }}>
            # {arac.plaka}
          </span>
        </div>
      </div>

      {/* Date Cards */}
      <div className="detail-dates-grid">
        {tarihler.map(({ kategori, tarih, kalanGun }) => {
          const durum = kalanGun !== null ? durumRengiBelirle(kalanGun) : 'neutral';
          const renk = durumRengiCSS(durum);
          const glow = durumRengiGlow(durum);
          return (
            <div className="date-card" key={kategori}>
              <div className="date-card-icon" style={{ background: glow }}>
                {KATEGORI_IKONLARI[kategori]}
              </div>
              <div className="date-card-info">
                <div className="date-card-label">{KATEGORI_BASLIKLARI[kategori]}</div>
                <div className="date-card-value">
                  {tarih ? tarihFormatla(tarih) : 'Belirtilmedi'}
                </div>
                {kalanGun !== null && (
                  <div
                    className="date-card-remaining"
                    style={{ background: glow, color: renk }}
                  >
                    {kalanGunMetni(kalanGun)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Section */}
      <div className="ai-section">
        <div className="ai-header">
          <div className="ai-icon">🤖</div>
          <div>
            <div className="ai-title">AI Danışman</div>
            <div className="text-secondary" style={{ fontSize: 13 }}>
              Gemini AI ile araç bakım tavsiyeleri
            </div>
          </div>
        </div>

        {!aiContent && !aiLoading && !aiError && (
          <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" onClick={() => aiTavsiyeAl('tavsiye')}>
              💡 Tavsiye Al
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => aiTavsiyeAl('ozet')}>
              📋 Özet
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => aiTavsiyeAl('uyari')}>
              ⚠️ Uyarılar
            </button>
          </div>
        )}

        {aiLoading && (
          <div className="ai-loading">
            <span className="spinner" />
            AI yanıtı hazırlanıyor...
          </div>
        )}

        {aiError && (
          <div style={{ color: 'var(--color-red)', fontSize: 14 }}>
            {aiError}
            <button
              className="btn btn-secondary btn-sm mt-8"
              onClick={() => aiTavsiyeAl(aiTip)}
            >
              🔄 Tekrar Dene
            </button>
          </div>
        )}

        {aiContent && (
          <>
            <div className="ai-content">{aiContent}</div>
            <div className="flex gap-8 mt-16" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm" onClick={() => aiTavsiyeAl('tavsiye')}>
                💡 Tavsiye
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => aiTavsiyeAl('ozet')}>
                📋 Özet
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => aiTavsiyeAl('uyari')}>
                ⚠️ Uyarılar
              </button>
            </div>
          </>
        )}
      </div>


      {/* Delete Confirmation Modal */}
      {silOnay && (
        <div className="modal-overlay" onClick={() => setSilOnay(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Aracı Sil</h3>
              <button className="btn-icon" onClick={() => setSilOnay(false)}>✕</button>
            </div>
            <p className="text-secondary mb-24">
              <strong>{arac.marka} {arac.model}</strong> ({arac.plaka}) aracını silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-8">
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSilOnay(false)}>
                Vazgeç
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleSil}>
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
