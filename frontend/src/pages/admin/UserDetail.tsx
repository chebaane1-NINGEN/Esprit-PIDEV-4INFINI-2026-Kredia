import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserResponseDTO, UserRole, UserActivityResponseDTO } from '../../types/user.types';
import { userApi } from '../../api/userApi';
import { useToast } from '../../contexts/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [auditLogs, setAuditLogs] = useState<UserActivityResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { addToast } = useToast();
  
  // Role Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>(UserRole.CLIENT);
  const [changingRole, setChangingRole] = useState(false);

  // Status Modal
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    actionType: 'block' | 'activate' | 'suspend' | 'deactivate' | 'restore' | 'delete';
  }>({ isOpen: false, actionType: 'block' });

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [userData, logsData] = await Promise.all([
        userApi.getById(Number(id)),
        userApi.getAdminAudit(Number(id)).catch(() => []) // Gracefull fail if no logs
      ]);
      setUser(userData);
      setNewRole(userData.role);
      setAuditLogs(logsData || []);
    } catch (err) {
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const executeRoleChange = async () => {
    if (!user || user.role === newRole) return;
    setChangingRole(true);
    setIsRoleModalOpen(false);
    try {
      const updatedUser = await userApi.changeRole(user.id, newRole);
      setUser(updatedUser);
      addToast('Role updated successfully', 'success');
      fetchData(); // Refresh logs
    } catch(err: any) {
      addToast(err.response?.data?.message || 'Role update failed.', 'error');
    } finally {
      setChangingRole(false);
    }
  };

  const executeStatusAction = async () => {
    if (!user) return;
    const { actionType } = confirmState;
    try {
      if (actionType === 'delete') {
        await userApi.delete(user.id);
      } else {
        switch(actionType) {
          case 'block': await userApi.block(user.id); break;
          case 'activate': await userApi.activate(user.id); break;
          case 'suspend': await userApi.suspend(user.id); break;
          case 'deactivate': await userApi.deactivate(user.id); break;
          case 'restore': await userApi.restore(user.id); break;
        }
      }
      addToast(`Action '${actionType}' completed successfully.`, 'success');
      fetchData();
    } catch(err: any) {
      addToast(err.response?.data?.message || `Action failed. Cannot ${actionType} user.`, 'error');
    } finally {
      setConfirmState({ ...confirmState, isOpen: false });
    }
  };

  const requestStatusAction = (action: 'block' | 'activate' | 'suspend' | 'deactivate' | 'restore' | 'delete') => {
    setConfirmState({ isOpen: true, actionType: action });
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading profile...</p>
    </div>
  );
  if (error || !user) return <div className="empty-state wow scaleUp"><div className="empty-icon">⚠️</div><h3>User Not Found</h3><p>{error}</p></div>;

  return (
    <div className="user-detail wow fadeInUp">
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/users" className="btn btn-outline">&larr; Back to Users</Link>
          <h2 className="text-2xl font-bold">User Profile: {user.firstName} {user.lastName}</h2>
        </div>
        <div className="flex gap-2 items-center">
          <span className={`badge badge-${user.role.toLowerCase()}`}>{user.role}</span>
          <span className={`badge bg-${user.status.toLowerCase()}`}>{user.isDeleted ? 'DELETED' : user.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Info */}
        <div className="section-card lg:col-span-1">
          <div className="card-header border-b">
            <h3>Identity Information</h3>
          </div>
          <div className="card-body">
            <div className="info-group mb-3">
              <span className="text-muted text-sm block">System ID</span>
              <strong className="text-lg">{user.id}</strong>
            </div>
            <div className="info-group mb-3">
              <span className="text-muted text-sm block">Email Address</span>
              <strong>{user.email}</strong>
            </div>
            <div className="info-group mb-3">
              <span className="text-muted text-sm block">Phone Number</span>
              <strong>{user.phoneNumber || 'N/A'}</strong>
            </div>
            <div className="info-group mb-3">
              <span className="text-muted text-sm block">KYC Status</span>
              <strong>{user.kycVerified ? 'Verified ✅' : 'Unverified ❌'}</strong>
            </div>
            <div className="info-group mb-3">
              <span className="text-muted text-sm block">Account Created</span>
              <strong>{new Date(user.createdAt).toLocaleString()}</strong>
            </div>
            <div className="info-group">
              <span className="text-muted text-sm block">Last Active</span>
              <strong>{user.lastLoginDate ? new Date(user.lastLoginDate).toLocaleString() : 'Never'}</strong>
            </div>
          </div>
        </div>

        {/* Administration Actions */}
        <div className="section-card lg:col-span-2 space-y-6">
          
          <div>
            <div className="card-header border-b">
              <h3>Role Management</h3>
            </div>
            <div className="card-body">
              <p className="text-muted mb-4">Change the user's elevated access level across environments.</p>
              <div className="flex gap-4 items-center">
                <select 
                  className="form-control w-48"
                  value={newRole} 
                  onChange={e => setNewRole(e.target.value as UserRole)} 
                  disabled={user.isDeleted}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="CLIENT">CLIENT</option>
                </select>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setIsRoleModalOpen(true)} 
                  disabled={changingRole || user.isDeleted || user.role === newRole}
                >
                  {changingRole ? 'Saving...' : 'Update Role'}
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="card-header border-b">
              <h3>Status Control</h3>
            </div>
            <div className="card-body flex gap-3 flex-wrap">
              {user.isDeleted ? (
                 <button onClick={() => requestStatusAction('restore')} className="btn btn-outline">Restore Account</button>
              ) : (
                <>
                  {user.status !== 'ACTIVE' && (
                     <button onClick={() => requestStatusAction('activate')} className="btn btn-success">Activate Access</button>
                  )}
                  {user.status === 'ACTIVE' && (
                     <button onClick={() => requestStatusAction('suspend')} className="btn btn-warning text-white">Suspend Account</button>
                  )}
                  {user.status !== 'BLOCKED' && (
                     <button onClick={() => requestStatusAction('block')} className="btn btn-danger">Block Immediately</button>
                  )}
                  <button onClick={() => requestStatusAction('delete')} className="btn btn-danger border-2 border-danger bg-transparent text-danger ml-auto">Soft Delete</button>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Audit Log History */}
        <div className="section-card lg:col-span-3">
          <div className="card-header border-b">
            <h3>Recent User Activity</h3>
          </div>
          <div className="card-body p-0">
            {auditLogs && auditLogs.length > 0 ? (
              <div className="table-responsive">
                <table className="table m-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Action</th>
                      <th>Description</th>
                      <th>IP Address</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, idx) => (
                      <tr key={idx}>
                        <td><span className="badge bg-secondary">{log.activityType}</span></td>
                        <td>{log.description}</td>
                        <td className="text-muted">{log.ipAddress || 'Unknown'}</td>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state py-8">
                <div className="empty-icon text-4xl mb-4">📜</div>
                <h4>No tracking history available</h4>
                <p className="text-muted">This user has not performed any auditable actions yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      <ConfirmModal
        isOpen={isRoleModalOpen}
        title="Confirm Role Change"
        message={`Are you sure you want to change this user's role to ${newRole}?`}
        confirmText="Confirm Change"
        confirmStyle="primary"
        onConfirm={executeRoleChange}
        onCancel={() => setIsRoleModalOpen(false)}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title="Confirm Status Action"
        message={`Are you sure you want to ${confirmState.actionType} this user?`}
        confirmText={`Yes, ${confirmState.actionType}`}
        confirmStyle={confirmState.actionType === 'activate' || confirmState.actionType === 'restore' ? 'success' : 'danger'}
        onConfirm={executeStatusAction}
        onCancel={() => setConfirmState({ ...confirmState, isOpen: false })}
      />
    </div>
  );
};

export default UserDetail;
