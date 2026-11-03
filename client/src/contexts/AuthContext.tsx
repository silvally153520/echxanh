import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../services/api';
import type { User, RegisterData, LoginData } from '../types';
import toast from 'react-hot-toast';
import { useUIStore } from '../store/uiStore';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { closeLogin, closeRegister } = useUIStore();

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.me();
      setUser(response.data.user);
    } catch (error) {
      const errorCode = error instanceof Error
        ? (error as Error & { code?: string }).code
        : undefined;
      if (errorCode === 'TOKEN_EXPIRED') {
        try {
          await authApi.refresh();
          const response = await authApi.me();
          setUser(response.data.user);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (data: LoginData) => {
    try {
      const response = await authApi.login(data);
      setUser(response.data.user);
      toast.success('Đăng nhập thành công!');
      closeLogin();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Đăng nhập thất bại'));
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      setUser(response.data.user);
      toast.success('Đăng ký thành công!');
      closeRegister();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Đăng ký thất bại'));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      toast.success('Đã đăng xuất');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Đăng xuất thất bại'));
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await authApi.updateProfile(data);
      setUser(response.data.user);
      toast.success('Cập nhật hồ sơ thành công');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Cập nhật thất bại'));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
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