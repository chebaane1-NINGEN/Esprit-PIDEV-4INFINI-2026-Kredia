import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserResponseDTO, UserRole, UserStatus } from '../../types/user.types';
import { userApi } from '../../api/userApi';
import { useToast } from '../../contexts/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal';

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    userId: number;
    actionType: 'block' | 'activate' | 'suspend' | 'deactivate' | 'restore' | 'delete';
  }>({ isOpen: false, userId: 0, actionType: 'block' });
  
  // Filters
  const [role, setRole] = useState<UserRole | ''>('');
  const [status, setStatus] = useState<UserStatus | ''>('');
  const [email, setEmail] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userApi.search({
        role: role || undefined,
        status: status || undefined,
        email: email || undefined,
        page,
        size: 10
      });
      setUsers(res.content);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Error fetching users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role, status, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const executeAction = async () => {
    const { userId, actionType } = confirmState;
    try {
      if (actionType === 'delete') {
        await userApi.delete(userId);
      } else {
        switch(actionType) {
          case 'block': await userApi.block(userId); break;
          case 'activate': await userApi.activate(userId); break;
          case 'suspend': await userApi.suspend(userId); break;
          case 'deactivate': await userApi.deactivate(userId); break;
          case 'restore': await userApi.restore(userId); break;
        }
      }
      addToast(`Action '${actionType}' completed successfully.`, 'success');
      fetchUsers();
    } catch(err: any) {
      addToast(err.response?.data?.message || `Action failed. Cannot ${actionType} user.`, 'error');
    } finally {
      setConfirmState({ ...confirmState, isOpen: false });
    }
  };

  const requestAction = (id: number, action: 'block' | 'activate' | 'suspend' | 'deactivate' | 'restore' | 'delete') => {
    setConfirmState({ isOpen: true, userId: id, actionType: action });
  };

  return (
    <div className="users-list">
      <div className="filter-bar card">
        <form onSubmit={handleSearch} className="filters">
          <input 
            type="text" 
            placeholder="Search email..." 
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <select value={role} onChange={e => { setRole(e.target.value as UserRole | ''); setPage(0); }}>
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="CLIENT">Client</option>
          </select>
          <select value={status} onChange={e => { setStatus(e.target.value as UserStatus | ''); setPage(0); }}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="BLOCKED">Blocked</option>
          </select>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      <div className="table-responsive card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center">No users found.</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className={user.isDeleted ? 'row-deleted' : ''}>
                  <td>{user.id}</td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td><span className={`badge badge-${user.role.toLowerCase()}`}>{user.role}</span></td>
                  <td>
                    <span className={`badge bg-${user.status.toLowerCase()}`}>
                      {user.isDeleted ? 'DELETED' : user.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <Link to={`/admin/users/${user.id}`} className="btn btn-sm btn-outline mr-2">View</Link>
                    
                    {user.isDeleted ? (
                      <button onClick={() => requestAction(user.id, 'restore')} className="btn btn-sm btn-outline">Restore</button>
                    ) : (
                      <div className="btn-group">
                        {user.status !== 'ACTIVE' && (
                           <button onClick={() => requestAction(user.id, 'activate')} className="btn btn-sm btn-success">Activate</button>
                        )}
                        {user.status === 'ACTIVE' && (
                           <button onClick={() => requestAction(user.id, 'suspend')} className="btn btn-sm btn-warning text-white">Suspend</button>
                        )}
                        {user.status !== 'BLOCKED' && (
                           <button onClick={() => requestAction(user.id, 'block')} className="btn btn-sm btn-danger">Block</button>
                        )}
                        <button onClick={() => requestAction(user.id, 'delete')} className="btn btn-sm btn-danger ml-2">🗑</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Previous</button>
            <span>Page {page + 1} of {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title="Confirm Action"
        message={`Are you sure you want to ${confirmState.actionType} this user?`}
        confirmText="Confirm"
        confirmStyle={confirmState.actionType === 'activate' || confirmState.actionType === 'restore' ? 'success' : 'danger'}
        onConfirm={executeAction}
        onCancel={() => setConfirmState({ ...confirmState, isOpen: false })}
      />
    </div>
  );
};

export default UsersList;
