import React from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UsersList from './UsersList';
import AdminStats from './AdminStats';
import UserDetail from './UserDetail';
import AuditLog from './AuditLog';

const AdminDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Kredia Admin</h2>
        </div>
        
        <div className="user-profile-sm">
          <div className="avatar">{currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}</div>
          <div className="user-info">
            <p className="name">{currentUser?.firstName} {currentUser?.lastName}</p>
            <span className="badge badge-admin">Admin</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin" end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            Dashboard Info
          </NavLink>
          <NavLink to="/admin/users" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            User Management
          </NavLink>
          <NavLink to="/admin/audit" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            System Audit Log
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn btn-outline btn-full">
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1>Admin Control Center</h1>
        </header>
        
        <div className="content-area">
          <Routes>
            <Route path="/" element={<AdminStats />} />
            <Route path="/users" element={<UsersList />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/audit" element={<AuditLog />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
