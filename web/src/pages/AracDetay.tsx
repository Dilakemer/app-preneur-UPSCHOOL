import { useParams, useNavigate } from 'react-router-dom';
import { useAraclar } from '../contexts/AraclarContext';
import { KATEGORI_BASLIKLARI, KATEGORI_IKONLARI, TARIH_KATEGORILERI } from '../types/Arac';
import { kalanGunHesapla, kalanGunMetni, tarihFormatla } from '../utils/tarihHesapla';
import { durumRengiBelirle, durumRengiCSS, durumRengiGlow } from '../utils/renkBelirle';
import { useState, useCallback, useRef, useEffect } from 'react';
import { aiTavsiyeAl as aiServis, sohbetMesajiGonder } from '../services/aiService';
import type { AIPromptTipi, SohbetMesaji } from '../services/aiService';

type AiMod = 'bos' | 'tavsiye' | 'sohbet';

export default function AracDetay() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { aracGetir, araciSil } = useAraclar();
  const arac = id ? aracGetir(id) : undefined;

  // Hızlı tavsiye state'leri
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiTip, setAiTip] = useState<AIPromptTipi>('tavsiye');

  // Sohbet state'leri
  const [aiMod, setAiMod] = useState<AiMod>('bos');
  const [sohbetGecmisi, setSohbetGecmisi] = useState<SohbetMesaji[]>([]);
  const [sohbetInput, setSohbetInput] = useState('');
  const [sohbetYukleniyor, setSohbetYukleniyor] = useState(false);

  const [silOnay, setSilOnay] = useState(false);
  const mesajSonuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Yeni mesaj gelince en alta scroll yap
  useEffect(() => {
    if (mesajSonuRef.current) {
      mesajSonuRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sohbetGecmisi, sohbetYukleniyor]);

  const email = localStorage.getItem('@caremind:kayitliEposta');

  // ── Hızlı tavsiye ──────────────────────────────────────────────────────────
  const aiTavsiyeAl = useCallback(async (tip: AIPromptTipi = 'tavsiye') => {
    if (!arac) return;
    setAiTip(tip);
    setAiMod('tavsiye');
    setAiLoading(true);
    setAiError(null);
    setAiContent(null);
    try {
      const sonuc = await aiServis(arac, tip, email);
      setAiContent(sonuc);
    } catch {
      setAiError('AI tavsiyesi alınırken beklenmedik bir hata oluştu.');
    } finally {
      setAiLoading(false);
    }
  }, [arac, email]);

  // ── Sohbet başlat ─────────────────────────────────────────────────────────
  const sohbetiBaslat = useCallback(() => {
    setSohbetGecmisi([]);
    setSohbetInput('');
    setAiContent(null);
    setAiError(null);
    setAiMod('sohbet');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // ── Sohbet sıfırla ────────────────────────────────────────────────────────
  const sohbetiSifirla = useCallback(() => {
    setSohbetGecmisi([]);
    setSohbetInput('');
    setAiMod('bos');
    setAiContent(null);
    setAiError(null);
  }, []);

  // ── Mesaj gönder ──────────────────────────────────────────────────────────
  const mesajGonder = useCallback(async () => {
    if (!arac || !sohbetInput.trim() || sohbetYukleniyor) return;

    const kullaniciMesaji = sohbetInput.trim();
    setSohbetInput('');

    const yeniGecmis: SohbetMesaji[] = [
      ...sohbetGecmisi,
      { rol: 'kullanici', icerik: kullaniciMesaji },
    ];
    setSohbetGecmisi(yeniGecmis);
    setSohbetYukleniyor(true);

    try {
      const yanit = await sohbetMesajiGonder(arac, sohbetGecmisi, kullaniciMesaji, email);
      setSohbetGecmisi([
        ...yeniGecmis,
        { rol: 'asistan', icerik: yanit },
      ]);
    } catch {
      setSohbetGecmisi([
        ...yeniGecmis,
        { rol: 'asistan', icerik: 'Bir hata oluştu, lütfen tekrar deneyin.' },
      ]);
    } finally {
      setSohbetYukleniyor(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [arac, sohbetInput, sohbetGecmisi, sohbetYukleniyor, email]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      mesajGonder();
    }
  };

  // ── Araç silme ────────────────────────────────────────────────────────────
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

      {/* ── AI Danışman Paneli ─────────────────────────────────────────────── */}
      <div className="ai-section">
        {/* Başlık */}
        <div className="ai-header">
          <div className="ai-icon">🤖</div>
          <div style={{ flex: 1 }}>
            <div className="ai-title">AI Danışman</div>
            <div className="text-secondary" style={{ fontSize: 13 }}>
              {aiMod === 'sohbet'
                ? `Gemini ile sohbet — ${sohbetGecmisi.length} mesaj`
                : 'Gemini AI ile araç bakım tavsiyeleri'}
            </div>
          </div>
          {aiMod !== 'bos' && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={sohbetiSifirla}
              style={{ fontSize: 12 }}
            >
              ✕ Kapat
            </button>
          )}
        </div>

        {/* ── MOD: BOŞ — başlangıç butonları ─────────────────────────────── */}
        {aiMod === 'bos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Hızlı analiz butonları */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
            {/* Sohbet başlat */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={sohbetiBaslat}
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
                border: '1px solid rgba(99,102,241,0.35)',
                color: '#a5b4fc',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              💬 Soru Sor / Sohbet Başlat
              <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 'auto' }}>
                Geçmişi hatırlar
              </span>
            </button>
          </div>
        )}

        {/* ── MOD: TAVSİYE — tekil yanıt ─────────────────────────────────── */}
        {aiMod === 'tavsiye' && (
          <>
            {aiLoading && (
              <div className="ai-loading">
                <span className="spinner" />
                Gemini düşünüyor...
              </div>
            )}

            {aiError && (
              <div style={{ color: 'var(--color-red)', fontSize: 14 }}>
                {aiError}
                <button className="btn btn-secondary btn-sm mt-8" onClick={() => aiTavsiyeAl(aiTip)}>
                  🔄 Tekrar Dene
                </button>
              </div>
            )}

            {aiContent && (
              <div className="ai-content">{aiContent}</div>
            )}

            {/* Alt butonlar */}
            {!aiLoading && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                <button className="btn btn-primary btn-sm" onClick={() => aiTavsiyeAl('tavsiye')}>
                  💡 Tavsiye
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => aiTavsiyeAl('ozet')}>
                  📋 Özet
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => aiTavsiyeAl('uyari')}>
                  ⚠️ Uyarılar
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={sohbetiBaslat}
                  style={{ color: '#a5b4fc', borderColor: 'rgba(99,102,241,0.35)' }}
                >
                  💬 Sohbet Başlat
                </button>
              </div>
            )}
          </>
        )}

        {/* ── MOD: SOHBET — chat arayüzü ──────────────────────────────────── */}
        {aiMod === 'sohbet' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Mesaj alanı */}
            <div
              style={{
                minHeight: sohbetGecmisi.length === 0 ? 80 : 220,
                maxHeight: 380,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                padding: '4px 0 12px',
              }}
            >
              {/* Boş başlangıç ipucu */}
              {sohbetGecmisi.length === 0 && !sohbetYukleniyor && (
                <div style={{
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
                  fontSize: 13,
                  padding: '16px 0',
                  lineHeight: 1.7,
                }}>
                  🤖 Aracınız hakkında istediğinizi sorun.<br />
                  <span style={{ fontSize: 12, opacity: 0.7 }}>
                    Bakım, sigorta, trafik, yakıt tüketimi, tamir önerileri…
                  </span>
                </div>
              )}

              {/* Mesaj baloncukları */}
              {sohbetGecmisi.map((mesaj, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: mesaj.rol === 'kullanici' ? 'flex-end' : 'flex-start',
                    gap: 8,
                    alignItems: 'flex-end',
                  }}
                >
                  {mesaj.rol === 'asistan' && (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, flexShrink: 0,
                    }}>
                      🤖
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '10px 14px',
                      borderRadius: mesaj.rol === 'kullanici'
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                      background: mesaj.rol === 'kullanici'
                        ? 'linear-gradient(135deg, var(--color-accent), #6366f1)'
                        : 'var(--color-surface)',
                      color: mesaj.rol === 'kullanici' ? '#fff' : 'var(--color-text)',
                      fontSize: 14,
                      lineHeight: 1.6,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      border: mesaj.rol === 'asistan'
                        ? '1px solid var(--color-border)'
                        : 'none',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {mesaj.icerik}
                  </div>
                </div>
              ))}

              {/* Yazıyor göstergesi */}
              {sohbetYukleniyor && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, flexShrink: 0,
                  }}>
                    🤖
                  </div>
                  <div style={{
                    padding: '10px 16px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    display: 'flex', gap: 4, alignItems: 'center',
                  }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: 'var(--color-accent)',
                          animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={mesajSonuRef} />
            </div>

            {/* Input alanı */}
            <div style={{
              display: 'flex', gap: 8, alignItems: 'flex-end',
              borderTop: '1px solid var(--color-border)',
              paddingTop: 12, marginTop: 4,
            }}>
              <textarea
                ref={inputRef}
                value={sohbetInput}
                onChange={(e) => setSohbetInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Sorunuzu yazın… (Enter = gönder, Shift+Enter = yeni satır)"
                rows={2}
                style={{
                  flex: 1,
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 12,
                  color: 'var(--color-text)',
                  fontSize: 14,
                  padding: '10px 14px',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: 1.5,
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-accent)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                }}
                disabled={sohbetYukleniyor}
              />
              <button
                onClick={mesajGonder}
                disabled={!sohbetInput.trim() || sohbetYukleniyor}
                className="btn btn-primary"
                style={{
                  padding: '10px 16px',
                  borderRadius: 12,
                  minWidth: 48,
                  fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {sohbetYukleniyor ? <span className="spinner" style={{ width: 18, height: 18 }} /> : '↑'}
              </button>
            </div>

            {/* Örnek sorular */}
            {sohbetGecmisi.length === 0 && (
              <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  'Ne zaman bakıma göndermeli?',
                  'Yakıt tüketimini azaltmak için?',
                  'Sigortamı yenilemeli miyim?',
                  'Bu marka için yaygın sorunlar neler?',
                ].map((soru) => (
                  <button
                    key={soru}
                    onClick={() => setSohbetInput(soru)}
                    style={{
                      background: 'rgba(99,102,241,0.1)',
                      border: '1px solid rgba(99,102,241,0.25)',
                      borderRadius: 20,
                      color: '#a5b4fc',
                      fontSize: 12,
                      padding: '4px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(99,102,241,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(99,102,241,0.1)';
                    }}
                  >
                    {soru}
                  </button>
                ))}
              </div>
            )}
          </div>
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
