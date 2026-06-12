import { useState, useCallback, useEffect } from 'react';
import { useAraclar } from '../contexts/AraclarContext';
import { useAuth } from '../contexts/AuthContext';

export default function Ayarlar() {
  const { araclar, tumVerileriSil } = useAraclar();
  const { email } = useAuth();
  const [bildirimSaati, setBildirimSaati] = useState('09:00');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [silOnay, setSilOnay] = useState(false);
  const [kaydedildi, setKaydedildi] = useState(false);
  const [tarayiciIzni, setTarayiciIzni] = useState<NotificationPermission | 'unsupported'>('default');

  // Şifre değiştirme
  const [sifre, setSifre] = useState('');
  const [sifreTekrar, setSifreTekrar] = useState('');
  const [sifreGoster, setSifreGoster] = useState(false);
  const [sifreDurum, setSifreDurum] = useState<'idle' | 'ok' | 'hata'>('idle');
  const [sifreHata, setSifreHata] = useState('');

  useEffect(() => {
    const savedSaat = localStorage.getItem('@caremind:bildirim_saat');
    if (savedSaat) setBildirimSaati(savedSaat);
    const savedEnabled = localStorage.getItem('@caremind:notificationsEnabled');
    setNotificationsEnabled(savedEnabled === null || savedEnabled === '1' || savedEnabled === 'true');
    if (!('Notification' in window)) {
      setTarayiciIzni('unsupported');
    } else {
      setTarayiciIzni(Notification.permission);
    }
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

  const handleBildirimIzniIste = useCallback(async () => {
    if (!('Notification' in window)) return;
    const izin = await Notification.requestPermission();
    setTarayiciIzni(izin);
  }, []);

  const handleSifreDegistir = useCallback(async () => {
    setSifreHata('');
    setSifreDurum('idle');
    if (sifre.length < 6) {
      setSifreHata('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (sifre !== sifreTekrar) {
      setSifreHata('Şifreler eşleşmiyor.');
      return;
    }
    // Hash hesapla ve kaydet
    const encoder = new TextEncoder();
    const data = encoder.encode(sifre + ':caremind-salt-2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem('@caremind:sifreHash', hash);
    setSifre('');
    setSifreTekrar('');
    setSifreDurum('ok');
    setTimeout(() => setSifreDurum('idle'), 2500);
  }, [sifre, sifreTekrar]);

  const [saatPart, dakikaPart] = (bildirimSaati && bildirimSaati.includes(':'))
    ? bildirimSaati.split(':')
    : ['09', '00'];

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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              className="form-input"
              style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}
              value={saatPart}
              onChange={e => handleSaatChange(`${e.target.value}:${dakikaPart}`)}
            >
              {Array.from({ length: 24 }, (_, i) => {
                const s = String(i).padStart(2, '0');
                return <option key={s} value={s}>{s}</option>;
              })}
            </select>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-secondary)' }}>:</span>
            <select
              className="form-input"
              style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}
              value={dakikaPart}
              onChange={e => handleSaatChange(`${saatPart}:${e.target.value}`)}
            >
              {Array.from({ length: 60 }, (_, i) => {
                const d = String(i).padStart(2, '0');
                return <option key={d} value={d}>{d}</option>;
              })}
            </select>
          </div>
          {kaydedildi && (
            <div className="text-green mt-8" style={{ fontSize: 13, fontWeight: 600 }}>
              ✓ Kaydedildi
            </div>
          )}
        </div>
      </div>

      {/* Browser Notification Permission */}
      {tarayiciIzni !== 'unsupported' && (
        <div className="card mt-24" style={{ borderColor: tarayiciIzni === 'granted' ? 'rgba(34,197,94,0.3)' : 'rgba(99,102,241,0.3)' }}>
          <div className="flex items-center gap-8 mb-16">
            <span style={{ fontSize: 20 }}>{tarayiciIzni === 'granted' ? '✅' : tarayiciIzni === 'denied' ? '🚫' : '🔔'}</span>
            <span style={{ fontWeight: 700 }}>Tarayıcı Bildirimleri</span>
          </div>
          <p className="text-secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>
            {tarayiciIzni === 'granted' && 'Tarayıcı bildirimleri aktif. Bildirimler sayfasından test gönderebilirsiniz.'}
            {tarayiciIzni === 'denied' && 'Bildirim izni reddedildi. Tarayıcı adres çubuğundaki ikon üzerinden etkinleştirin.'}
            {tarayiciIzni === 'default' && 'Araç tarihleriniz yaklaştığında tarayıcı bildirimi alın.'}
          </p>
          {tarayiciIzni === 'default' && (
            <button className="btn btn-primary btn-sm mt-16" onClick={handleBildirimIzniIste}>
              🔔 Bildirim İznini Etkinleştir
            </button>
          )}
        </div>
      )}

      {/* Şifre Değiştirme */}
      <div className="settings-block mt-24">
        <div className="settings-row-left mb-16">
          <span className="settings-row-icon">🔒</span>
          <span style={{ fontWeight: 700 }}>Şifre Değiştir</span>
        </div>
        {email && (
          <div className="text-secondary mb-16" style={{ fontSize: 13 }}>
            Hesap: <strong>{email}</strong>
          </div>
        )}
        <div className="login-input-wrap mb-8" style={{ position: 'relative' }}>
          <span className="icon">🔑</span>
          <input
            className="form-input"
            type={sifreGoster ? 'text' : 'password'}
            placeholder="Yeni şifre (en az 6 karakter)"
            value={sifre}
            onChange={e => { setSifre(e.target.value); setSifreHata(''); }}
            style={{ paddingLeft: 40 }}
          />
          <button
            type="button"
            onClick={() => setSifreGoster(!sifreGoster)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
          >{sifreGoster ? '🙈' : '👁️'}</button>
        </div>
        <div className="login-input-wrap mb-8">
          <span className="icon">🔑</span>
          <input
            className="form-input"
            type={sifreGoster ? 'text' : 'password'}
            placeholder="Şifre tekrar"
            value={sifreTekrar}
            onChange={e => { setSifreTekrar(e.target.value); setSifreHata(''); }}
            style={{ paddingLeft: 40 }}
          />
        </div>
        {sifreHata && <div className="form-error mb-8">{sifreHata}</div>}
        {sifreDurum === 'ok' && <div className="text-green mb-8" style={{ fontSize: 13, fontWeight: 600 }}>✓ Şifre güncellendi</div>}
        <button className="btn btn-primary btn-sm" onClick={handleSifreDegistir}>
          Şifreyi Güncelle
        </button>
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
