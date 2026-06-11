import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TOUR_KEY_PREFIX = '@caremind:onboardingTourSeen';

const STEPS = [
  {
    icon: 'A',
    title: 'Araclarini ekle',
    text: 'Plaka, model ve takip tarihlerini tek kayitta topla. Kayitlar hesabina bagli tutulur.',
  },
  {
    icon: 'T',
    title: 'Tarihleri izle',
    text: 'Muayene, sigorta, kasko ve bakim icin kalan gunleri panelden takip et.',
  },
  {
    icon: 'AI',
    title: 'Danismana sor',
    text: 'Arac detayinda ozet, uyari ve bakim tavsiyesi al. Kritik tarihleri oncele.',
  },
  {
    icon: 'S',
    title: 'Sigortayi karsilastir',
    text: 'Kayitli araca gore tahmini teklifleri tara ve yenileme doneminde hizli aksiyon al.',
  },
];

export default function OnboardingTour() {
  const { isLoggedIn, email, kullaniciAdi } = useAuth();
  const [aktif, setAktif] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const tourKey = useMemo(
    () => `${TOUR_KEY_PREFIX}:${email || 'guest'}`,
    [email],
  );

  useEffect(() => {
    if (!isLoggedIn) {
      setAktif(false);
      return;
    }

    setAktif(localStorage.getItem(tourKey) !== 'true');
    setStepIndex(0);
  }, [isLoggedIn, tourKey]);

  const kapat = () => {
    localStorage.setItem(tourKey, 'true');
    setAktif(false);
  };

  if (!aktif) return null;

  const step = STEPS[stepIndex];
  const sonAdim = stepIndex === STEPS.length - 1;

  return (
    <div className="tour-overlay" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <div className="tour-panel">
        <div className="tour-top">
          <div className="tour-eyebrow">Hos geldin, {kullaniciAdi}</div>
          <button className="btn-icon" onClick={kapat} aria-label="Turu kapat">x</button>
        </div>

        <div className="tour-step-icon">{step.icon}</div>
        <h2 id="tour-title">{step.title}</h2>
        <p>{step.text}</p>

        <div className="tour-progress" aria-label={`Adim ${stepIndex + 1} / ${STEPS.length}`}>
          {STEPS.map((item, index) => (
            <span
              key={item.title}
              className={index === stepIndex ? 'active' : ''}
            />
          ))}
        </div>

        <div className="tour-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setStepIndex((onceki) => Math.max(onceki - 1, 0))}
            disabled={stepIndex === 0}
          >
            Geri
          </button>
          <button
            className="btn btn-primary"
            onClick={() => sonAdim ? kapat() : setStepIndex((onceki) => onceki + 1)}
          >
            {sonAdim ? 'Basla' : 'Devam'}
          </button>
        </div>
      </div>
    </div>
  );
}
