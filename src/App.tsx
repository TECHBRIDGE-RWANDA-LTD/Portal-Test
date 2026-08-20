import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ClientList } from './pages/ClientList';
import { ClientDetail } from './pages/ClientDetail';
import { AdHocPermitForm } from './pages/AdHocPermitForm';
import { SubmissionsList } from './pages/SubmissionsList';
import { SubmissionDetail } from './pages/SubmissionDetail';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import type { User } from './types';

const ProtectedRoute = ({ user, children }: { user: User | null; children: React.ReactNode }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('rcaa_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem('rcaa_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('rcaa_user');
  };

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        {/* Default route */}
        <Route path="/" element={<ProtectedRoute user={user}><AdHocPermitForm /></ProtectedRoute>} />

        {/* Auth routes */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup onSignupSuccess={handleLoginSuccess} />} />

        {/* Main Navigation Pages */}
        <Route path="/client-list" element={<ProtectedRoute user={user}><ClientList /></ProtectedRoute>} />
        <Route path="/client-list/:id" element={<ProtectedRoute user={user}><ClientDetail /></ProtectedRoute>} />
        <Route path="/form" element={<ProtectedRoute user={user}><AdHocPermitForm /></ProtectedRoute>} />
        <Route path="/submissions" element={<ProtectedRoute user={user}><SubmissionsList /></ProtectedRoute>} />
        <Route path="/submissions/:id" element={<ProtectedRoute user={user}><SubmissionDetail /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
