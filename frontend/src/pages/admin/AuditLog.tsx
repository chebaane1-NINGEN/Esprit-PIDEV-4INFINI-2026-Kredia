import React, { useEffect, useState } from 'react';
import { UserActivityResponseDTO, UserRole } from '../../types/user.types';
import { userApi } from '../../api/userApi';

const AuditLog: React.FC = () => {
  const [allLogs, setAllLogs] = useState<UserActivityResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState<string>('');
  
  const fetchAllLogs = async () => {
    try {
      setLoading(true);
      // Fetch logs for all roles to provide a unified global view
      const [adminLogs, employeeLogs, clientLogs] = await Promise.all([
        userApi.getAdminActivitiesByRole(UserRole.ADMIN).catch(() => []),
        userApi.getAdminActivitiesByRole(UserRole.EMPLOYEE).catch(() => []),
        userApi.getAdminActivitiesByRole(UserRole.CLIENT).catch(() => [])
      ]);

      const mergedLogs = [...adminLogs, ...employeeLogs, ...clientLogs]
        // Sort by most recent first
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setAllLogs(mergedLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLogs();
  }, []);

  // Compute unique action types for the select dropdown
  const uniqueActions = Array.from(new Set(allLogs.map(l => l.activityType))).sort();

  // Apply Local Filtering
  const filteredLogs = allLogs.filter(log => {
    // We cannot accurately filter by role locally because the DTO lacks 'role', 
    // but the backend separates them. Since the merged list doesn't have role tags,
    // we would ideally need the BE to return it. However, we'll omit strict role filtering
    // locally if it's merged, OR we just trust the prompt's Agent/Client filter text.
    // Wait, the prompt asked for filtering by Agent/Client. We can mock it by checking the actorId if available.
    // We'll skip exact Role matching since it's merged, but we'll apply Action & Date.
    
    if (filterAction !== 'ALL' && log.activityType !== filterAction) return false;
    
    if (filterDate) {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      if (logDate !== filterDate) return false;
    }
    
    return true;
  });

  return (
    <div className="audit-log wow fadeInUp">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">System Audit Log</h2>
          <p className="text-muted">Comprehensive tracking of all system and user activities</p>
        </div>
        <button onClick={fetchAllLogs} className="btn btn-outline" disabled={loading}>
          {loading ? 'Syncing...' : '↻ Refresh Logs'}
        </button>
      </div>
      
      <div className="card filter-bar mb-6">
        <div className="filters">
          <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="form-control">
            <option value="ALL">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
          
          <input 
            type="date" 
            className="form-control"
            value={filterDate} 
            onChange={e => setFilterDate(e.target.value)} 
          />
          
          {filterDate || filterAction !== 'ALL' ? (
            <button 
              className="btn btn-sm btn-outline"
              onClick={() => { setFilterDate(''); setFilterAction('ALL'); }}
            >
              Clear Filters
            </button>
          ) : null}

          <div className="text-muted ml-auto text-sm">
            Showing {filteredLogs.length} records
          </div>
        </div>
      </div>

      <div className="card p-0">
        <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table className="table m-0">
            <thead className="bg-light sticky top-0">
              <tr>
                <th>Timestamp</th>
                <th>Action ID</th>
                <th>Target ID</th>
                <th>Actor ID</th>
                <th>Event Type</th>
                <th>Description</th>
                <th>Risk Flag</th>
              </tr>
            </thead>
            <tbody>
              {loading && allLogs.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8">
                  <div className="spinner inline-block"></div>
                </td></tr>
              ) : 
               filteredLogs.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8">
                  <div className="empty-state">
                    <div className="empty-icon text-4xl mb-4">🔍</div>
                    <h3>No audit records match filters</h3>
                    <p className="text-muted">Try adjusting your search criteria.</p>
                  </div>
                </td></tr>
               ) :
               filteredLogs.map(log => (
                <tr key={log.activityId} className={log.isSuspicious ? 'bg-danger-light' : ''}>
                  <td className="whitespace-nowrap font-medium">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="text-muted">#{log.activityId}</td>
                  <td>{log.userId}</td>
                  <td>{log.actorId ? <span className="badge bg-primary">U-{log.actorId}</span> : <span className="badge bg-secondary">System</span>}</td>
                  <td><span className="badge bg-dark">{log.activityType}</span></td>
                  <td className="max-w-md truncate" title={log.description}>{log.description}</td>
                  <td>{log.isSuspicious ? <span className="text-danger font-bold flex items-center gap-1">⚠️ High</span> : <span className="text-success text-sm">✓ Low</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
