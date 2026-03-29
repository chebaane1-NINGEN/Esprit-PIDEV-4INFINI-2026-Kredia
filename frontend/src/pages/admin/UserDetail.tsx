import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserResponseDTO, UserRole } from '../../types/user.types';
import { userApi } from '../../api/userApi';
import { useToast } from '../../contexts/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newRole, setNewRole] = useState<UserRole>(UserRole.CLIENT);
  const [changingRole, setChangingRole] = useState(false);

  useEffect(() => {
    if (!id) return;
    userApi.getById(Number(id))
      .then((data: UserResponseDTO) => {
        setUser(data);
        setNewRole(data.role);
      })
      .catch(() => setError('Failed to load user details'))
      .finally(() => setLoading(false));
  }, [id]);

  const executeRoleChange = async () => {
    if (!user || user.role === newRole) return;
    setChangingRole(true);
    setIsModalOpen(false);
    try {
      const updatedUser = await userApi.changeRole(user.id, newRole);
      setUser(updatedUser);
      addToast('Role updated successfully', 'success');
    } catch(err: any) {
      addToast(err.response?.data?.message || 'Role update failed.', 'error');
    } finally {
      setChangingRole(false);
    }
  };

  const handleRoleChange = () => {
    setIsModalOpen(true);
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading profile...</p>
    </div>
  );
  if (error || !user) return <div className="error-message empty-state">{error || 'User not found'}</div>;

  return (
    <div className="user-detail card">
      <div className="detail-header">
        <Link to="/admin/users" className="btn btn-outline">&larr; Back to Users</Link>
        <h2>User Profile: {user.firstName} {user.lastName}</h2>
        <div className="status-badges">
          <span className={`badge badge-${user.role.toLowerCase()}`}>{user.role}</span>
          <span className={`badge bg-${user.status.toLowerCase()}`}>{user.isDeleted ? 'DELETED' : user.status}</span>
        </div>
      </div>

      <div className="detail-grid">
        <div className="info-group">
          <strong>ID:</strong> <span>{user.id}</span>
        </div>
        <div className="info-group">
          <strong>Email:</strong> <span>{user.email}</span>
        </div>
        <div className="info-group">
          <strong>Phone:</strong> <span>{user.phoneNumber || 'N/A'}</span>
        </div>
        <div className="info-group">
          <strong>KYC Status:</strong> <span>{user.kycVerified ? 'Verified ✅' : 'Unverified ❌'}</span>
        </div>
        <div className="info-group">
          <strong>Created:</strong> <span>{new Date(user.createdAt).toLocaleString()}</span>
        </div>
        <div className="info-group">
          <strong>Updated:</strong> <span>{new Date(user.updatedAt).toLocaleString()}</span>
        </div>
        <div className="info-group">
          <strong>Last Login:</strong> <span>{user.lastLoginDate ? new Date(user.lastLoginDate).toLocaleString() : 'Never'}</span>
        </div>
      </div>

      <div className="admin-actions section-divider">
        <h3>Role Management</h3>
        <div className="role-changer">
          <select value={newRole} onChange={e => setNewRole(e.target.value as UserRole)} disabled={user.isDeleted}>
            <option value="ADMIN">ADMIN</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
            <option value="CLIENT">CLIENT</option>
          </select>
          <button 
            className="btn btn-primary" 
            onClick={handleRoleChange} 
            disabled={changingRole || user.isDeleted || user.role === newRole}
          >
            {changingRole ? 'Saving...' : 'Update Role'}
          </button>
        </div>
        {user.isDeleted && <p className="text-muted"><small>Cannot change role of a deleted user.</small></p>}
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        title="Confirm Role Change"
        message={`Are you sure you want to change this user's role to ${newRole}?`}
        confirmText="Confirm"
        confirmStyle="primary"
        onConfirm={executeRoleChange}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default UserDetail;
