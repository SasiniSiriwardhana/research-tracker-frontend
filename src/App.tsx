import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, GuestRoute, RoleRoute } from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Spinner from './components/common/Spinner';

// ── Lazy-loaded pages ────────────────────────────────────────
const LoginPage       = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage    = lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage   = lazy(() => import('./pages/dashboard/DashboardPage'));
const ProjectsPage    = lazy(() => import('./pages/projects/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/projects/ProjectDetailPage'));
const MilestonesPage  = lazy(() => import('./pages/milestones/MilestonesPage'));
const DocumentsPage   = lazy(() => import('./pages/documents/DocumentsPage'));
const AdminPage       = lazy(() => import('./pages/admin/AdminPage'));

// ── App ──────────────────────────────────────────────────────
const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner /></div>}>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Guest-only: redirect authenticated users to /dashboard */}
          <Route element={<GuestRoute />}>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected: all authenticated users */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard"                  element={<DashboardPage />} />
              <Route path="/projects"                   element={<ProjectsPage />} />
              <Route path="/projects/:id"               element={<ProjectDetailPage />} />
              <Route path="/projects/:id/milestones"    element={<MilestonesPage />} />
              <Route path="/projects/:id/documents"     element={<DocumentsPage />} />

              {/* Admin-only */}
              <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
