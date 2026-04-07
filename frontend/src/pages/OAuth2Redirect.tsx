import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const OAuth2Redirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // We might need a separate method for token-only login

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      // Store token and handle auth state
      localStorage.setItem('kredia_token', token);
      
      // Parse token to get user info
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedToken = JSON.parse(jsonPayload);
        const userId = decodedToken.sub;
        const role = decodedToken.role;

        localStorage.setItem('kredia_actor_id', userId);
        localStorage.setItem('kredia_role', role);
        localStorage.setItem('kredia_user_id', userId);

        // Redirect to appropriate dashboard
        window.location.href = role === 'ADMIN' ? '/admin' : role === 'AGENT' ? '/agent' : '/client';
      } catch (e) {
        console.error('Error parsing OAuth2 token', e);
        navigate('/login?error=oauth2_failed');
      }
    } else {
      navigate('/login?error=token_missing');
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Authenticating...</h2>
        <p className="text-gray-600">Please wait while we finalize your secure connection.</p>
      </div>
    </div>
  );
};

export default OAuth2Redirect;
