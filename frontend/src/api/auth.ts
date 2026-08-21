import { client, handleApiError } from './client';
import { User, UserLogin, UserRegister } from '@/types';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authApi = {
  register: async (data: UserRegister): Promise<User> => {
    try {
      const res = await client.post<User>('/auth/register', data);
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  login: async (data: UserLogin): Promise<LoginResponse> => {
    try {
      const res = await client.post<LoginResponse>('/auth/login', data);
      localStorage.setItem('kf_access_token', res.data.access_token);
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  logout: () => {
    localStorage.removeItem('kf_access_token');
  },

  me: async (): Promise<User> => {
    try {
      const res = await client.get<User>('/auth/me');
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    try {
      const res = await client.post<{ message: string }>('/auth/forgot-password', { email });
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  resetPassword: async (token: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> => {
    try {
      const res = await client.post<{ message: string }>('/auth/reset-password', {
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  googleLogin: async (token: string): Promise<LoginResponse> => {
    try {
      const res = await client.post<LoginResponse>('/auth/google', { token });
      localStorage.setItem('kf_access_token', res.data.access_token);
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
