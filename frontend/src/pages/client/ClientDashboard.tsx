import React from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ClientProfile from './ClientProfile';
import ClientActivities from './ClientActivities';

const ClientDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container client-theme">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Kredia Space</h2>
        </div>
        
        <div className="user-profile-sm">
          <div className="avatar client-avatar">{currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}</div>
          <div className="user-info">
            <p className="name">{currentUser?.firstName} {currentUser?.lastName}</p>
            <span className="badge badge-client">Client</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/client" end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            My Profile
          </NavLink>
          <NavLink to="/client/activities" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            Activity History
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn btn-outline btn-full">
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar client-topbar">
          <h1>My Profile & Spaces</h1>
        </header>
        
        <div className="content-area">
          <Routes>
            <Route path="/" element={<ClientProfile />} />
            <Route path="/activities" element={<ClientActivities />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
