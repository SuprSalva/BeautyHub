import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api';

const Login = () => {
  const [email, setEmail] = useState('ana@nails.com');
  const [password, setPassword] = useState('root'); // Demo credentials
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const data = await login(email, password);
      
      // If we are on the main landing page, redirect to the tenant subdomain
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        const port = window.location.port ? `:${window.location.port}` : '';
        window.location.href = `http://${data.tenantSubdomain}.localhost${port}/inicio`;
      } else {
        navigate('/inicio');
      }
    } catch (err) {
      setError('Credenciales incorrectas. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-orange-400/20 blur-[120px] pointer-events-none"></div>
      
      <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.04)] w-full max-w-[420px] p-10 text-center relative z-10 animate-fade-in-up">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/favicon.svg" alt="StyleFlow Logo" className="w-14 h-14 rounded-2xl shadow-lg shadow-red-500/20" />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-slate-800 mb-2">Style<span className="text-orange-500">Flow</span></h1>
        <p className="text-slate-500 font-medium mb-8">Ingresa a tu panel de control</p>

        {error && (
          <div className="bg-blue-500 text-white p-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <input 
              type="email" 
              className="w-full px-5 py-3 rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" 
              placeholder="Correo electrónico" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              className="w-full px-5 py-3 rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="w-full mt-2 inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer bg-blue-500 text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] border-none" disabled={isLoading}>
            {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-slate-500">¿No tienes cuenta? </span>
          <Link to="/register" className="text-blue-500 no-underline font-medium hover:text-blue-600 transition-colors">
            Crea una gratis
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
