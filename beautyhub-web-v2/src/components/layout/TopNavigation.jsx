import React from 'react';
import { Search, Bell, Menu, User } from 'lucide-react';

const TopNavigation = ({ onMenuClick }) => {
  return (
    <header className="h-20 px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button 
          className="p-2 md:hidden text-slate-500 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
        <div className="relative w-full max-w-md hidden md:block group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2.5 bg-slate-100/50 border border-transparent rounded-xl text-sm transition-all focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 focus:outline-none placeholder-slate-400"
            placeholder="Buscar clientes, servicios, citas..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-5">
        <button className="relative p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 block h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

        <button className="flex items-center gap-3 group">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Admin Usuario</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Propietario</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm group-hover:shadow transition-all shrink-0">
            <User size={18} />
          </div>
        </button>
      </div>
    </header>
  );
};

export default TopNavigation;
