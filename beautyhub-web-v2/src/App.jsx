import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ui/ErrorBoundary';

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

const Landing = () => (
  <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-center h-screen flex-col gap-8">
    <div className="flex flex-col items-center gap-2">
      <img src="/favicon.svg" alt="BeautyHub Logo" className="w-24 h-24 mb-2 drop-shadow-xl" />
      <h1 className="bg-gradient-to-br from-red-500 to-orange-500 bg-clip-text text-transparent text-[4rem]">BeautyHub</h1>
    </div>
    <p className="text-muted text-xl">La gestión inteligente para tu salón de belleza o barbería.</p>
    <div className="flex gap-4">
      <button className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none bg-red-500 text-white shadow-[0_4px_10px_rgba(239,68,68,0.3)] hover:bg-red-600 hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]">Comienza Gratis</button>
      <a href="/login" className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none bg-transparent text-red-500 border-2 border-red-500 hover:bg-red-100 no-underline">Iniciar Sesión</a>
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
  const isTenant = host.split('.')[0] !== 'localhost' && host !== '127.0.0.1' && !host.includes('vercel.app');

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
      <Toaster position="top-right" toastOptions={{
        className: 'border border-slate-100 shadow-lg text-sm font-medium',
        style: { borderRadius: '12px', padding: '16px' },
      }} />
      <BrowserRouter>
        <div className="animate-fade-in">
          <ErrorBoundary><AppRouter /></ErrorBoundary>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
