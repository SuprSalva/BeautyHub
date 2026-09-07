import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Scissors, Users, Settings, DollarSign, Package, LogOut } from 'lucide';
import { X } from 'lucide-react';
import { MorphIcon } from 'morphicons/react';
import { logout, fetchCurrentUser } from '../../api';
import { useQuery } from '@tanstack/react-query';

const Sidebar = ({ isOpen, setIsOpen }) => {
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
    <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-slate-200 flex flex-col h-full shadow-2xl md:shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo */}
      <div className="h-20 flex items-center justify-between px-6 md:px-8 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="BeautyHub Logo" className="w-8 h-8 rounded-lg shadow-lg shadow-blue-500/20 shrink-0" />
          <h2 className="text-2xl font-black tracking-tight text-slate-800">Beauty<span className="text-blue-500">Hub</span></h2>
        </div>
        <button 
          className="md:hidden p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          onClick={() => setIsOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1.5 custom-scrollbar">
        <p className="px-4 text-xs font-bold text-slate-400 tracking-wider uppercase mb-4 mt-2">Principal</p>
        {menuItems.map((item) => (
          <NavLink 
            to={item.path} 
            key={item.name}
            onClick={() => setIsOpen && setIsOpen(false)}
            onMouseEnter={() => setHoveredMenu(item.name)}
            onMouseLeave={() => setHoveredMenu(null)}
            className={({ isActive }) => `group flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            {({ isActive }) => (
              <>
                <div className={`flex items-center justify-center transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  <MorphIcon 
                    icon={item.icon} 
                    size={20} 
                    strokeWidth={isActive || hoveredMenu === item.name ? 2.5 : 2}
                  />
                </div>
                <span>{item.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
        {user && (
          <NavLink to="/perfil" className="block mb-3" onClick={() => setIsOpen && setIsOpen(false)}>
            <div className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold shadow-inner shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.role === 'Owner' ? 'Propietario' : user.role}</p>
              </div>
            </div>
          </NavLink>
        )}
        <button 
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors" 
          onClick={handleLogout}
          onMouseEnter={() => setHoveredMenu('logout')}
          onMouseLeave={() => setHoveredMenu(null)}
        >
          <MorphIcon icon={LogOut} size={18} strokeWidth={hoveredMenu === 'logout' ? 2.5 : 2} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
