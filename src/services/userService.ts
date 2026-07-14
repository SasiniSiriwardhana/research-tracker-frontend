import axiosInstance from './axiosInstance';
import { ApiResponse, UserDTO } from '../interfaces';

// ============================================================
// User Service (Admin Only)
// GET    /api/users       → getAllUsers (ADMIN)
// GET    /api/users/:id   → getUserById
// DELETE /api/users/:id   → deleteUser  (ADMIN)
// ============================================================

export const getAllUsers = async (): Promise<UserDTO[]> => {
  const response = await axiosInstance.get<ApiResponse<UserDTO[]>>('/api/users');
  return response.data.data;
};

export const getUserById = async (id: string): Promise<UserDTO> => {
  const response = await axiosInstance.get<ApiResponse<UserDTO>>(`/api/users/${id}`);
  return response.data.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/users/${id}`);
};
