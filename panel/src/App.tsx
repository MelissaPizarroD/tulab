import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { useAuth } from './context/AuthContext';

const RutaProtegida = ({ children }: { children: React.ReactNode }) => {
  const { encargado, cargando } = useAuth();
  if (cargando) return <div>Cargando...</div>;
  if (!encargado) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <RutaProtegida>
            <DashboardPage />
          </RutaProtegida>
        } />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;