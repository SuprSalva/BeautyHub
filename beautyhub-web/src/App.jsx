import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Inicio from './pages/Inicio/Inicio';
import Agenda from './pages/Agenda/Agenda';
import OwnerLayout from './components/layout/OwnerLayout';
import BookingFlow from './pages/Client/BookingFlow';
import Services from './pages/Services/Services';
import Empleados from './pages/Empleados/Empleados';
import Inventory from './pages/Inventory/Inventory';
import POS from './pages/POS/POS';
import Configuracion from './pages/Configuracion/Configuracion';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Perfil from './pages/Perfil/Perfil';
import { Navigate } from 'react-router-dom';

const Landing = () => (
  <div className="container flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '2rem' }}>
    <h1 className="text-gradient" style={{ fontSize: '4rem' }}>StyleFlow</h1>
    <p style={{ fontSize: '1.25rem' }} className="text-muted">La gestión inteligente para tu salón de belleza o barbería.</p>
    <div style={{ display: 'flex', gap: '1rem' }}>
      <button className="btn btn-primary">Comienza Gratis</button>
      <a href="/login" className="btn btn-outline" style={{ textDecoration: 'none' }}>Iniciar Sesión</a>
    </div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// PWA: Resolver Tenant basado en dominio
const AppRouter = () => {
  const host = window.location.hostname;
  
  // Lógica simple para simular en local
  // Si el host no es localhost (ej. salon.localhost), mostramos reserva.
  const isTenant = host.split('.')[0] !== 'localhost' && host !== '127.0.0.1';

  if (isTenant) {
    return (
      <Routes>
        <Route path="/" element={<BookingFlow />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<PrivateRoute><OwnerLayout /></PrivateRoute>}>
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/caja" element={<POS />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/empleados" element={<Empleados />} />
          <Route path="/inventario" element={<Inventory />} />
          <Route path="/caja" element={<POS />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      
      {/* Owner Panel Routes */}
      <Route element={<PrivateRoute><OwnerLayout /></PrivateRoute>}>
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/caja" element={<POS />} />
        <Route path="/servicios" element={<Services />} />
        <Route path="/empleados" element={<Empleados />} />
        <Route path="/inventario" element={<Inventory />} />
        <Route path="/settings" element={<Configuracion />} />
      </Route>
    </Routes>
  );
};

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="animate-fade-in">
          <AppRouter />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
