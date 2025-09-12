import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import Dashboard from '@/pages/Dashboard';
import Employees from '@/pages/Employees';
import Upload from '@/pages/Upload';
import Admin from '@/pages/Admin';
import SystemLogs from '@/pages/SystemLogs';
import UserManagement from '@/pages/UserManagement';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import CNPJTestPage from '@/pages/CNPJTestPage';
import ProtectedRoute, { AdminRoute } from '@/components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/test-cnpj" element={<CNPJTestPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="upload" element={<AdminRoute><Upload /></AdminRoute>} />
            <Route path="admin" element={<Admin />} />
            <Route path="admin/logs" element={<SystemLogs />} />
            <Route path="admin/users" element={<UserManagement />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
