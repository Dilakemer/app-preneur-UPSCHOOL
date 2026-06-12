import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import OnboardingTour from './OnboardingTour';

const MOBILE_NAV = [
  { to: '/', label: 'Araçlar', icon: '🚗' },
  { to: '/bildirimler', label: 'Bildirimler', icon: '🔔' },
  { to: '/giderler', label: 'Giderler', icon: '💰' },
  { to: '/sigorta', label: 'Sigorta', icon: '🛡️' },
  { to: '/ayarlar', label: 'Ayarlar', icon: '⚙️' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Menüyü aç">
        ☰
      </button>

      <main className="app-content animate-fadeIn">
        <Outlet />
      </main>

      <OnboardingTour />

      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {MOBILE_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
