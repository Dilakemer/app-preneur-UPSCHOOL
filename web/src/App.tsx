import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AraclarProvider } from './contexts/AraclarContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AracDetay from './pages/AracDetay';
import AracEkle from './pages/AracEkle';
import Profil from './pages/Profil';
import Ayarlar from './pages/Ayarlar';
import SigortaKarsilastir from './pages/SigortaKarsilastir';
import Login from './pages/Login';
import MobilDemo from './pages/MobilDemo';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AraclarProvider>
          <Routes>
            {/* Login page — no sidebar */}
            <Route path="/giris" element={<Login />} />

            {/* Main app with sidebar layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/arac/ekle" element={<AracEkle />} />
              <Route path="/arac/:id" element={<AracDetay />} />
              <Route path="/arac/:id/duzenle" element={<AracEkle />} />
              <Route path="/profil" element={<Profil />} />
              <Route path="/ayarlar" element={<Ayarlar />} />
              <Route path="/sigorta" element={<SigortaKarsilastir />} />
              <Route path="/demo" element={<MobilDemo />} />
            </Route>
          </Routes>
        </AraclarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
