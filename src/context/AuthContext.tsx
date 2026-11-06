import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: Partial<User> & { password?: string; inviteToken?: string }) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  updateUser: (user: User) => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  switchDemoUser: (role: 'super_admin' | 'admin' | 'member' | 'pending') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('gaikwad_auth_token'));

  // Load user on start
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('gaikwad_auth_token');
      if (storedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentUser(data.user);
            return;
          }
        } catch {
          // Fall through
        }
      }

      // Default initial session: Kunal Saxena (Super Admin) for immediate full website preview and access
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: '04227kunalsaxena@gmail.com' })
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          setToken(data.token);
          localStorage.setItem('gaikwad_auth_token', data.token);
        }
      } catch (err) {
        console.error('Initial auth load failed', err);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, _password?: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem('gaikwad_auth_token', data.token);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error during login' };
    }
  };

  const register = async (data: Partial<User> & { password?: string; inviteToken?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Registration failed' };
      }
      if (resData.user) {
        setCurrentUser(resData.user);
        if (resData.token) {
          setToken(resData.token);
          localStorage.setItem('gaikwad_auth_token', resData.token);
        }
      }
      return { success: true, message: resData.message };
    } catch {
      return { success: false, error: 'Network error during registration' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('gaikwad_auth_token');
  };

  const updateUser = (user: User) => {
    setCurrentUser(user);
  };

  const switchDemoUser = async (targetRole: 'super_admin' | 'admin' | 'member' | 'pending') => {
    let email = '04227kunalsaxena@gmail.com'; // super_admin
    if (targetRole === 'admin') email = 'shankarrao@gaikwadfamily.org';
    if (targetRole === 'member') email = 'priya@gaikwadfamily.org';
    if (targetRole === 'pending') {
      // Create or switch to a pending demo user
      setCurrentUser({
        id: 'u-pending-demo',
        name: 'Vikas Gaikwad',
        email: 'vikas@gaikwadfamily.org',
        role: 'member',
        status: 'pending',
        relationship: 'Cousin (Pending Approval)',
        relationshipHindi: 'चचेरा भाई (मंज़ूरी लंबित)',
        createdAt: new Date().toISOString()
      });
      return;
    }
    await login(email);
  };

  const isSuperAdmin = currentUser?.role === 'super_admin' && currentUser?.status === 'approved';
  const isAdmin = (currentUser?.role === 'admin' || currentUser?.role === 'super_admin') && currentUser?.status === 'approved';
  const isApproved = currentUser?.status === 'approved';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        login,
        register,
        logout,
        updateUser,
        isSuperAdmin: !!isSuperAdmin,
        isAdmin: !!isAdmin,
        isApproved: !!isApproved,
        switchDemoUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
