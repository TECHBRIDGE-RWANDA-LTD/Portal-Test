import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, ListOrdered, User as UserIcon, LogOut, FileCheck } from 'lucide-react';
import type { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();

  return (
    <>
      <nav className="main-navbar">
        <Link to="/" className="brand-container">
         
          <span>RCAA APPS</span>
          
        </Link>

        {user && (
          <div className="nav-links">
            <Link
              to="/client-list"
              className={`nav-link ${location.pathname === '/client-list' ? 'active' : ''}`}
            >
              <FileCheck size={16} /> Client List
            </Link>

            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' || location.pathname === '/form' ? 'active' : ''}`}
            >
              <FileText size={16} /> Clearance Form
            </Link>
            
            <Link
              to="/submissions"
              className={`nav-link ${location.pathname.startsWith('/submissions') ? 'active' : ''}`}
            >
              <ListOrdered size={16} /> Submission List
            </Link>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <div className="user-profile-pill">
              <UserIcon size={14} style={{ color: '#00bcd4' }} />
              <span>{user.first_name || user.username}</span>
              <button
                onClick={onLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '0.5rem'
                }}
                title="Log Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>Sign In</Link>
              <Link to="/signup" className="nav-link" style={{ background: '#0284c7', color: '#fff' }}>Register</Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};
