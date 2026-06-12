import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Login() {
  const { girisYap, kayitOl, hata, setHata, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mod, setMod] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [isim, setIsim] = useState('');
  const [sifre, setSifre] = useState('');
  const [sifreGoster, setSifreGoster] = useState(false);
  const [loading, setLoading] = useState(false);
  const hedef = (location.state as { from?: string } | null)?.from || '/';

  useEffect(() => {
    if (isLoggedIn) {
      navigate(hedef, { replace: true });
    }
  }, [hedef, isLoggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mod === 'login') {
        await girisYap(email, sifre);
      } else {
        await kayitOl(isim, email, sifre);
      }
      setTimeout(() => {
        const status = localStorage.getItem('@caremind:isLoggedIn');
        if (status === 'true') {
          navigate(hedef, { replace: true });
        }
        setLoading(false);
      }, 100);
    } catch {
      setLoading(false);
    }
  };

  const handleModDegistir = () => {
    setHata(null);
    setSifre('');
    setMod(mod === 'login' ? 'register' : 'login');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">🛡️</div>
        <h1 className="login-title">
          {mod === 'login' ? "CareMind'e Giriş" : "CareMind'e Kayıt"}
        </h1>
        <p className="login-desc">
          {mod === 'login'
            ? 'Hesabınıza giriş yaparak araçlarınızı takip edin.'
            : 'Araçlarınızı takip etmek için ücretsiz hesap oluşturun.'}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          {mod === 'register' && (
            <div className="login-input-wrap">
              <span className="icon">👤</span>
              <input
                type="text"
                placeholder="Ad Soyad"
                value={isim}
                onChange={e => setIsim(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="login-input-wrap">
            <span className="icon">📧</span>
            <input
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={e => { setEmail(e.target.value); setHata(null); }}
              autoComplete="email"
              required
            />
          </div>

          <div className="login-input-wrap">
            <span className="icon">🔒</span>
            <input
              type={sifreGoster ? 'text' : 'password'}
              placeholder={mod === 'register' ? 'Şifre (en az 6 karakter)' : 'Şifre'}
              value={sifre}
              onChange={e => { setSifre(e.target.value); setHata(null); }}
              autoComplete={mod === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setSifreGoster(!sifreGoster)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 4px',
                color: 'var(--color-text-secondary)',
                fontSize: 16,
                flexShrink: 0,
              }}
              aria-label={sifreGoster ? 'Şifreyi gizle' : 'Şifreyi göster'}
            >
              {sifreGoster ? '🙈' : '👁️'}
            </button>
          </div>

          {hata && <p className="form-error">{hata}</p>}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : mod === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="login-switch">
          <button onClick={handleModDegistir}>
            {mod === 'login'
              ? 'Hesabınız yok mu? Kayıt olun'
              : 'Zaten hesabınız var mı? Giriş yapın'}
          </button>
        </div>
      </div>
    </div>
  );
}
