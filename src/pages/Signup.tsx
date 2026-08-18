import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { User } from '../types';
import { UserPlus, AlertCircle } from 'lucide-react';

interface SignupProps {
  onSignupSuccess: (user: User) => void;
}

export const Signup: React.FC<SignupProps> = ({ onSignupSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiService.register(formData);
      onSignupSuccess(res.user);
      navigate('/form');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '3rem auto', padding: '0 1rem' }}>
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
            <UserPlus size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 700 }}>Create Operator Account</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Register to submit & automate RCAA clearance permits
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="first_name"
                className="form-input"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="last_name"
                className="form-input"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Username *</label>
            <input
              type="text"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn-primary-rcaa"
            style={{ width: '100%', maxWidth: 'none', margin: '0.5rem 0 0 0' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid #f1f5f9',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Already registered? <Link to="/login" style={{ color: '#0284c7', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
