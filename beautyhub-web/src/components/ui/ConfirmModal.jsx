import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', isDanger = false }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1100 // Higher than other modals
    }}>
      <div className="glass-panel" style={{ width: '400px', padding: '2rem', background: 'white', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: isDanger ? 'var(--danger)' : 'var(--brand-primary)' }}>
          <AlertTriangle size={48} />
        </div>
        <h2 style={{ marginBottom: '0.5rem' }}>{title}</h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>{message}</p>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            style={{ flex: 1, backgroundColor: isDanger ? 'var(--danger)' : 'var(--brand-primary)', boxShadow: isDanger ? '0 4px 10px rgba(59, 130, 246, 0.3)' : undefined }} 
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
