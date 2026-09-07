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
    <div className="settings-page">
      <header className="page-header">
        <div>
          <h1>Configuración</h1>
          <p className="text-muted">Administra los datos de tu salón y preferencias del sistema.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Columna Izquierda: Perfil de Empresa */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            <Store style={{ color: 'var(--brand-primary)' }} />
            <h2 style={{ margin: 0 }}>Perfil de la Empresa</h2>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nombre Comercial del Salón</label>
              <input 
                type="text" 
                className="input-field" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Subdominio (URL única)</label>
              <input 
                type="text" 
                className="input-field" 
                value={settings?.subdomain || ''}
                disabled
                style={{ opacity: 0.7, backgroundColor: 'var(--surface-100)' }}
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>El subdominio no se puede cambiar después del registro.</p>
            </div>

            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Columna Derecha: Enlace y Plan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem', background: 'linear-gradient(145deg, var(--surface-100) 0%, var(--surface-200) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Link2 style={{ color: 'var(--brand-secondary)' }} />
              <h2 style={{ margin: 0 }}>Enlace de Reservas</h2>
            </div>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Comparte este enlace con tus clientes por WhatsApp o en tus redes sociales para que puedan agendar citas en línea por sí mismos.
            </p>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="text" 
                className="input-field" 
                value={getBookingLink()} 
                readOnly 
                style={{ flex: 1, backgroundColor: 'white' }}
              />
              <button 
                className="btn btn-primary" 
                onClick={copyToClipboard}
                style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {isCopied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                {isCopied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Shield style={{ color: 'var(--success)' }} />
              <h2 style={{ margin: 0 }}>Suscripción</h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Plan Actual</p>
                <span className="badge" style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontSize: '1rem', padding: '0.5rem 1rem' }}>
                  {settings?.plan === 0 ? 'Basic Plan' : settings?.plan === 1 ? 'Pro Plan' : 'Enterprise Plan'}
                </span>
              </div>
              <button className="btn btn-outline" disabled>Mejorar Plan</button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Configuracion;
