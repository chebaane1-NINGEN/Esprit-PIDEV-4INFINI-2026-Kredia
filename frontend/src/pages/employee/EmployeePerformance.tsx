import React, { useEffect, useState } from 'react';
import { AgentPerformanceDTO } from '../../types/user.types';
import { userApi } from '../../api/userApi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const EmployeePerformance: React.FC = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState<AgentPerformanceDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    userApi.getAgentDashboard(currentUser.id)
      .then(setStats)
      .catch(() => {
        setError('Failed to load employee dashboard stats');
        addToast('Could not load performance stats', 'error');
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div>Loading performance metrics...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!stats) return null;

  return (
    <div className="employee-performance">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Clients Managed</h3>
          <div className="value">{stats.totalClientsManaged}</div>
        </div>
        <div className="stat-card">
          <h3>Total Loans Processed</h3>
          <div className="value">{stats.totalLoansProcessed}</div>
        </div>
        <div className="stat-card">
          <h3>Total Investments Advised</h3>
          <div className="value">{stats.totalInvestmentsAdvised}</div>
        </div>
        <div className="stat-card">
          <h3>Avg Response Time (Hrs)</h3>
          <div className="value">{stats.averageResponseTimeHrs.toFixed(1)}</div>
        </div>
        <div className="stat-card">
          <h3>Client Satisfaction Score</h3>
          <div className="value">{stats.clientSatisfactionScore.toFixed(1)} / 5.0</div>
        </div>
        <div className="stat-card">
          <h3>Performance Rating</h3>
          <div className="value">{stats.performanceRating}</div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePerformance;
