import React, { useEffect, useState } from 'react';
import { UserActivityResponseDTO } from '../../types/user.types';
import { userApi } from '../../api/userApi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const EmployeeActivities: React.FC = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [logs, setLogs] = useState<UserActivityResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    userApi.getAgentActivities(currentUser.id)
      .then(setLogs)
      .catch(() => addToast('Failed to load recent activities', 'error'))
      .finally(() => setLoading(false));
  }, [currentUser]);

  return (
    <div className="employee-activities card">
      <h2>My Recent Activities</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Target Client ID</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4}>
                <div className="loading-container py-4">
                  <div className="spinner"></div>
                </div>
              </td></tr>
            ) : 
             logs.length === 0 ? (
              <tr><td colSpan={4}>
                <div className="empty-state">
                  <h3>No recent activities</h3>
                  <p>You have no recorded actions yet.</p>
                </div>
              </td></tr>
             ) :
             logs.map(log => (
              <tr key={log.activityId}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.activityType}</td>
                <td>{log.userId}</td>
                <td>{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeActivities;
