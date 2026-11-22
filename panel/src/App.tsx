import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TurnoPage } from './pages/TurnoPage';
import { HistoricosPage } from './pages/HistoricosPage';
import { ConfiguracionPage } from './pages/ConfiguracionPage';
import { useAuth } from './context/AuthContext';

const RutaProtegida = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const { encargado, cargando } = useAuth();
  if (cargando) return <div>Cargando...</div>;
  if (!encargado) return <Navigate to="/login" />;
  if (roles && !roles.includes(encargado.rol)) return <Navigate to="/dashboard" />;
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
          <RutaProtegida roles={['encargado_sala']}><TurnoPage /></RutaProtegida>
        } />
        <Route path="/historicos" element={
          <RutaProtegida><HistoricosPage /></RutaProtegida>
        } />
        <Route path="/configuracion" element={
          <RutaProtegida roles={['encargado_sala']}><ConfiguracionPage /></RutaProtegida>
        } />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;