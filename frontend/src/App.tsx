import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardSkeleton, EmployeesSkeleton, AdminSkeleton } from '@/components/skeletons';

// Rotas públicas - carregamento imediato (pequenas, não precisam lazy loading)
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';

// Rotas protegidas - Lazy Loading (componentes pesados)
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Employees = lazy(() => import('@/pages/Employees'));
const Admin = lazy(() => import('@/pages/Admin'));
const SystemLogs = lazy(() => import('@/pages/SystemLogs'));
const UserManagement = lazy(() => import('@/pages/UserManagement'));
const Profile = lazy(() => import('@/pages/Profile'));
const Settings = lazy(() => import('@/pages/Settings'));
const CacheAdmin = lazy(() => import('@/pages/CacheAdmin'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <SidebarProvider>
            <Routes>
            {/* Rotas públicas - sem lazy loading para carregamento rápido */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Rotas protegidas - com lazy loading e Suspense */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route 
                index 
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <Dashboard />
                  </Suspense>
                } 
              />
              <Route 
                path="employees" 
                element={
                  <Suspense fallback={<EmployeesSkeleton />}>
                    <Employees />
                  </Suspense>
                } 
              />
              <Route 
                path="admin" 
                element={
                  <Suspense fallback={<AdminSkeleton />}>
                    <Admin />
                  </Suspense>
                } 
              />
              <Route 
                path="admin/logs" 
                element={
                  <Suspense fallback={<LoadingSpinner message="Carregando Logs do Sistema..." />}>
                    <SystemLogs />
                  </Suspense>
                } 
              />
              <Route 
                path="admin/users" 
                element={
                  <Suspense fallback={<LoadingSpinner message="Carregando Gestão de Usuários..." />}>
                    <UserManagement />
                  </Suspense>
                } 
              />
              <Route 
                path="admin/cache" 
                element={
                  <Suspense fallback={<LoadingSpinner message="Carregando Administração de Cache..." />}>
                    <CacheAdmin />
                  </Suspense>
                } 
              />
              <Route 
                path="profile" 
                element={
                  <Suspense fallback={<LoadingSpinner message="Carregando Perfil..." />}>
                    <Profile />
                  </Suspense>
                } 
              />
              <Route 
                path="settings" 
                element={
                  <Suspense fallback={<LoadingSpinner message="Carregando Configurações..." />}>
                    <Settings />
                  </Suspense>
                } 
              />
            </Route>
          </Routes>
          </SidebarProvider>
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
