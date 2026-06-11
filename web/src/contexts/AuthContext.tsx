import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface AuthState {
  isLoggedIn: boolean;
  kullaniciAdi: string;
  email: string;
}

interface AuthContextValue extends AuthState {
  girisYap: (email: string) => Promise<void>;
  kayitOl: (isim: string, email: string) => Promise<void>;
  cikisYap: () => void;
  isimGuncelle: (yeniIsim: string) => Promise<void>;
  hata: string | null;
  setHata: (h: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PREFIX = '@caremind';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [kullaniciAdi, setKullaniciAdi] = useState('Misafir');
  const [email, setEmail] = useState('');
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    const status = localStorage.getItem(`${PREFIX}:isLoggedIn`);
    const isim = localStorage.getItem(`${PREFIX}:kullaniciAdi`);
    const eposta = localStorage.getItem(`${PREFIX}:kayitliEposta`);
    if (eposta) setEmail(eposta);
    if (isim) setKullaniciAdi(isim);
    setIsLoggedIn(status === 'true');
  }, []);

  const girisYap = useCallback(async (girilenEmail: string) => {
    setHata(null);
    const temiz = girilenEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(temiz)) {
      setHata('Geçerli bir e-posta adresi girin.');
      return;
    }
    const kayitli = localStorage.getItem(`${PREFIX}:kayitliEposta`);
    if (!kayitli) {
      setHata('Kayıtlı profil bulunamadı. Önce kayıt olun.');
      return;
    }
    if (temiz !== kayitli.toLowerCase()) {
      setHata('Bu e-posta ile kayıtlı profil bulunamadı.');
      return;
    }
    const isim = localStorage.getItem(`${PREFIX}:kullaniciAdi`) || 'Premium Üye';
    setKullaniciAdi(isim);
    setEmail(temiz);
    localStorage.setItem(`${PREFIX}:isLoggedIn`, 'true');
    setIsLoggedIn(true);
  }, []);

  const kayitOl = useCallback(async (isim: string, girilenEmail: string) => {
    setHata(null);
    const temizEmail = girilenEmail.trim().toLowerCase();
    const temizIsim = isim.trim();
    if (!temizIsim || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(temizEmail)) {
      setHata('Ad soyad ve geçerli e-posta adresi gerekli.');
      return;
    }
    localStorage.setItem(`${PREFIX}:kayitliEposta`, temizEmail);
    localStorage.setItem(`${PREFIX}:kullaniciAdi`, temizIsim);
    localStorage.setItem(`${PREFIX}:isLoggedIn`, 'true');
    setKullaniciAdi(temizIsim);
    setEmail(temizEmail);
    setIsLoggedIn(true);
  }, []);

  const cikisYap = useCallback(() => {
    localStorage.removeItem(`${PREFIX}:isLoggedIn`);
    setIsLoggedIn(false);
  }, []);

  const isimGuncelle = useCallback(async (yeniIsim: string) => {
    const temiz = yeniIsim.trim();
    if (temiz) {
      localStorage.setItem(`${PREFIX}:kullaniciAdi`, temiz);
      setKullaniciAdi(temiz);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, kullaniciAdi, email, girisYap, kayitOl, cikisYap, isimGuncelle, hata, setHata }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
