import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Rankings } from './pages/Rankings';
import { Tournaments } from './pages/Tournaments';
import { MyMatches } from './pages/MyMatches';
import { Stats } from './pages/Stats';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { WaitingApproval } from './pages/WaitingApproval';
import { PublicRankings } from './pages/PublicRankings';
import { motion, AnimatePresence } from 'motion/react';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  // If not approved and not admin, show waiting screen
  if (profile && !profile.isApproved && profile.role !== 'admin' && !adminOnly) {
    return <WaitingApproval />;
  }

  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/" />;

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/public-rankings" element={<PublicRankings />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/rankings" element={
          <ProtectedRoute>
            <Layout>
              <Rankings />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/tournaments" element={
          <ProtectedRoute>
            <Layout>
              <Tournaments />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/matches" element={
          <ProtectedRoute>
            <Layout>
              <MyMatches />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/stats" element={
          <ProtectedRoute>
            <Layout>
              <Stats />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <Layout>
              <Admin />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/ranking-tm">

        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
