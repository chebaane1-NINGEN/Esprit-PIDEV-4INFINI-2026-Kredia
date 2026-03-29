import React from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import EmployeePerformance from './EmployeePerformance';
import EmployeeActivities from './EmployeeActivities';

const EmployeeDashboard: React.FC = () => {
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
          <h2>Kredia Portal</h2>
        </div>
        
        <div className="user-profile-sm">
          <div className="avatar employee-avatar">{currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}</div>
          <div className="user-info">
            <p className="name">{currentUser?.firstName} {currentUser?.lastName}</p>
            <span className="badge badge-employee">Employee</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/employee" end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            My Performance
          </NavLink>
          <NavLink to="/employee/activities" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            My Activities
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
          <h1>Employee Workspace</h1>
        </header>
        
        <div className="content-area">
          <Routes>
            <Route path="/" element={<EmployeePerformance />} />
            <Route path="/activities" element={<EmployeeActivities />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
