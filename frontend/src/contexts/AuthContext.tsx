import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserResponseDTO, UserRole, UserStatus } from '../types/user.types';
import { userApi } from '../api/userApi';

const MAX_LOADING_TIME = 8000; // 8 seconds max loading time

// RBAC Permissions Configuration
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_VIEW', 'VIEW_AUDIT', 
    'MANAGE_ROLES', 'BULK_ACTIONS', 'EXPORT_DATA', 'SYSTEM_SETTINGS'
  ],
  [UserRole.AGENT]: [
    'CLIENT_CREATE', 'CLIENT_UPDATE', 'CLIENT_VIEW', 'VIEW_OWN_CLIENTS',
    'ADD_NOTES', 'VIEW_PERFORMANCE', 'PROCESS_APPLICATIONS'
  ],
  [UserRole.CLIENT]: [
    'PROFILE_VIEW', 'PROFILE_UPDATE', 'VIEW_OWN_DATA'
  ]
};

interface AuthContextType {
  currentUser: UserResponseDTO | null;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: any) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Safety timeout
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (isLoading) {
        console.warn('[AuthContext] Safety timeout reached');
        setIsLoading(false);
      }
    }, MAX_LOADING_TIME);
    return () => clearTimeout(safetyTimer);
  }, [isLoading]);

  // Init Auth
  useEffect(() => {
    const initAuth = async () => {
      const actorId = localStorage.getItem('kredia_actor_id');
      const token = localStorage.getItem('kredia_token');
      
      if (!actorId || !token) {
        setIsLoading(false);
        return;
      }
      
      try {
        const user = await userApi.getById(Number(actorId), Number(actorId));
        setCurrentUser(user);
      } catch (err: any) {
        localStorage.removeItem('kredia_actor_id');
        localStorage.removeItem('kredia_token');
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const authResponse = await userApi.login(email, password);
      const token = authResponse.token;
      localStorage.setItem('kredia_token', token);
      
      // Parse token
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decodedToken = JSON.parse(jsonPayload);
      const userId = Number(decodedToken.sub);
      const userRole = decodedToken.role;
      
      const user = await userApi.getById(userId, userId);
      setCurrentUser(user);
      
      // Store essential info in localStorage for fast access/RBAC
      localStorage.setItem('kredia_actor_id', String(userId));
      localStorage.setItem('kredia_role', userRole);
      localStorage.setItem('kredia_user_id', String(userId));
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (formData: any) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await userApi.register(formData);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('kredia_actor_id');
    localStorage.removeItem('kredia_token');
    localStorage.removeItem('kredia_role');
    localStorage.removeItem('kredia_user_id');
    setCurrentUser(null);
    setAuthError(null);
  }, []);

  const loginWithGoogle = async () => {
    console.log('Google login requested');
    // Implement redirect to Google OAuth
  };

  const loginWithGithub = async () => {
    console.log('GitHub login requested');
    // Implement redirect to GitHub OAuth
  };

  const hasRole = (role: UserRole) => currentUser?.role === role;

  const hasPermission = (permission: string) => {
    if (!currentUser) return false;
    return ROLE_PERMISSIONS[currentUser.role]?.includes(permission) || false;
  };

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isLoading, 
      authError,
      login, 
      register,
      logout,
      loginWithGoogle,
      loginWithGithub,
      hasRole,
      hasPermission,
      clearAuthError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
