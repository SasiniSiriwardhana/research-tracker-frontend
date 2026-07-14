import axiosInstance from './axiosInstance';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '../interfaces';

// ============================================================
// Auth Service
// Endpoints: POST /api/auth/signup | POST /api/auth/login
// ============================================================

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/api/auth/login', data);
  return response.data.data;
};

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/api/auth/signup', data);
  return response.data.data;
};
