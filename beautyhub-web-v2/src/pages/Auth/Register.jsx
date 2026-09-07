import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerTenant } from '../../api';

const Register = () => {
  const [formData, setFormData] = useState({
    salonName: '',
    subdomain: '',
    ownerName: '',
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await registerTenant(formData);
      setSuccess('¡Cuenta creada exitosamente! Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 items-center justify-center">
      <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-12 w-full max-w-[450px] flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <img src="/favicon.svg" alt="StyleFlow Logo" className="w-12 h-12 mb-3 rounded-2xl shadow-lg shadow-red-500/20" />
          <h1 className="text-[2rem] font-black tracking-tight m-0 text-slate-800">Style<span className="text-orange-500">Flow</span></h1>
          <p className="text-slate-500 mt-2">Crea tu cuenta de administrador</p>
        </div>

        {error && (
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-md border border-blue-500/20">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-500/10 text-green-500 rounded-md border border-green-500/20">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          
          <div className="flex flex-col gap-2">
            <label className="text-[0.9rem] font-medium text-slate-900">Nombre de tu Estética</label>
            <input 
              type="text" 
              name="salonName"
              className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" 
              placeholder="Ej: Beauty Palace" 
              value={formData.salonName} 
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.9rem] font-medium text-slate-900">Subdominio (URL única)</label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                name="subdomain"
                className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 flex-1" 
                placeholder="beautypalace" 
                value={formData.subdomain} 
                onChange={handleChange}
                required
              />
              <span className="text-slate-500">.styleflow.com</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.9rem] font-medium text-slate-900">Tu Nombre</label>
            <input 
              type="text" 
              name="ownerName"
              className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" 
              placeholder="María Pérez" 
              value={formData.ownerName} 
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.9rem] font-medium text-slate-900">Correo Electrónico</label>
            <input 
              type="email" 
              name="email"
              className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" 
              placeholder="maria@ejemplo.com" 
              value={formData.email} 
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.9rem] font-medium text-slate-900">Contraseña</label>
            <input 
              type="password" 
              name="password"
              className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none bg-blue-500 text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] w-full mt-2" 
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="text-center mt-2">
          <span className="text-slate-500">¿Ya tienes cuenta? </span>
          <Link to="/login" className="text-blue-500 no-underline font-medium">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
