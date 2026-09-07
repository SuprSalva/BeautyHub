import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', isDanger = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[1100] animate-fade-in p-4">
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] w-full max-w-[400px] p-8 text-center animate-fade-in-up">
        <div className={`flex justify-center mb-4 ${isDanger ? 'text-blue-600' : 'text-orange-500'}`}>
          <AlertTriangle size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
        <p className="text-slate-500 mb-8">{message}</p>
        
        <div className="flex gap-3">
          <button 
            type="button" 
            className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-[0.95rem] transition-all duration-200 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            className={`flex-1 inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-[0.95rem] transition-all duration-200 text-white shadow-sm hover:-translate-y-0.5 ${isDanger ? 'bg-blue-500 hover:bg-blue-600 hover:shadow-blue-200/50' : 'bg-blue-500 hover:bg-blue-600 hover:shadow-blue-200/50'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
