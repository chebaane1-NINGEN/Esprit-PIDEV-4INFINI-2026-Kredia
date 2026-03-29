import React, { useEffect, useState } from 'react';
import { AdminStatsDTO } from '../../types/user.types';
import { userApi } from '../../api/userApi';

const AdminStats: React.FC = () => {
  const [stats, setStats] = useState<AdminStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    userApi.getAdminStats()
      .then(setStats)
      .catch((err: Error) => setError(err.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading statistics...</p>
    </div>
  );
  if (error) return <div className="error-message">{error}</div>;
  if (!stats) return null;

  return (
    <div className="admin-stats">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="value">{stats.totalUsers}</div>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <div className="value">{stats.totalActive}</div>
        </div>
        <div className="stat-card">
          <h3>Total Clients</h3>
          <div className="value">{stats.totalClients}</div>
        </div>
        <div className="stat-card">
          <h3>Total Employees</h3>
          <div className="value">{stats.totalEmployees}</div>
        </div>
        <div className="stat-card">
          <h3>Total Admins</h3>
          <div className="value">{stats.totalAdmins}</div>
        </div>
        <div className="stat-card">
          <h3>New This Month</h3>
          <div className="value">{stats.newUsersThisMonth}</div>
        </div>
        <div className="stat-card">
          <h3>System Health Score</h3>
          <div className="value">{stats.systemHealthScore}%</div>
        </div>
        <div className="stat-card warning">
          <h3>Suspicious Activities</h3>
          <div className="value">{stats.suspiciousActivitiesCount}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
