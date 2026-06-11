import { useState, useCallback, useEffect } from 'react';
import { useAraclar } from '../contexts/AraclarContext';

export default function Ayarlar() {
  const { araclar, tumVerileriSil } = useAraclar();
  const [bildirimSaati, setBildirimSaati] = useState('09:00');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [silOnay, setSilOnay] = useState(false);
  const [kaydedildi, setKaydedildi] = useState(false);

  useEffect(() => {
    const savedSaat = localStorage.getItem('@caremind:bildirim_saat');
    if (savedSaat) setBildirimSaati(savedSaat);
    const savedEnabled = localStorage.getItem('@caremind:notificationsEnabled');
    setNotificationsEnabled(savedEnabled === null || savedEnabled === '1' || savedEnabled === 'true');
  }, []);

  const handleSaatChange = useCallback((saat: string) => {
    setBildirimSaati(saat);
    localStorage.setItem('@caremind:bildirim_saat', saat);
    setKaydedildi(true);
    setTimeout(() => setKaydedildi(false), 2000);
  }, []);

  const toggleNotifications = useCallback((val: boolean) => {
    setNotificationsEnabled(val);
    localStorage.setItem('@caremind:notificationsEnabled', val ? '1' : '0');
  }, []);

  const handleClear = useCallback(async () => {
    await tumVerileriSil();
    setSilOnay(false);
  }, [tumVerileriSil]);

  return (
    <div className="animate-slideUp" style={{ maxWidth: 600 }}>
      <div className="page-header">
        <h1>Ayarlar</h1>
        <p>Tercihlerinizi yönetin.</p>
      </div>

      <div className="settings-block">
        {/* Notifications Toggle */}
        <div className="settings-row">
          <div className="settings-row-left">
            <span className="settings-row-icon">🔔</span>
            <span style={{ fontWeight: 600 }}>Bildirimleri Etkinleştir</span>
          </div>
          <button
            className={`toggle ${notificationsEnabled ? 'active' : ''}`}
            onClick={() => toggleNotifications(!notificationsEnabled)}
          />
        </div>

        <div className="settings-divider" />

        {/* Notification Time */}
        <div style={{ padding: '12px 0' }}>
          <div className="settings-row-left mb-16">
            <span className="settings-row-icon">🕐</span>
            <span style={{ fontWeight: 600 }}>Varsayılan Bildirim Saati</span>
          </div>
          <input
            className="form-input"
            type="time"
            value={bildirimSaati}
            onChange={e => handleSaatChange(e.target.value)}
          />
          {kaydedildi && (
            <div className="text-green mt-8" style={{ fontSize: 13, fontWeight: 600 }}>
              ✓ Kaydedildi
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="card mt-24" style={{ background: 'var(--color-accent-soft)', borderColor: 'rgba(99,102,241,0.2)' }}>
        <div className="flex items-center gap-8 mb-16">
          <span style={{ fontSize: 20 }}>ℹ️</span>
          <span style={{ fontWeight: 700 }}>Bilgi</span>
        </div>
        <p className="text-secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>
          Web tarayıcı bildirimleri için tarayıcınızın bildirim iznini açmanız gerekir.
          Mobil uygulamadaki bildirimler bu ayardan bağımsız olarak çalışır.
        </p>
        <div className="mt-16 text-secondary" style={{ fontSize: 13 }}>
          Kayıtlı araç: <strong className="text-accent">{araclar.length}</strong>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-24">
        <button className="btn btn-danger btn-full" onClick={() => setSilOnay(true)}>
          🗑️ Tüm Verileri Sil
        </button>
      </div>

      {/* Delete Confirmation */}
      {silOnay && (
        <div className="modal-overlay" onClick={() => setSilOnay(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Tüm Verileri Sil</h3>
              <button className="btn-icon" onClick={() => setSilOnay(false)}>✕</button>
            </div>
            <p className="text-secondary mb-24">
              Tüm araç verileri ve ayarlar silinecektir. Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-8">
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSilOnay(false)}>
                Vazgeç
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleClear}>
                Tümünü Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
