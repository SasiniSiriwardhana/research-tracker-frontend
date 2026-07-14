import axiosInstance from './axiosInstance';
import { ApiResponse, ProjectDTO, ProjectStatus } from '../interfaces';

// ============================================================
// Project Service
// GET    /api/projects          → getAllProjects
// GET    /api/projects/:id      → getProjectById
// POST   /api/projects          → createProject  (ADMIN | PI)
// PUT    /api/projects/:id      → updateProject  (ADMIN | PI)
// PATCH  /api/projects/:id/status → updateStatus (ADMIN | PI)
// DELETE /api/projects/:id      → deleteProject  (ADMIN only)
// ============================================================

export const getAllProjects = async (): Promise<ProjectDTO[]> => {
  const response = await axiosInstance.get<ApiResponse<ProjectDTO[]>>('/api/projects');
  return response.data.data;
};

export const getProjectById = async (id: string): Promise<ProjectDTO> => {
  const response = await axiosInstance.get<ApiResponse<ProjectDTO>>(`/api/projects/${id}`);
  return response.data.data;
};

export const createProject = async (data: ProjectDTO): Promise<ProjectDTO> => {
  const response = await axiosInstance.post<ApiResponse<ProjectDTO>>('/api/projects', data);
  return response.data.data;
};

export const updateProject = async (id: string, data: ProjectDTO): Promise<ProjectDTO> => {
  const response = await axiosInstance.put<ApiResponse<ProjectDTO>>(`/api/projects/${id}`, data);
  return response.data.data;
};

export const updateProjectStatus = async (id: string, status: ProjectStatus): Promise<ProjectDTO> => {
  const response = await axiosInstance.patch<ApiResponse<ProjectDTO>>(
    `/api/projects/${id}/status`,
    { status }
  );
  return response.data.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/projects/${id}`);
};
