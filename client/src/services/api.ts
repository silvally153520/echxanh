import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Cookies are automatically sent with withCredentials: true
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const requestUrl = originalRequest?.url || '';

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !requestUrl.startsWith('/auth/')
    ) {
      originalRequest._retry = true;

      try {
        await api.post('/auth/refresh');
        return api(originalRequest);
      } catch (refreshError) {
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.assign('/login');
        }
        return Promise.reject(refreshError);
      }
    }

    // Format error message
    const message = error.response?.data?.error || error.message || 'An error occurred';
    const formattedError = new Error(message) as Error & { code?: string; details?: ApiError['details'] };
    formattedError.code = error.response?.data?.code;
    formattedError.details = error.response?.data?.details;

    return Promise.reject(formattedError);
  }
);

export default api;

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name: string; phone?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) =>
    api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/reset-password', data),
};

// Properties API
export const propertiesApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/properties', { params }),
  getOne: (id: string) =>
    api.get(`/properties/${id}`),
  checkAvailability: (id: string, checkIn: string, checkOut: string) =>
    api.get(`/properties/${id}/availability`, { params: { checkIn, checkOut } }),
  create: (data: FormData | Record<string, unknown>) =>
    api.post('/properties', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/properties/${id}`, data),
  delete: (id: string) =>
    api.delete(`/properties/${id}`),
  getHostProperties: (params?: Record<string, unknown>) =>
    api.get('/properties/host/me', { params }),
};

// Bookings API
export const bookingsApi = {
  getMyBookings: (params?: Record<string, unknown>) =>
    api.get('/bookings', { params }),
  getOne: (id: string) =>
    api.get(`/bookings/${id}`),
  create: (data: { propertyId: string; checkIn: string; checkOut: string; guests: number }) =>
    api.post('/bookings', data),
  cancel: (id: string) =>
    api.put(`/bookings/${id}/cancel`),
  confirm: (id: string) =>
    api.put(`/bookings/${id}/confirm`),
  complete: (id: string) =>
    api.put(`/bookings/${id}/complete`),
  getHostBookings: (params?: Record<string, unknown>) =>
    api.get('/bookings/host/me', { params }),
  getHostEarnings: (params?: Record<string, unknown>) =>
    api.get('/bookings/host/earnings', { params }),
};

// Admin API
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: Record<string, unknown>) =>
    api.get('/admin/users', { params }),
  updateUserRole: (id: string, role: string) =>
    api.put(`/admin/users/${id}/role`, { role }),
  toggleUserBan: (id: string) =>
    api.put(`/admin/users/${id}/ban`),
  getProperties: (params?: Record<string, unknown>) =>
    api.get('/admin/properties', { params }),
  updatePropertyStatus: (id: string, status: string) =>
    api.put(`/admin/properties/${id}/status`, { status }),
  getBookings: (params?: Record<string, unknown>) =>
    api.get('/admin/bookings', { params }),
  getRevenue: (params?: Record<string, unknown>) =>
    api.get('/admin/revenue', { params }),
};