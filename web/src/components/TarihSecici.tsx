import { useEffect, useMemo, useRef, useState } from 'react';

interface TarihSeciciProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  clearable?: boolean;
}

const AY_ADLARI = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

const HAFTA_GUNLERI = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pa'];

const bugun = () => {
  const simdi = new Date();
  return new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate());
};

const tarihiStringeCevir = (date: Date) => {
  const yil = date.getFullYear();
  const ay = String(date.getMonth() + 1).padStart(2, '0');
  const gun = String(date.getDate()).padStart(2, '0');
  return `${yil}-${ay}-${gun}`;
};

const stringiTariheCevir = (value: string) => {
  const [yil, ay, gun] = value.split('-').map(Number);
  if (!yil || !ay || !gun) return null;

  const date = new Date(yil, ay - 1, gun);
  if (Number.isNaN(date.getTime())) return null;

  return date;
};

const gosterilecekTarih = (value: string) => {
  const date = stringiTariheCevir(value);
  if (!date) return '';

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const ayniGunMu = (ilk: Date, ikinci: Date) =>
  ilk.getFullYear() === ikinci.getFullYear() &&
  ilk.getMonth() === ikinci.getMonth() &&
  ilk.getDate() === ikinci.getDate();

const ayGridiniOlustur = (gorunenAy: Date) => {
  const ayBaslangici = new Date(gorunenAy.getFullYear(), gorunenAy.getMonth(), 1);
  const pazartesiBazliGun = (ayBaslangici.getDay() + 6) % 7;
  const gridBaslangici = new Date(ayBaslangici);
  gridBaslangici.setDate(ayBaslangici.getDate() - pazartesiBazliGun);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridBaslangici);
    date.setDate(gridBaslangici.getDate() + index);
    return date;
  });
};

export function TarihSecici({
  label,
  value,
  onChange,
  placeholder = 'Tarih seç',
  clearable = true,
}: TarihSeciciProps) {
  const seciliTarih = useMemo(() => stringiTariheCevir(value), [value]);
  const [acik, setAcik] = useState(false);
  const [gorunenAy, setGorunenAy] = useState(() => seciliTarih ?? bugun());
  const kapsayiciRef = useRef<HTMLDivElement | null>(null);
  const bugununTarihi = useMemo(() => bugun(), []);

  useEffect(() => {
    if (seciliTarih) {
      setGorunenAy(seciliTarih);
    }
  }, [seciliTarih]);

  useEffect(() => {
    if (!acik) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!kapsayiciRef.current?.contains(event.target as Node)) {
        setAcik(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAcik(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [acik]);

  const ayGunleri = useMemo(() => ayGridiniOlustur(gorunenAy), [gorunenAy]);

  const ayDegistir = (fark: number) => {
    setGorunenAy((mevcut) => new Date(mevcut.getFullYear(), mevcut.getMonth() + fark, 1));
  };

  const tarihSec = (date: Date) => {
    onChange(tarihiStringeCevir(date));
    setAcik(false);
  };

  const bugunuSec = () => {
    const date = bugun();
    setGorunenAy(date);
    tarihSec(date);
  };

  const temizle = () => {
    onChange('');
    setGorunenAy(bugun());
    setAcik(false);
  };

  return (
    <div className="date-picker-field" ref={kapsayiciRef}>
      <label className="form-label">{label}</label>

      <button
        type="button"
        className={`date-picker-trigger ${acik ? 'open' : ''} ${value ? '' : 'empty'}`}
        onClick={() => setAcik((mevcut) => !mevcut)}
        aria-haspopup="dialog"
        aria-expanded={acik}
      >
        <span>{value ? gosterilecekTarih(value) : placeholder}</span>
        <span className="date-picker-trigger-icon" aria-hidden="true">
          ▾
        </span>
      </button>

      {acik ? (
        <div className="date-picker-popover" role="dialog" aria-label={`${label} tarih seçici`}>
          <div className="date-picker-header">
            <strong>
              {AY_ADLARI[gorunenAy.getMonth()]} {gorunenAy.getFullYear()}
            </strong>
            <div className="date-picker-nav">
              <button type="button" onClick={() => ayDegistir(-1)} aria-label="Önceki ay">
                ‹
              </button>
              <button type="button" onClick={() => ayDegistir(1)} aria-label="Sonraki ay">
                ›
              </button>
            </div>
          </div>

          <div className="date-picker-weekdays">
            {HAFTA_GUNLERI.map((gun) => (
              <span key={gun}>{gun}</span>
            ))}
          </div>

          <div className="date-picker-grid">
            {ayGunleri.map((date) => {
              const dateValue = tarihiStringeCevir(date);
              const baskaAy = date.getMonth() !== gorunenAy.getMonth();
              const secili = seciliTarih ? ayniGunMu(date, seciliTarih) : false;
              const bugunMu = ayniGunMu(date, bugununTarihi);

              return (
                <button
                  type="button"
                  key={dateValue}
                  className={[
                    'date-picker-day',
                    baskaAy ? 'muted' : '',
                    secili ? 'selected' : '',
                    bugunMu ? 'today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => tarihSec(date)}
                  aria-pressed={secili}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="date-picker-actions">
            {clearable ? (
              <button type="button" onClick={temizle}>
                Temizle
              </button>
            ) : (
              <span />
            )}
            <button type="button" onClick={bugunuSec}>
              Bugün
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
