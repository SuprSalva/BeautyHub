import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTenantSettings, updateTenantSettings } from '../../api';
import { Store, Link2, Copy, CheckCircle2, Shield } from 'lucide-react';

const Configuracion = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchTenantSettings
  });

  useEffect(() => {
    if (settings) {
      setName(settings.name);
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: updateTenantSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      alert('Configuración guardada exitosamente');
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    mutation.mutate({ name });
  };

  const getBookingLink = () => {
    if (!settings) return '';
    return `http://${settings.subdomain}.localhost:3000`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getBookingLink());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isLoading) return <p>Cargando configuración...</p>;

  return (
    <div className="">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1>Configuración</h1>
          <p className="text-slate-500">Administra los datos de tu salón y preferencias del sistema.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-8">
        
        {/* Columna Izquierda: Perfil de Empresa */}
        <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-2 mb-6 border-b border-white/50 pb-4">
            <Store className="text-blue-500" />
            <h2 className="m-0">Perfil de la Empresa</h2>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div>
              <label className="text-slate-500 block mb-2 text-[0.9rem]">Nombre Comercial del Salón</label>
              <input 
                type="text" 
                className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-slate-500 block mb-2 text-[0.9rem]">Subdominio (URL única)</label>
              <input 
                type="text" 
                className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-slate-100 text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 opacity-70" 
                value={settings?.subdomain || ''}
                disabled
              />
              <p className="text-[0.8rem] text-slate-500 mt-1">El subdominio no se puede cambiar después del registro.</p>
            </div>

            <button type="submit" className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none bg-blue-500 text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Columna Derecha: Enlace y Plan */}
        <div className="flex flex-col gap-8">
          
          <div className="backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-8 bg-gradient-to-br from-slate-100 to-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="text-orange-500" />
              <h2 className="m-0">Enlace de Reservas</h2>
            </div>
            <p className="text-slate-500 mb-6">
              Comparte este enlace con tus clientes por WhatsApp o en tus redes sociales para que puedan agendar citas en línea por sí mismos.
            </p>
            
            <div className="flex gap-2 items-center">
              <input 
                type="text" 
                className="flex-1 w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" 
                value={getBookingLink()} 
                readOnly 
              />
              <button 
                className="inline-flex items-center justify-center px-4 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none bg-blue-500 text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                onClick={copyToClipboard}
              >
                {isCopied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                {isCopied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="text-emerald-500" />
              <h2 className="m-0">Suscripción</h2>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="m-0 mb-2 font-bold">Plan Actual</p>
                <span className="rounded-full font-bold bg-blue-100 text-blue-500 text-base px-4 py-2">
                  {settings?.plan === 0 ? 'Basic Plan' : settings?.plan === 1 ? 'Pro Plan' : 'Enterprise Plan'}
                </span>
              </div>
              <button className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-2 bg-transparent text-blue-500 border-blue-500 hover:bg-blue-100" disabled>Mejorar Plan</button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Configuracion;
