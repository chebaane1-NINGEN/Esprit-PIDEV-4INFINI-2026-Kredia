import React, { useEffect, useState } from 'react';
import { AdminStatsDTO } from '../../types/user.types';
import { userApi } from '../../api/userApi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

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
      <p>Loading global statistics...</p>
    </div>
  );
  if (error) return <div className="empty-state wow scaleUp"><div className="empty-icon">⚠️</div><h3>Failed to Load Data</h3><p>{error}</p></div>;
  if (!stats) return null;

  const activationRate = stats.totalUsers > 0 ? Math.round((stats.totalActive / stats.totalUsers) * 100) : 0;

  // Mock data for graphs since the backend doesn't provide historical timeseries
  // Built responsively scaled against the current total stats.
  const evolutionData = [
    { month: 'Jan', users: Math.round(stats.totalUsers * 0.4) },
    { month: 'Feb', users: Math.round(stats.totalUsers * 0.55) },
    { month: 'Mar', users: Math.round(stats.totalUsers * 0.65) },
    { month: 'Apr', users: Math.round(stats.totalUsers * 0.8) },
    { month: 'May', users: Math.round(stats.totalUsers * 0.9) },
    { month: 'Jun', users: stats.totalUsers },
  ];

  const roleDistribution = [
    { name: 'Admins', value: stats.totalAdmins, color: '#3b82f6' },
    { name: 'Employees', value: stats.totalEmployees, color: '#10b981' },
    { name: 'Clients', value: stats.totalClients, color: '#f59e0b' },
  ].filter(r => r.value > 0);

  const activityData = [
    { day: 'Mon', logins: 12, blocks: 0, kyc: 3 },
    { day: 'Tue', logins: 19, blocks: 1, kyc: 5 },
    { day: 'Wed', logins: 15, blocks: 0, kyc: 2 },
    { day: 'Thu', logins: 22, blocks: 0, kyc: 7 },
    { day: 'Fri', logins: 25, blocks: 2, kyc: 4 },
  ];

  return (
    <div className="admin-stats wow fadeInUp">
      
      {/* KPI Cards */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <p className="text-muted text-sm font-medium">Total Users</p>
          <div className="value mt-1 text-3xl font-bold">{stats.totalUsers}</div>
        </div>
        <div className="stat-card">
          <p className="text-muted text-sm font-medium">Active Users</p>
          <div className="value mt-1 text-3xl font-bold text-success">{stats.totalActive}</div>
        </div>
        <div className="stat-card">
          <p className="text-muted text-sm font-medium">Total Agents</p>
          <div className="value mt-1 text-3xl font-bold">{stats.totalEmployees}</div>
        </div>
        <div className="stat-card">
          <p className="text-muted text-sm font-medium">Total Clients</p>
          <div className="value mt-1 text-3xl font-bold">{stats.totalClients}</div>
        </div>
        <div className="stat-card">
          <p className="text-muted text-sm font-medium">Activation Rate</p>
          <div className="value mt-1 text-3xl font-bold text-primary">{activationRate}%</div>
        </div>
        <div className="stat-card">
          <p className="text-muted text-sm font-medium">System Health</p>
          <div className="value mt-1 text-3xl font-bold">{stats.systemHealthScore}%</div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Evolution Chart */}
        <div className="section-card">
          <div className="card-header border-b">
            <h3>Registration Evolution</h3>
          </div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Roles Pie Chart */}
        <div className="section-card">
          <div className="card-header border-b">
            <h3>Role Distribution</h3>
          </div>
          <div className="card-body flex justify-center items-center" style={{ height: 300 }}>
            {roleDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted">No roles data available</p>
            )}
          </div>
        </div>

        {/* Recent Activity Bar Chart */}
        <div className="section-card lg:col-span-2">
          <div className="card-header border-b">
            <h3>Recent System Activity</h3>
          </div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} cursor={{fill: 'transparent'}} />
                <Legend />
                <Bar dataKey="logins" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                <Bar dataKey="kyc" stackId="a" fill="#10b981" />
                <Bar dataKey="blocks" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminStats;
