import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserResponseDTO } from '../../types/user.types';
import { userApi } from '../../api/userApi';
import { useToast } from '../../contexts/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal';

const SecurityKyc: React.FC = () => {
  const [clients, setClients] = useState<UserResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const [kycFilter, setKycFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');
  
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    userId: number;
    actionType: 'suspend' | 'activate';
  }>({ isOpen: false, userId: 0, actionType: 'suspend' });

  const fetchClients = async () => {
    try {
      setLoading(true);
      // Fetch the first 50 clients to allow good local filtering coverage
      const res = await userApi.getAdminClients({ page: 0, size: 50 });
      setClients(res.content || []);
    } catch (err) {
      addToast('Failed to load clients for KYC review.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const executeAction = async () => {
    const { userId, actionType } = confirmState;
    try {
      if (actionType === 'suspend') {
        await userApi.suspend(userId);
      } else {
        await userApi.activate(userId);
      }
      addToast(`User ${actionType}ed successfully.`, 'success');
      fetchClients();
    } catch(err: any) {
      addToast(err.response?.data?.message || `Action failed.`, 'error');
    } finally {
      setConfirmState({ ...confirmState, isOpen: false });
    }
  };

  const requestAction = (id: number, action: 'suspend' | 'activate') => {
    setConfirmState({ isOpen: true, userId: id, actionType: action });
  };

  const filteredClients = clients.filter(c => {
    if (kycFilter === 'VERIFIED') return c.kycVerified === true;
    if (kycFilter === 'UNVERIFIED') return c.kycVerified === false;
    return true;
  });

  return (
    <div className="security-kyc wow fadeInUp">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Security & KYC Management</h2>
          <p className="text-muted">Review client compliance and manage platform access</p>
        </div>
      </div>

      <div className="card filter-bar mb-6">
        <div className="filters">
          <select value={kycFilter} onChange={e => setKycFilter(e.target.value as any)} className="form-control">
            <option value="ALL">All KYC Statuses</option>
            <option value="VERIFIED">KYC Verified ✅</option>
            <option value="UNVERIFIED">KYC Unverified / Pending ⏳</option>
          </select>
          <div className="text-muted ml-auto text-sm">
            Showing {filteredClients.length} clients
          </div>
        </div>
      </div>

      <div className="card p-0">
        <div className="table-responsive">
          <table className="table m-0">
            <thead className="bg-light">
              <tr>
                <th>ID</th>
                <th>Client Info</th>
                <th>KYC Status</th>
                <th>Account Security</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">
                  <div className="spinner inline-block"></div>
                </td></tr>
              ) : filteredClients.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted">No clients correspond to this filter criteria.</td></tr>
              ) : (
                filteredClients.map(client => (
                  <tr key={client.id}>
                    <td>{client.id}</td>
                    <td>
                      <div className="font-medium">{client.firstName} {client.lastName}</div>
                      <div className="text-xs text-muted">{client.email}</div>
                    </td>
                    <td>
                      {client.kycVerified ? (
                        <span className="badge bg-success">VERIFIED</span>
                      ) : (
                        <span className="badge bg-warning text-white">PENDING REVIEW</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge bg-${client.status.toLowerCase()}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <Link to={`/admin/users/${client.id}`} className="btn btn-sm btn-outline mr-2">Details</Link>
                      {client.status === 'ACTIVE' ? (
                        <button onClick={() => requestAction(client.id, 'suspend')} className="btn btn-sm btn-warning text-white">Suspend</button>
                      ) : (
                        <button onClick={() => requestAction(client.id, 'activate')} className="btn btn-sm btn-success text-white">Re-activate</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={`Confirm ${confirmState.actionType === 'suspend' ? 'Suspension' : 'Activation'}`}
        message={`Are you sure you want to ${confirmState.actionType} this user's account?`}
        confirmText="Confirm"
        confirmStyle={confirmState.actionType === 'suspend' ? 'danger' : 'success'}
        onConfirm={executeAction}
        onCancel={() => setConfirmState({ ...confirmState, isOpen: false })}
      />
    </div>
  );
};

export default SecurityKyc;
