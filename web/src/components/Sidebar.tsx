import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Araçlarım', icon: '🚗' },
  { to: '/bildirimler', label: 'Bildirimler', icon: '🔔' },
  { to: '/giderler', label: 'Araç Giderleri', icon: '💰' },
  { to: '/sigorta', label: 'Sigorta', icon: '🛡️' },
  { to: '/profil', label: 'Profil', icon: '👤' },
  { to: '/demo', label: 'Mobil Demo', icon: '📱' },
  { to: '/ayarlar', label: 'Ayarlar', icon: '⚙️' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isLoggedIn, kullaniciAdi } = useAuth();
  const location = useLocation();

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h1>CareMind</h1>
          <span>Arac Takip Platformu</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {isLoggedIn ? (
            <div className="sidebar-user">
              <div className="sidebar-avatar">{kullaniciAdi.charAt(0).toUpperCase()}</div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{kullaniciAdi}</div>
                <div className="sidebar-user-role">Premium Uye</div>
              </div>
            </div>
          ) : (
            <NavLink
              to="/giris"
              className={`sidebar-link ${location.pathname === '/giris' ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="icon">G</span>
              Giris Yap
            </NavLink>
          )}
        </div>
      </aside>
    </>
  );
}
