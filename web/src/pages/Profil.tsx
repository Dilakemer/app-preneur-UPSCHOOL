import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAraclar } from '../contexts/AraclarContext';
import { useMemo } from 'react';

export default function Profil() {
  const { isLoggedIn, kullaniciAdi, email, cikisYap, isimGuncelle } = useAuth();
  const { araclar } = useAraclar();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [yeniIsim, setYeniIsim] = useState(kullaniciAdi);

  const aracSayisi = araclar.length;
  const careScore = useMemo(() => (aracSayisi > 0 ? Math.min(100, 70 + aracSayisi * 10) : 0), [aracSayisi]);

  const handleSaveIsim = async () => {
    await isimGuncelle(yeniIsim);
    setEditMode(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <div className="empty-state-icon">🔑</div>
        <h3>Giriş Yapın</h3>
        <p>Profil bilgilerinizi görüntülemek ve araçlarınızı yönetmek için giriş yapın.</p>
        <button className="btn btn-primary" onClick={() => navigate('/giris')}>
          Giriş Yap
        </button>
      </div>
    );
  }

  return (
    <div className="animate-slideUp" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Profil</h1>
        <p>Hesap bilgilerinizi yönetin.</p>
      </div>

      {/* Avatar & Info */}
      <div className="profile-header">
        <div className="profile-avatar">
          {kullaniciAdi.charAt(0).toUpperCase()}
          <div className="profile-avatar-badge">⭐</div>
        </div>

        {editMode ? (
          <div className="flex items-center gap-8 mt-8">
            <input
              className="form-input"
              value={yeniIsim}
              onChange={e => setYeniIsim(e.target.value)}
              autoFocus
              style={{ textAlign: 'center', maxWidth: 240 }}
            />
            <button className="btn btn-primary btn-sm" onClick={handleSaveIsim}>✓</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(false)}>✕</button>
          </div>
        ) : (
          <div className="profile-name" onClick={() => setEditMode(true)} style={{ cursor: 'pointer' }}>
            {kullaniciAdi}
            <span style={{ fontSize: 16, color: 'var(--color-accent)' }}>✏️</span>
          </div>
        )}

        <div className="profile-role">Premium Üye</div>
        {email && <div className="text-secondary mt-4" style={{ fontSize: 13 }}>{email}</div>}
      </div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="profile-stat">
          <div className="profile-stat-value">{aracSayisi}</div>
          <div className="profile-stat-label">Kayıtlı Araç</div>
        </div>
        <div className="profile-stat-divider" />
        <div className="profile-stat">
          <div className="profile-stat-value" style={{ color: 'var(--color-yellow)' }}>{careScore}</div>
          <div className="profile-stat-label">Care Puanı</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="mt-24">
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Başarımlar</h3>
        <div className="flex flex-col gap-8">
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'var(--color-green-glow)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 24
            }}>🛡️</div>
            <div>
              <div style={{ fontWeight: 700 }}>Güvenli Sürücü</div>
              <div className="text-secondary" style={{ fontSize: 13 }}>Takip edilen tarihlerin tek panelde.</div>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'var(--color-accent-soft)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 24
            }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700 }}>AI Hazır</div>
              <div className="text-secondary" style={{ fontSize: 13 }}>Araç detayından danışman tavsiyesi alabilirsin.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-24 flex flex-col gap-8">
        <button className="btn btn-primary btn-full" onClick={() => navigate('/sigorta')}>
          📊 Sigorta Fiyatlarını Karşılaştır
        </button>
        <button
          className="btn btn-secondary btn-full"
          onClick={() => window.open('mailto:support@caremind.app?subject=CareMind%20Destek', '_blank')}
        >
          ❓ Destek Al
        </button>
        <button className="btn btn-danger btn-full" onClick={cikisYap}>
          🚪 Çıkış Yap
        </button>
      </div>
    </div>
  );
}
