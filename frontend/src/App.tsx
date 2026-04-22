import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Equipment from './pages/Equipment';
import Reservations from './pages/Reservations';
import Reports from './pages/Reports';
import History from './pages/History';

// Route guard: redirige vers /login si non connecté
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth() as any;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Route guard: redirige vers /dashboard si déjà connecté
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth() as any;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"   element={<Dashboard />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/rooms"       element={<Rooms />} />
        <Route path="/equipment"   element={<Equipment />} />
        <Route path="/reports"     element={<Reports />} />
        <Route path="/history"     element={<History />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
