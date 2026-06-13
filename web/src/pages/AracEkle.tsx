import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TarihSecici } from '../components/TarihSecici';
import { useAraclar } from '../contexts/AraclarContext';
import { VARSAYILAN_BILDIRIMLER } from '../types/Arac';


const MAX_YEAR = new Date().getFullYear();

// Türkiye'de popüler araç markaları ve modelleri
const ARAC_MARKALARI: Record<string, string[]> = {
  'Toyota': ['Corolla', 'Yaris', 'C-HR', 'RAV4', 'Camry', 'Hilux', 'Land Cruiser', 'Avensis', 'Verso', 'Auris'],
  'Volkswagen': ['Golf', 'Polo', 'Passat', 'Tiguan', 'T-Roc', 'Caddy', 'Transporter', 'Touareg', 'Arteon', 'ID.4'],
  'Renault': ['Clio', 'Megane', 'Symbol', 'Fluence', 'Kadjar', 'Captur', 'Duster', 'Talisman', 'Zoe', 'Arkana'],
  'Ford': ['Focus', 'Fiesta', 'Mondeo', 'Kuga', 'EcoSport', 'Puma', 'Mustang', 'Explorer', 'Transit', 'Ranger'],
  'Hyundai': ['i10', 'i20', 'i30', 'Elantra', 'Tucson', 'Santa Fe', 'Kona', 'Accent', 'Ioniq', 'Bayon'],
  'Fiat': ['Egea', 'Tipo', 'Punto', 'Linea', 'Doblo', 'Fiorino', 'Ducato', '500', 'Panda', 'Bravo'],
  'Honda': ['Civic', 'Jazz', 'CR-V', 'HR-V', 'Accord', 'City', 'FR-V', 'Insight', 'e', 'ZR-V'],
  'Mercedes-Benz': ['A Serisi', 'B Serisi', 'C Serisi', 'E Serisi', 'S Serisi', 'GLA', 'GLC', 'GLE', 'GLB', 'CLA'],
  'BMW': ['1 Serisi', '2 Serisi', '3 Serisi', '4 Serisi', '5 Serisi', '7 Serisi', 'X1', 'X3', 'X5', 'X7'],
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'Q2', 'Q3', 'Q5', 'Q7', 'A8'],
  'Peugeot': ['208', '308', '508', '2008', '3008', '5008', 'Partner', 'Expert', 'Traveller', 'e-208'],
  'Citroën': ['C3', 'C4', 'C5', 'C5 Aircross', 'C3 Aircross', 'Berlingo', 'Jumpy', 'Jumper', 'ë-C4', 'C4 X'],
  'Opel': ['Astra', 'Corsa', 'Insignia', 'Mokka', 'Crossland', 'Grandland', 'Zafira', 'Combo', 'Vivaro', 'Adam'],
  'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Navara', 'Pulsar', 'Note', 'Leaf', 'Ariya', 'Townstar'],
  'Skoda': ['Fabia', 'Octavia', 'Superb', 'Karoq', 'Kodiaq', 'Scala', 'Kamiq', 'Enyaq', 'Rapid', 'Roomster'],
  'Seat': ['Ibiza', 'Leon', 'Ateca', 'Arona', 'Tarraco', 'Mii', 'Alhambra', 'Altea', 'Toledo', 'Exeo'],
  'Kia': ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Sorento', 'Niro', 'Stonic', 'XCeed', 'EV6', 'Stinger'],
  'Mazda': ['2', '3', '6', 'CX-3', 'CX-5', 'CX-30', 'MX-5', 'CX-60', 'CX-9', 'MX-30'],
  'Volvo': ['V40', 'V60', 'V90', 'S60', 'S90', 'XC40', 'XC60', 'XC90', 'C40', 'EX30'],
  'Subaru': ['Impreza', 'Forester', 'Outback', 'Legacy', 'XV', 'WRX', 'BRZ', 'Levorg', 'Ascent', 'Solterra'],
  'Suzuki': ['Swift', 'Vitara', 'S-Cross', 'Jimny', 'Ignis', 'Baleno', 'Across', 'Swace', 'Celerio', 'Alto'],
  'Mitsubishi': ['Colt', 'Lancer', 'Outlander', 'Eclipse Cross', 'ASX', 'L200', 'Pajero', 'Space Star', 'Mirage', 'Galant'],
  'Chevrolet': ['Aveo', 'Cruze', 'Spark', 'Captiva', 'Equinox', 'Malibu', 'Camaro', 'Corvette', 'Trax', 'Blazer'],
  'Dacia': ['Sandero', 'Logan', 'Duster', 'Spring', 'Jogger', 'Lodgy', 'Dokker', 'Stepway', 'Pick-Up', 'Nova'],
  'Alfa Romeo': ['Giulietta', 'Giulia', 'Stelvio', 'Tonale', '147', '156', '159', 'MiTo', '4C', 'Spider'],
  'Diğer': [],
};

export default function AracEkle() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { aracGetir, araciEkle, araciGuncelle } = useAraclar();
  const mevcutArac = id ? aracGetir(id) : undefined;
  const mode = mevcutArac ? 'edit' : 'create';

  const [plaka, setPlaka] = useState('');
  const [markaSecim, setMarkaSecim] = useState(''); // dropdown seçimi
  const [markaOzel, setMarkaOzel] = useState('');  // "Diğer" için serbest metin
  const [modelSecim, setModelSecim] = useState(''); // dropdown seçimi
  const [modelOzel, setModelOzel] = useState('');  // "Diğer" için serbest metin
  const [yil, setYil] = useState('');
  const [muayeneTarihi, setMuayeneTarihi] = useState('');
  const [sigortaTarihi, setSigortaTarihi] = useState('');
  const [kaskoTarihi, setKaskoTarihi] = useState('');
  const [bakimTarihi, setBakimTarihi] = useState('');
  const [gun60, setGun60] = useState(true);
  const [gun30, setGun30] = useState(true);
  const [gun7, setGun7] = useState(true);
  const [gun1, setGun1] = useState(true);
  const [bildirimSaati, setBildirimSaati] = useState('09:00');
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  // Hesaplanan marka/model değerleri
  const marka = markaSecim === 'Diğer' ? markaOzel : markaSecim;
  const model = modelSecim === 'Diğer' ? modelOzel : modelSecim;
  const mevcutMarkaModelleri = markaSecim && markaSecim !== 'Diğer' ? ARAC_MARKALARI[markaSecim] ?? [] : [];

  useEffect(() => {
    if (!mevcutArac) return;
    setPlaka(mevcutArac.plaka);

    // Marka: listede var mı kontrol et
    const mevcutMarka = mevcutArac.marka || '';
    if (mevcutMarka && ARAC_MARKALARI[mevcutMarka] !== undefined) {
      setMarkaSecim(mevcutMarka);
    } else if (mevcutMarka) {
      setMarkaSecim('Diğer');
      setMarkaOzel(mevcutMarka);
    }

    // Model: marka modellerinde var mı kontrol et
    const mevcutModel = mevcutArac.model || '';
    const markaModelleri = mevcutMarka ? (ARAC_MARKALARI[mevcutMarka] ?? []) : [];
    if (mevcutModel && markaModelleri.includes(mevcutModel)) {
      setModelSecim(mevcutModel);
    } else if (mevcutModel) {
      setModelSecim('Diğer');
      setModelOzel(mevcutModel);
    }

    setYil(String(mevcutArac.yil));
    setMuayeneTarihi(mevcutArac.muayeneTarihi || '');
    setSigortaTarihi(mevcutArac.sigortaTarihi || '');
    setKaskoTarihi(mevcutArac.kaskoTarihi || '');
    setBakimTarihi(mevcutArac.bakimTarihi || '');
    setGun60(mevcutArac.bildirimler.gun60);
    setGun30(mevcutArac.bildirimler.gun30);
    setGun7(mevcutArac.bildirimler.gun7);
    setGun1(mevcutArac.bildirimler.gun1);
    setBildirimSaati(mevcutArac.bildirimler.saat);
  }, [mevcutArac]);

  const yilDegeri = Number(yil);
  const plakaHatasi = !plaka.trim() ? 'Plaka alanı boş bırakılamaz' : null;
  const yilHatasi =
    !/^\d{4}$/.test(yil) || yilDegeri < 1980 || yilDegeri > MAX_YEAR
      ? `Geçerli bir yıl girin (1980-${MAX_YEAR})`
      : null;
  const formGecerli = !plakaHatasi && !yilHatasi;

  const hicTarihYok = !muayeneTarihi && !sigortaTarihi && !kaskoTarihi && !bakimTarihi;

  const handleKaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGecerli) return;
    setKaydediliyor(true);
    setHata(null);

    const payload = {
      plaka: plaka.trim().toUpperCase(),
      marka: marka.trim(),
      model: model.trim(),
      yil: yilDegeri,
      muayeneTarihi: muayeneTarihi || null,
      sigortaTarihi: sigortaTarihi || null,
      kaskoTarihi: kaskoTarihi || null,
      bakimTarihi: bakimTarihi || null,
      bildirimler: {
        gun60, gun30, gun7, gun1,
        saat: bildirimSaati || VARSAYILAN_BILDIRIMLER.saat,
      },
    };

    try {
      if (mode === 'create') {
        await araciEkle(payload);
        navigate('/');
      } else if (mevcutArac) {
        await araciGuncelle({
          ...mevcutArac,
          ...payload,
        });
        navigate(`/arac/${mevcutArac.id}`);
      }
    } catch (error) {
      setHata(error instanceof Error ? error.message : 'Bir hata oluştu.');
    } finally {
      setKaydediliyor(false);
    }
  };

  const [saatPart, dakikaPart] = (bildirimSaati && bildirimSaati.includes(':'))
    ? bildirimSaati.split(':')
    : ['09', '00'];

  return (
    <div className="animate-slideUp" style={{ maxWidth: 680 }}>
      <div className="flex justify-between items-center mb-24">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
          ← Geri
        </button>
      </div>

      <div className="page-header">
        <h1>{mode === 'create' ? 'Yeni Araç Ekle' : 'Aracı Düzenle'}</h1>
        <p>Araç bilgilerini ve takip tarihlerini girin.</p>
      </div>

      <form onSubmit={handleKaydet} className="flex flex-col gap-16">
        {/* Basic Info */}
        <div className="form-section">
          <div className="form-section-title">Temel Bilgiler</div>

          <div className="form-group">
            <label className="form-label">Plaka *</label>
            <input
              className="form-input"
              value={plaka}
              onChange={e => setPlaka(e.target.value.toUpperCase())}
              placeholder="34ABC123"
              maxLength={9}
            />
            {plakaHatasi && plaka && <span className="form-error">{plakaHatasi}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Marka</label>
              <select
                className="form-input"
                value={markaSecim}
                onChange={e => {
                  setMarkaSecim(e.target.value);
                  setMarkaOzel('');
                  setModelSecim('');
                  setModelOzel('');
                }}
                style={{ cursor: 'pointer' }}
              >
                <option value="">— Marka seçin —</option>
                {Object.keys(ARAC_MARKALARI).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {markaSecim === 'Diğer' && (
                <input
                  className="form-input"
                  style={{ marginTop: 8 }}
                  value={markaOzel}
                  onChange={e => setMarkaOzel(e.target.value)}
                  placeholder="Marka adını yazın"
                />
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Model</label>
              {markaSecim && markaSecim !== 'Diğer' && mevcutMarkaModelleri.length > 0 ? (
                <>
                  <select
                    className="form-input"
                    value={modelSecim}
                    onChange={e => {
                      setModelSecim(e.target.value);
                      setModelOzel('');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">— Model seçin —</option>
                    {mevcutMarkaModelleri.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="Diğer">Diğer…</option>
                  </select>
                  {modelSecim === 'Diğer' && (
                    <input
                      className="form-input"
                      style={{ marginTop: 8 }}
                      value={modelOzel}
                      onChange={e => setModelOzel(e.target.value)}
                      placeholder="Model adını yazın"
                    />
                  )}
                </>
              ) : (
                <input
                  className="form-input"
                  value={markaSecim === 'Diğer' ? modelOzel : model}
                  onChange={e => markaSecim === 'Diğer' ? setModelOzel(e.target.value) : setModelOzel(e.target.value)}
                  placeholder={markaSecim ? 'Model adını yazın' : 'Önce marka seçin'}
                  disabled={!markaSecim}
                  style={{ opacity: !markaSecim ? 0.5 : 1 }}
                />
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Yıl *</label>
            <input
              className="form-input"
              type="number"
              value={yil}
              onChange={e => setYil(e.target.value)}
              placeholder={String(MAX_YEAR)}
              min={1980}
              max={MAX_YEAR}
            />
            {yilHatasi && yil && <span className="form-error">{yilHatasi}</span>}
          </div>
        </div>

        {/* Dates */}
        <div className="form-section">
          <div className="form-section-title">📅 Tarihler</div>

          <div className="form-row">
            <div className="form-group">
              <TarihSecici label="Muayene Tarihi" value={muayeneTarihi} onChange={setMuayeneTarihi} />
            </div>
            <div className="form-group">
              <TarihSecici label="Sigorta Tarihi" value={sigortaTarihi} onChange={setSigortaTarihi} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <TarihSecici label="Kasko Tarihi" value={kaskoTarihi} onChange={setKaskoTarihi} />
            </div>
            <div className="form-group">
              <TarihSecici label="Bakım Tarihi" value={bakimTarihi} onChange={setBakimTarihi} />
            </div>
          </div>

          {hicTarihYok && (
            <div style={{
              display: 'flex', gap: 10, background: 'var(--color-yellow-glow)',
              borderRadius: 16, padding: 14, border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              <span>⚠️</span>
              <span style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5 }}>
                Tarih eklemek zorunlu değil ama hatırlatıcı değerini açmak için en az bir tarih girmek iyi olur.
              </span>
            </div>
          )}
        </div>

        {/* Notification Preferences */}
        <div className="form-section">
          <div className="form-section-title">🔔 Bildirim Tercihleri</div>

          {([
            ['60 gün kala', gun60, setGun60],
            ['30 gün kala', gun30, setGun30],
            ['7 gün kala', gun7, setGun7],
            ['1 gün kala', gun1, setGun1],
          ] as [string, boolean, (v: boolean) => void][]).map(([label, value, setter]) => (
            <div className="toggle-row" key={label}>
              <span className="toggle-label">{label}</span>
              <button
                type="button"
                className={`toggle ${value ? 'active' : ''}`}
                onClick={() => setter(!value)}
              />
            </div>
          ))}

          <div className="form-group mt-8">
            <label className="form-label">Bildirim Saati</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select
                className="form-input"
                style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}
                value={saatPart}
                onChange={e => setBildirimSaati(`${e.target.value}:${dakikaPart}`)}
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
                onChange={e => setBildirimSaati(`${saatPart}:${e.target.value}`)}
              >
                {Array.from({ length: 60 }, (_, i) => {
                  const d = String(i).padStart(2, '0');
                  return <option key={d} value={d}>{d}</option>;
                })}
              </select>
            </div>
          </div>
        </div>

        {hata && <p className="form-error">{hata}</p>}

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={!formGecerli || kaydediliyor}
        >
          {kaydediliyor ? (
            <span className="spinner" />
          ) : mode === 'create' ? '✓ Kaydet' : '✓ Güncelle'}
        </button>
      </form>
    </div>
  );
}
