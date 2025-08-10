import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import Dashboard from '@/pages/Dashboard';
import Employees from '@/pages/Employees';
import Upload from '@/pages/Upload';

import Reports from '@/pages/Reports';
import Profile from '@/pages/Profile';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="upload" element={<Upload />} />

            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
