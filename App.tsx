
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Role } from './types';

import AuthPage from './pages/Auth';
import BorrowerPage from './pages/Borrower';
import LoanOfficerPage from './pages/LoanOfficer';
import AdminPage from './pages/Admin';
import Layout from './components/Layout';
import ProfilePage from './pages/Profile';

function App(): React.ReactNode {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage isRegister={true} />} />

      <Route 
        path="/app" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="borrower/*" element={<ProtectedRoute roles={[Role.BORROWER]}><BorrowerPage /></ProtectedRoute>} />
        <Route path="officer/*" element={<ProtectedRoute roles={[Role.LOAN_OFFICER]}><LoanOfficerPage /></ProtectedRoute>} />
        <Route path="admin/*" element={<ProtectedRoute roles={[Role.ADMIN]}><AdminPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route 
        path="*" 
        element={
          user 
            ? <Navigate to={`/app/${user.role === Role.LOAN_OFFICER ? 'officer' : user.role.toLowerCase()}/dashboard`} replace /> 
            : <Navigate to="/login" replace />
        } 
      />
    </Routes>
  );
}

export default App;
