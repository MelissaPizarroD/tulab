import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TurnoPage } from './pages/TurnoPage';
import { HistoricosPage } from './pages/HistoricosPage';
import { ConfiguracionPage } from './pages/ConfiguracionPage';
import { useAuth } from './context/AuthContext';

const RutaProtegida = ({ children }: { children: React.ReactNode }) => {
  const { encargado, cargando } = useAuth();
  if (cargando) return <div>Cargando...</div>;
  if (!encargado) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter basename="/panel">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <RutaProtegida><DashboardPage /></RutaProtegida>
        } />
        <Route path="/turno" element={
          <RutaProtegida><TurnoPage /></RutaProtegida>
        } />
        <Route path="/historicos" element={
          <RutaProtegida><HistoricosPage /></RutaProtegida>
        } />
        <Route path="/configuracion" element={
          <RutaProtegida><ConfiguracionPage /></RutaProtegida>
        } />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;