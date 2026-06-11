import { useMemo, useState } from 'react';

type ScenarioKey = 'new' | 'owner' | 'insurance';
type DeviceKey = 'iphone' | 'android' | 'compact';
type ScreenKey = 'home' | 'add' | 'insurance' | 'ai';

const SCENARIOS: Record<ScenarioKey, { label: string; title: string; copy: string; initialScreen: ScreenKey }> = {
  new: {
    label: 'Yeni kullanici',
    title: 'Ilk araci ekleme akisi',
    copy: 'Kullanici daha hesapta arac yokken CareMind ile neleri takip edecegini ve AI danismana nasil ulasacagini gorur.',
    initialScreen: 'home',
  },
  owner: {
    label: 'Arac sahibi',
    title: 'Tarih takip paneli',
    copy: 'Kayitli arac uzerinden muayene, sigorta, kasko ve bakim tarihleri tek ekranda taranabilir.',
    initialScreen: 'home',
  },
  insurance: {
    label: 'Sigorta zamani',
    title: 'Teklif karsilastirma',
    copy: 'Sigorta yenileme doneminde tahmini/canli teklif akisi ve yonlendirme deneyimi one cikar.',
    initialScreen: 'insurance',
  },
};

const DEVICES: Record<DeviceKey, { label: string; className: string }> = {
  iphone: { label: 'iPhone', className: 'device-iphone' },
  android: { label: 'Android', className: 'device-android' },
  compact: { label: 'Kompakt', className: 'device-compact' },
};

const SCREEN_LABELS: Record<ScreenKey, string> = {
  home: 'Ana ekran',
  add: 'Arac ekle',
  insurance: 'Sigorta',
  ai: 'AI danisman',
};

const insuranceOffers = [
  { name: 'Quick Sigorta', price: '11.850 TL', tag: 'Ekonomik' },
  { name: 'Aksigorta', price: '12.900 TL', tag: 'Dengeli' },
  { name: 'Anadolu Sigorta', price: '14.250 TL', tag: 'Kapsamli' },
];

function PhoneHeader() {
  return (
    <div className="phone-status">
      <span>09:41</span>
      <span className="phone-status-icons">LTE 86%</span>
    </div>
  );
}

function HomeScreen({ scenario, onScreenChange }: { scenario: ScenarioKey; onScreenChange: (screen: ScreenKey) => void }) {
  const hasVehicle = scenario !== 'new';

  return (
    <div className="phone-screen-content">
      <div className="phone-title-row">
        <div>
          <span className="phone-kicker">CareMind</span>
          <h3>{hasVehicle ? 'Araclarim' : 'Baslayalim'}</h3>
        </div>
        <button className="phone-icon-btn" onClick={() => onScreenChange('ai')} aria-label="AI danismani ac">
          AI
        </button>
      </div>

      {hasVehicle ? (
        <>
          <div className="phone-summary-card">
            <div>
              <span className="phone-muted">Aktif takip</span>
              <strong>1 arac</strong>
            </div>
            <div>
              <span className="phone-muted">Yaklasan</span>
              <strong>12 gun</strong>
            </div>
          </div>

          <button className="phone-vehicle-card" onClick={() => onScreenChange('insurance')}>
            <div className="phone-plate">34 CM 2026</div>
            <div className="phone-vehicle-name">Toyota Corolla</div>
            <div className="phone-date-line">
              <span>Sigorta</span>
              <strong>12 gun kaldi</strong>
            </div>
          </button>

          <div className="phone-date-grid">
            <div>
              <span>Muayene</span>
              <strong>18.07.2026</strong>
            </div>
            <div>
              <span>Bakim</span>
              <strong>4.000 km</strong>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="phone-empty">
            <div className="phone-empty-icon">+</div>
            <strong>Ilk aracinizi ekleyin</strong>
            <span>Muayene, sigorta, kasko ve bakim tarihleri ayni panoda toplansin.</span>
          </div>
          <button className="phone-primary" onClick={() => onScreenChange('add')}>
            Arac ekle
          </button>
          <button className="phone-secondary" onClick={() => onScreenChange('ai')}>
            AI danismana sor
          </button>
        </>
      )}
    </div>
  );
}

function AddVehicleScreen({ onScreenChange }: { onScreenChange: (screen: ScreenKey) => void }) {
  return (
    <div className="phone-screen-content">
      <div className="phone-title-row">
        <div>
          <span className="phone-kicker">Yeni kayit</span>
          <h3>Arac ekle</h3>
        </div>
      </div>

      <div className="phone-form">
        <label>
          Plaka
          <span>34 CM 2026</span>
        </label>
        <label>
          Marka
          <span>Toyota</span>
        </label>
        <label>
          Model
          <span>Corolla</span>
        </label>
        <label>
          Sigorta tarihi
          <span>23.06.2026</span>
        </label>
      </div>

      <div className="phone-note">
        Kaydedince bildirim planlama ve AI yorumlari arac verisine gore kisilesir.
      </div>
      <button className="phone-primary" onClick={() => onScreenChange('home')}>
        Demo kaydi olustur
      </button>
    </div>
  );
}

function InsuranceScreen({ onScreenChange }: { onScreenChange: (screen: ScreenKey) => void }) {
  return (
    <div className="phone-screen-content">
      <div className="phone-title-row">
        <div>
          <span className="phone-kicker">34 CM 2026</span>
          <h3>Sigorta teklifleri</h3>
        </div>
        <span className="phone-live-pill">Tahmini</span>
      </div>

      <div className="phone-offer-summary">
        <span>En iyi baslangic</span>
        <strong>11.850 TL</strong>
        <small>Kesin police bedeli teklif sayfasinda hesaplanir.</small>
      </div>

      <div className="phone-offer-list">
        {insuranceOffers.map((offer) => (
          <button key={offer.name} className="phone-offer" onClick={() => onScreenChange('ai')}>
            <div>
              <strong>{offer.name}</strong>
              <span>{offer.tag}</span>
            </div>
            <div className="phone-offer-price">{offer.price}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function AiScreen({ scenario }: { scenario: ScenarioKey }) {
  const answer =
    scenario === 'new'
      ? 'Arac eklemeden once takip edecegin ana basliklar: muayene, trafik sigortasi, kasko ve periyodik bakim. Araci ekleyince tarihleri senin icin onceliklendiririm.'
      : 'Sigortan 12 gun icinde yenilenmeli. Once teklifleri karsilastir, sonra muayene tarihini kontrol et. Bakim icin kilometre bilgisini de guncel tutmani oneririm.';

  return (
    <div className="phone-screen-content">
      <div className="phone-title-row">
        <div>
          <span className="phone-kicker">AI destek</span>
          <h3>Danisman</h3>
        </div>
      </div>

      <div className="phone-chat">
        <div className="phone-message user">Sigorta ve bakim icin nereden baslamaliyim?</div>
        <div className="phone-message bot">{answer}</div>
      </div>

      <div className="phone-quick-actions">
        <button>Risk</button>
        <button>Ozetle</button>
        <button>Bakim</button>
      </div>
    </div>
  );
}

export default function MobilDemo() {
  const [scenario, setScenario] = useState<ScenarioKey>('new');
  const [device, setDevice] = useState<DeviceKey>('iphone');
  const [screen, setScreen] = useState<ScreenKey>('home');

  const selectedScenario = SCENARIOS[scenario];
  const selectedDevice = DEVICES[device];

  const activeScreen = useMemo(() => {
    if (screen === 'add') return <AddVehicleScreen onScreenChange={setScreen} />;
    if (screen === 'insurance') return <InsuranceScreen onScreenChange={setScreen} />;
    if (screen === 'ai') return <AiScreen scenario={scenario} />;
    return <HomeScreen scenario={scenario} onScreenChange={setScreen} />;
  }, [scenario, screen]);

  const handleScenarioChange = (key: ScenarioKey) => {
    setScenario(key);
    setScreen(SCENARIOS[key].initialScreen);
  };

  return (
    <div className="mobile-demo-page animate-slideUp">
      <div className="page-header">
        <h1>Mobil deneyim simulasyonu</h1>
        <p>CareMind mobil akislarini web uzerinde telefon boyutunda deneyin.</p>
      </div>

      <section className="demo-workbench">
        <div className="demo-control-panel">
          <div>
            <span className="demo-eyebrow">Demo modu</span>
            <h2>{selectedScenario.title}</h2>
            <p>{selectedScenario.copy}</p>
          </div>

          <div className="demo-control-group">
            <span>Senaryo</span>
            <div className="demo-segmented">
              {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => (
                <button
                  key={key}
                  className={scenario === key ? 'active' : ''}
                  onClick={() => handleScenarioChange(key)}
                >
                  {SCENARIOS[key].label}
                </button>
              ))}
            </div>
          </div>

          <div className="demo-control-group">
            <span>Ekran</span>
            <div className="demo-screen-grid">
              {(Object.keys(SCREEN_LABELS) as ScreenKey[]).map((key) => (
                <button key={key} className={screen === key ? 'active' : ''} onClick={() => setScreen(key)}>
                  {SCREEN_LABELS[key]}
                </button>
              ))}
            </div>
          </div>

          <div className="demo-control-group">
            <span>Cihaz boyutu</span>
            <div className="demo-segmented">
              {(Object.keys(DEVICES) as DeviceKey[]).map((key) => (
                <button key={key} className={device === key ? 'active' : ''} onClick={() => setDevice(key)}>
                  {DEVICES[key].label}
                </button>
              ))}
            </div>
          </div>

          <div className="demo-insight">
            <strong>Not</strong>
            <span>
              Bu alan backend kaydi olusturmaz; satis, destek ve test gorusmelerinde mobil deneyimi guvenli sekilde
              gostermek icin mock veri kullanir.
            </span>
          </div>
        </div>

        <div className="phone-stage">
          <div className={`phone-frame ${selectedDevice.className}`}>
            <div className="phone-speaker" />
            <PhoneHeader />
            <div className="phone-app-shell">
              {activeScreen}
              <nav className="phone-tabbar">
                {(Object.keys(SCREEN_LABELS) as ScreenKey[]).map((key) => (
                  <button key={key} className={screen === key ? 'active' : ''} onClick={() => setScreen(key)}>
                    <span>{key === 'home' ? 'H' : key === 'add' ? '+' : key === 'insurance' ? 'S' : 'AI'}</span>
                    {SCREEN_LABELS[key].split(' ')[0]}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
