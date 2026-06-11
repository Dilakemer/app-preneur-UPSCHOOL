import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

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

const getInitialAuthState = (): AuthState => {
  const status = localStorage.getItem(`${PREFIX}:isLoggedIn`);
  const isim = localStorage.getItem(`${PREFIX}:kullaniciAdi`);
  const eposta = localStorage.getItem(`${PREFIX}:kayitliEposta`);

  return {
    isLoggedIn: status === 'true',
    kullaniciAdi: isim || 'Misafir',
    email: eposta || '',
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(getInitialAuthState);
  const { isLoggedIn, kullaniciAdi, email } = authState;
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    setAuthState(getInitialAuthState());
  }, []);

  const girisYap = useCallback(async (girilenEmail: string) => {
    setHata(null);
    const temiz = girilenEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(temiz)) {
      setHata('Gecerli bir e-posta adresi girin.');
      return;
    }

    const kayitli = localStorage.getItem(`${PREFIX}:kayitliEposta`);
    if (!kayitli) {
      setHata('Kayitli profil bulunamadi. Once kayit olun.');
      return;
    }
    if (temiz !== kayitli.toLowerCase()) {
      setHata('Bu e-posta ile kayitli profil bulunamadi.');
      return;
    }

    const isim = localStorage.getItem(`${PREFIX}:kullaniciAdi`) || 'Premium Uye';
    localStorage.setItem(`${PREFIX}:isLoggedIn`, 'true');
    setAuthState({ isLoggedIn: true, kullaniciAdi: isim, email: temiz });
  }, []);

  const kayitOl = useCallback(async (isim: string, girilenEmail: string) => {
    setHata(null);
    const temizEmail = girilenEmail.trim().toLowerCase();
    const temizIsim = isim.trim();
    if (!temizIsim || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(temizEmail)) {
      setHata('Ad soyad ve gecerli e-posta adresi gerekli.');
      return;
    }

    localStorage.setItem(`${PREFIX}:kayitliEposta`, temizEmail);
    localStorage.setItem(`${PREFIX}:kullaniciAdi`, temizIsim);
    localStorage.setItem(`${PREFIX}:isLoggedIn`, 'true');
    setAuthState({ isLoggedIn: true, kullaniciAdi: temizIsim, email: temizEmail });
  }, []);

  const cikisYap = useCallback(() => {
    localStorage.removeItem(`${PREFIX}:isLoggedIn`);
    setAuthState((onceki) => ({ ...onceki, isLoggedIn: false }));
  }, []);

  const isimGuncelle = useCallback(async (yeniIsim: string) => {
    const temiz = yeniIsim.trim();
    if (temiz) {
      localStorage.setItem(`${PREFIX}:kullaniciAdi`, temiz);
      setAuthState((onceki) => ({ ...onceki, kullaniciAdi: temiz }));
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
