import React from 'react';
import { Search, Bell, Menu, User } from 'lucide-react';

const TopNavigation = () => {
  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-200 mb-6 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button className="p-2 lg:hidden text-slate-500 hover:text-blue-500 transition-colors">
          <Menu size={20} />
        </button>
        <div className="relative w-full max-w-md hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
            placeholder="Buscar en el sistema..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:text-blue-500 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer group">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-500 transition-colors">Admin Usuario</span>
            <span className="text-xs text-slate-500">Propietario</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
