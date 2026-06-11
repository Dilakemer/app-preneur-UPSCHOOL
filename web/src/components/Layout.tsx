import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';

const MOBILE_NAV = [
  { to: '/', label: 'Araclar', icon: 'A' },
  { to: '/sigorta', label: 'Sigorta', icon: 'S' },
  { to: '/demo', label: 'Demo', icon: 'M' },
  { to: '/profil', label: 'Profil', icon: 'P' },
  { to: '/ayarlar', label: 'Ayarlar', icon: 'D' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Menuyu ac">
        =
      </button>

      <main className="app-content animate-fadeIn">
        <Outlet />
      </main>

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
