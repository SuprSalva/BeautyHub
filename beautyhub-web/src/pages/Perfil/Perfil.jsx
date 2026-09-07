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
      <div className="flex-center" style={{ height: '50vh' }}>
        <p className="text-muted">Cargando perfil...</p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex-center" style={{ height: '50vh' }}>
        <p className="text-muted" style={{ color: 'var(--danger)' }}>Error al cargar el perfil.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Mi Perfil</h1>
          <p className="text-muted">Gestiona tu información personal y credenciales.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Left Column: Avatar & Summary */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: 'max-content', position: 'sticky', top: '7rem' }}>
          <div style={{ 
            width: '120px', height: '120px', borderRadius: '50%', 
            backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', fontWeight: 700, marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>{user.name}</h2>
          <p className="text-muted" style={{ margin: '0.25rem 0 1rem 0' }}>{user.email}</p>
          
          <div className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            <Shield size={16} />
            <span>
              Rol: {user.role === 'Owner' ? 'Propietario / Admin' : user.role}
            </span>
          </div>
        </div>

        {/* Right Column: Details & Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} color="var(--brand-primary)" />
              Datos Personales
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Nombre Completo</label>
                <input type="text" className="input-field" value={user.name} disabled style={{ backgroundColor: 'var(--surface-50)' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Correo Electrónico</label>
                <div style={{ position: 'relative' }}>
                  <input type="email" className="input-field" value={user.email} disabled style={{ backgroundColor: 'var(--surface-50)', paddingLeft: '2.5rem' }} />
                  <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
              
              <div style={{ marginTop: '0.5rem' }}>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                  * Por razones de seguridad, los datos personales básicos solo pueden ser modificados contactando a soporte técnico.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={20} color="var(--brand-primary)" />
              Seguridad
            </h3>
            
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Mantén tu cuenta segura actualizando tu contraseña periódicamente.
            </p>
            
            <button className="btn btn-outline" onClick={() => alert("Función de cambio de contraseña en desarrollo.")}>
              Cambiar Contraseña
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Perfil;
