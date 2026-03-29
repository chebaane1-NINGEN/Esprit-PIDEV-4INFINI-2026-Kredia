import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserResponseDTO } from '../types/user.types';
import { userApi } from '../api/userApi';

interface AuthContextType {
  currentUser: UserResponseDTO | null;
  isLoading: boolean;
  login: (userId: number) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const actorId = localStorage.getItem('kredia_actor_id');
    if (actorId) {
      // Fetch user profile on load to verify actor ID exists
      userApi.getById(Number(actorId))
        .then(user => setCurrentUser(user))
        .catch(() => {
          localStorage.removeItem('kredia_actor_id');
          setCurrentUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (userId: number) => {
    try {
      setIsLoading(true);
      const user = await userApi.getById(userId);
      setCurrentUser(user);
      localStorage.setItem('kredia_actor_id', String(userId));
    } catch (err) {
      console.error('Login failed', err);
      throw new Error('User not found or API error');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('kredia_actor_id');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout }}>
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
