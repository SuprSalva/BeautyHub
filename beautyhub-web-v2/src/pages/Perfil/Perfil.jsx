import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from '../../api';
import { User, Mail, Shield, Key } from 'lucide-react';

const Perfil = () => {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-gray-500">Cargando perfil...</p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-blue-500">Error al cargar el perfil.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <header className="mb-8">
        <div>
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <p className="text-gray-500">Gestiona tu información personal y credenciales.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center h-max sticky top-28 col-span-1">
          <div className="w-[120px] h-[120px] rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-5xl font-bold mb-6 shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="m-0 text-2xl text-gray-800 font-semibold">{user.name}</h2>
          <p className="text-gray-500 mt-1 mb-4">{user.email}</p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
            <Shield size={16} />
            <span>
              Rol: {user.role === 'Owner' ? 'Propietario / Admin' : user.role}
            </span>
          </div>
        </div>

        {/* Right Column: Details & Settings */}
        <div className="flex flex-col gap-6 col-span-1 md:col-span-2">
          
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-8">
            <h3 className="border-b border-gray-200 pb-4 mb-6 flex items-center gap-2 text-xl font-semibold">
              <User size={20} className="text-blue-500" />
              Datos Personales
            </h3>
            
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Nombre Completo</label>
                <input type="text" className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-gray-50 text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" value={user.name} disabled />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Correo Electrónico</label>
                <div className="relative">
                  <input type="email" className="w-full px-5 py-[0.85rem] pl-12 rounded-xl border border-slate-300 bg-gray-50 text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" value={user.email} disabled />
                  <Mail size={18} className="text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              
              <div className="mt-2">
                <p className="text-gray-500 text-sm">
                  * Por razones de seguridad, los datos personales básicos solo pueden ser modificados contactando a soporte técnico.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-8">
            <h3 className="border-b border-gray-200 pb-4 mb-6 flex items-center gap-2 text-xl font-semibold">
              <Key size={20} className="text-blue-500" />
              Seguridad
            </h3>
            
            <p className="text-gray-500 mb-6">
              Mantén tu cuenta segura actualizando tu contraseña periódicamente.
            </p>
            
            <button className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-2 bg-transparent text-blue-500 border-blue-500 hover:bg-blue-100" onClick={() => alert("Función de cambio de contraseña en desarrollo.")}>
              Cambiar Contraseña
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Perfil;
