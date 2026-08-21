import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export const client = axios.create({
  baseURL: API_URL || '/',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('kf_access_token');
  if (token && config.headers) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kf_access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export type ApiError = {
  message: string;
  status?: number;
};

export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { detail?: string; message?: string } | undefined;
    return {
      message:
        data?.detail || data?.message || error.message || 'Something went wrong.',
      status: error.response?.status,
    };
  }
  if (error instanceof Error) return { message: error.message };
  return { message: 'Something went wrong.' };
}
