import React, { useEffect, useState } from 'react';
import { UserActivityResponseDTO } from '../../types/user.types';
import { userApi } from '../../api/userApi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const ClientActivities: React.FC = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [logs, setLogs] = useState<UserActivityResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    userApi.getClientActivities(currentUser.id)
      .then(setLogs)
      .catch(() => addToast('Failed to load activity history', 'error'))
      .finally(() => setLoading(false));
  }, [currentUser]);

  return (
    <div className="client-activities card">
      <h2>Security & Activity History</h2>
      <p className="text-muted mb-3">Track all actions performed on your account.</p>
      
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3}>
                <div className="loading-container py-4">
                  <div className="spinner"></div>
                </div>
              </td></tr>
            ) : 
             logs.length === 0 ? (
              <tr><td colSpan={3}>
                <div className="empty-state">
                  <h3>No activity history found</h3>
                  <p>You have no recorded actions yet.</p>
                </div>
              </td></tr>
             ) :
             logs.map(log => (
              <tr key={log.activityId}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td><strong>{log.activityType}</strong></td>
                <td>{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientActivities;
