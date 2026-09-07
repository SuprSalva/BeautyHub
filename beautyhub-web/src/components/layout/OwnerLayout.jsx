import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';

const OwnerLayout = () => {
  return (
    <div className="grid grid-cols-[260px_1fr] min-h-screen bg-slate-50">
      <Sidebar />
      <main className="p-8 animate-fade-in flex flex-col h-screen overflow-hidden">
        <TopNavigation />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};


export default OwnerLayout;
