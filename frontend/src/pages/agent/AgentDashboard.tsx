import React from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AgentPerformance from './AgentPerformance';
import AgentActivities from './AgentActivities';
import AgentClients from './AgentClients';
import AgentKyc from './AgentKyc';

const AgentDashboard: React.FC = () => {
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
          <h2 className="flex items-center gap-2 text-primary">
            <span className="text-3xl">⚡</span> Kredia
          </h2>
        </div>
        
        <div className="user-profile-sm">
          <div className="avatar agent-avatar">
            {currentUser?.firstName?.[0] || 'E'}{currentUser?.lastName?.[0] || 'U'}
          </div>
          <div className="user-info">
            <p className="name">Hello, {currentUser?.firstName || 'Agent'}</p>
            <p className="badge badge-agent">{currentUser?.email || 'agent@kredia.com'}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/agent" end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="mr-3 text-lg">📊</span> My Performance
          </NavLink>
          <NavLink to="/agent/clients" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="mr-3 text-lg">👥</span> My Clients
          </NavLink>
          <NavLink to="/agent/kyc" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="mr-3 text-lg">🛡️</span> KYC Review
          </NavLink>
          <NavLink to="/agent/activities" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="mr-3 text-lg">📋</span> My Activities
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn btn-outline btn-full flex justify-center items-center gap-2">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="w-1/3">
            <input 
              type="text" 
              placeholder="Find something here..." 
              className="bg-white w-full border-none shadow-sm"
              style={{ borderRadius: '9999px', padding: '0.75rem 1.25rem', boxShadow: '0px 4px 10px rgba(0,0,0,0.02)' }}
            />
          </div>
          <div className="topbar-actions text-sm font-semibold text-muted">
            <span className="cursor-pointer">Clients</span>
            <span className="text-danger cursor-pointer">• Live Updates</span>
            <span className="cursor-pointer">Reports</span>
            <div className="flex items-center gap-4 ml-6 border-l border-gray-200 pl-6">
              <span className="text-2xl cursor-pointer">🔔</span>
              <div className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer text-white font-bold" style={{ background: '#FFCE20' }}>
                {currentUser?.firstName?.[0]}
              </div>
            </div>
          </div>
        </header>
        
        <div className="content-area pt-6">
          <Routes>
            <Route path="/" element={<AgentPerformance />} />
            <Route path="/clients" element={<AgentClients />} />
            <Route path="/kyc" element={<AgentKyc />} />
            <Route path="/activities" element={<AgentActivities />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AgentDashboard;
