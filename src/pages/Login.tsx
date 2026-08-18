import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { User } from '../types';
import { Lock, User as UserIcon, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiService.login({ username, password });
      onLoginSuccess(res.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div style={{ maxWidth: '420px', margin: '4rem auto', padding: '0 1rem' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid #cbd5e1'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <Lock size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 700 }}>Portal Sign In</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            RCAA Clearance Automation System
          </p>
        </div>

        {error && (
          <div style={{
            background: '#ffe4e6',
            color: '#be123c',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary-rcaa"
            style={{ width: '100%', maxWidth: 'none', margin: '0.5rem 0 0 0' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid #f1f5f9',
          textAlign: 'center'
        }}>
         
          
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Don't have an account? <Link to="/signup" style={{ color: '#0284c7', fontWeight: 600 }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
