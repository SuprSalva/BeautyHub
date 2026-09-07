import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Scissors, Users, Settings, DollarSign, Package, LogOut } from 'lucide';
import { MorphIcon } from 'morphicons/react';
import { logout, fetchCurrentUser } from '../../api';
import { useQuery } from '@tanstack/react-query';

const Sidebar = () => {
  const navigate = useNavigate();
  const [hoveredMenu, setHoveredMenu] = useState(null);
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    retry: false
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Inicio', icon: LayoutDashboard, path: '/inicio' },
    { name: 'Caja', icon: DollarSign, path: '/caja' },
    { name: 'Agenda', icon: Calendar, path: '/agenda' },
    { name: 'Servicios', icon: Scissors, path: '/servicios' },
    { name: 'Empleados', icon: Users, path: '/empleados' },
    { name: 'Inventario', icon: Package, path: '/inventario' },
    { name: 'Configuración', icon: Settings, path: '/configuracion' },
  ];

  return (
    <aside className="sticky top-6 h-[calc(100vh-3rem)] m-6 flex flex-col overflow-hidden bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg">
      <div className="p-6 border-b border-white/50 flex flex-col items-start gap-1">
        <h2 className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-pink-500 bg-clip-text text-transparent">StyleFlow</h2>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Pro Plan</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-6 flex flex-col gap-2">
        {menuItems.map((item) => (
          <NavLink 
            to={item.path} 
            key={item.name}
            onMouseEnter={() => setHoveredMenu(item.name)}
            onMouseLeave={() => setHoveredMenu(null)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-white hover:text-blue-500 hover:shadow-sm'}`}
          >
            {({ isActive }) => (
              <>
                <MorphIcon 
                  icon={item.icon} 
                  size={20} 
                  strokeWidth={isActive || hoveredMenu === item.name ? 2.5 : 2}
                />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-6 border-t border-white/50 flex flex-col gap-4">
        {user && (
          <NavLink to="/perfil" className="block">
            <div className="flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors duration-200 hover:bg-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="m-0 font-semibold text-sm whitespace-nowrap text-ellipsis overflow-hidden text-slate-900">{user.name}</p>
                <p className="m-0 text-xs whitespace-nowrap text-ellipsis overflow-hidden text-slate-500">{user.role === 'Owner' ? 'Propietario' : user.role}</p>
              </div>
            </div>
          </NavLink>
        )}
        <button 
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm transition-all duration-300 border-2 border-blue-500 text-blue-500 hover:bg-blue-50" 
          onClick={handleLogout}
          onMouseEnter={() => setHoveredMenu('logout')}
          onMouseLeave={() => setHoveredMenu(null)}
        >
          <MorphIcon icon={LogOut} size={18} strokeWidth={hoveredMenu === 'logout' ? 2.5 : 2} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
