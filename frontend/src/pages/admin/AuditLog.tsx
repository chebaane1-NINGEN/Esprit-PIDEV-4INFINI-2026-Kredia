import React, { useEffect, useState } from 'react';
import { UserActivityResponseDTO, UserRole } from '../../types/user.types';
import { userApi } from '../../api/userApi';

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<UserActivityResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<UserRole | ''>('');
  
  const fetchLogs = async () => {
    try {
      setLoading(true);
      if (filterRole) {
        const res = await userApi.getAdminActivitiesByRole(filterRole as UserRole);
        setLogs(res);
      } else {
        // Technically there's no "get all", but we can query by a default role or specific user via backend.
        // For simplicity, we'll try to fetch Admin logs if no filter is set.
        const res = await userApi.getAdminActivitiesByRole(UserRole.ADMIN);
        setLogs(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterRole]);

  return (
    <div className="audit-log card">
      <div className="flex-between">
        <h2>System Audit Log</h2>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value as UserRole | '')}>
          <option value="">Default (Admin Logs)</option>
          <option value="ADMIN">Admin Logs</option>
          <option value="EMPLOYEE">Employee Logs</option>
          <option value="CLIENT">Client Logs</option>
        </select>
      </div>
      
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Act. ID</th>
              <th>Target User ID</th>
              <th>Actor ID</th>
              <th>Action</th>
              <th>Description</th>
              <th>Suspicious</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}>
                <div className="loading-container py-4">
                  <div className="spinner"></div>
                </div>
              </td></tr>
            ) : 
             logs.length === 0 ? (
              <tr><td colSpan={7}>
                <div className="empty-state">
                  <h3>No audit records found</h3>
                  <p>Try changing the role filter.</p>
                </div>
              </td></tr>
             ) :
             logs.map(log => (
              <tr key={log.activityId} className={log.isSuspicious ? 'row-suspended' : ''}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.activityId}</td>
                <td>{log.userId}</td>
                <td>{log.actorId || 'System'}</td>
                <td>{log.activityType}</td>
                <td>{log.description}</td>
                <td>{log.isSuspicious ? '⚠️ YES' : 'NO'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLog;
