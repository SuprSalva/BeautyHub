import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api';

const Login = () => {
  const [email, setEmail] = useState('ana@nails.com');
  const [password, setPassword] = useState('root'); // Demo credentials
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const data = await login(email, password);
      
      // If we are on the main landing page, redirect to the tenant subdomain
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        const port = window.location.port ? `:${window.location.port}` : '';
        window.location.href = `http://${data.tenantSubdomain}.localhost${port}/inicio`;
      } else {
        navigate('/inicio');
      }
    } catch (err) {
      setError('Credenciales incorrectas. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ height: '100vh', backgroundColor: 'var(--surface-100)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ marginBottom: '0.5rem' }}>StyleFlow</h1>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Inicia sesión en tu cuenta</p>

        {error && (
          <div style={{ backgroundColor: 'var(--danger)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <input 
              type="email" 
              className="input-field" 
              placeholder="Correo electrónico" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={isLoading}>
            {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <span className="text-muted">¿No tienes cuenta? </span>
          <Link to="/register" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 500 }}>
            Crea una gratis
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
