import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/user.types';
import { RoleSelector } from '../pages/RoleSelector';
import AdminDashboard from '../pages/admin/AdminDashboard';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import ClientDashboard from '../pages/client/ClientDashboard';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: UserRole[] }) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) return <div className="loading-screen">Loading application...</div>;

  if (!currentUser) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" />; // Redirect to default page if unauthorized
  }

  return <>{children}</>;
};

const RoleRedirect = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return <Navigate to="/login" />;
  
  switch (currentUser.role) {
    case UserRole.ADMIN: return <Navigate to="/admin" />;
    case UserRole.EMPLOYEE: return <Navigate to="/employee" />;
    case UserRole.CLIENT: return <Navigate to="/client" />;
    default: return <Navigate to="/login" />;
  }
};

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<RoleSelector />} />
      <Route path="/" element={<RoleRedirect />} />
      
      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      {/* Employee Routes */}
      <Route path="/employee/*" element={
        <ProtectedRoute allowedRoles={[UserRole.EMPLOYEE]}>
          <EmployeeDashboard />
        </ProtectedRoute>
      } />
      
      {/* Client Routes */}
      <Route path="/client/*" element={
        <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
          <ClientDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
