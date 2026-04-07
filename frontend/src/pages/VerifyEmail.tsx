import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { userApi } from '../api/userApi';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Missing verification token.');
        return;
      }

      try {
        await userApi.verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now log in.');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may be expired.');
      }
    };

    verifyToken();
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-100">
        {status === 'loading' && (
          <div className="animate-pulse">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h2>
            <p className="text-gray-600">Please wait while we confirm your account...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-fade-in">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Account Verified!</h2>
            <p className="text-gray-600 mb-10 leading-relaxed font-medium">
              {message}
            </p>
            <Link 
              to="/login" 
              className="group w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Go to Login
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-shake">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6 shadow-inner">
              <XCircle size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Verification Failed</h2>
            <p className="text-red-600 mb-10 leading-relaxed font-bold">
              {message}
            </p>
            <Link 
              to="/register" 
              className="inline-block text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
            >
              Try Registering Again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
