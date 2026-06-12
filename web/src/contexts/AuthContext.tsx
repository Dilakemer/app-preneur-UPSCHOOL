import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

interface AuthState {
  isLoggedIn: boolean;
  kullaniciAdi: string;
  email: string;
}

interface AuthContextValue extends AuthState {
  girisYap: (email: string, sifre: string) => Promise<void>;
  kayitOl: (isim: string, email: string, sifre: string) => Promise<void>;
  cikisYap: () => void;
  isimGuncelle: (yeniIsim: string) => Promise<void>;
  hata: string | null;
  setHata: (h: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PREFIX = '@caremind';

/** Basit deterministik hash — gerçek şifreleme için backend kullanılmalı */
async function sifreHashle(sifre: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(sifre + ':caremind-salt-2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

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

  const girisYap = useCallback(async (girilenEmail: string, sifre: string) => {
    setHata(null);
    const temiz = girilenEmail.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(temiz)) {
      setHata('Geçerli bir e-posta adresi girin.');
      return;
    }

    if (!sifre || sifre.length < 6) {
      setHata('Şifre en az 6 karakter olmalıdır.');
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

    const kayitliHash = localStorage.getItem(`${PREFIX}:sifreHash`);
    const girilenHash = await sifreHashle(sifre);
    if (!kayitliHash || girilenHash !== kayitliHash) {
      setHata('Şifre hatalı. Lütfen tekrar deneyin.');
      return;
    }

    const isim = localStorage.getItem(`${PREFIX}:kullaniciAdi`) || 'Premium Üye';
    localStorage.setItem(`${PREFIX}:isLoggedIn`, 'true');
    setAuthState({ isLoggedIn: true, kullaniciAdi: isim, email: temiz });
  }, []);

  const kayitOl = useCallback(async (isim: string, girilenEmail: string, sifre: string) => {
    setHata(null);
    const temizEmail = girilenEmail.trim().toLowerCase();
    const temizIsim = isim.trim();

    if (!temizIsim) {
      setHata('Ad soyad gereklidir.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(temizEmail)) {
      setHata('Geçerli bir e-posta adresi girin.');
      return;
    }
    if (!sifre || sifre.length < 6) {
      setHata('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    const hash = await sifreHashle(sifre);
    localStorage.setItem(`${PREFIX}:kayitliEposta`, temizEmail);
    localStorage.setItem(`${PREFIX}:kullaniciAdi`, temizIsim);
    localStorage.setItem(`${PREFIX}:sifreHash`, hash);
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
