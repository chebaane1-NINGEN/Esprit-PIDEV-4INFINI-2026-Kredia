import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// No UserRole import needed

export const RoleSelector: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setIsLoading(true);
      setError('');
      await login(Number(userId));
      
      // We don't have the user object here directly unless we change the signature,
      // but AuthContext handles setting currentUser. 
      // The AppRouter will redirect based on the role on the next render.
      navigate('/'); 
    } catch (err) {
      setError('Simulated login failed. Check if User ID exists.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Enter Kredia System</h2>
        <p className="login-subtitle">For local development, enter a User ID to assume their role.</p>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="userId">User ID</label>
            <input 
              id="userId"
              type="number" 
              value={userId} 
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. 1"
              required
              disabled={isLoading}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="btn btn-primary" disabled={isLoading || !userId}>
            {isLoading ? 'Connecting...' : 'Login Simulation'}
          </button>
        </form>
        
        <div className="login-hints">
          <h4>Hint - Default Users:</h4>
          <ul>
            <li><strong>ID 1:</strong> Admin</li>
            <li><strong>ID 2:</strong> Employee</li>
            <li><strong>ID 3:</strong> Client</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
