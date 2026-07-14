import axiosInstance from './axiosInstance';
import { ApiResponse, MilestoneDTO } from '../interfaces';

// ============================================================
// Milestone Service
// Milestones are scoped to a project.
// GET    /api/projects/:id/milestones  → getMilestonesByProject
// POST   /api/projects/:id/milestones  → createMilestone (ADMIN|PI|MEMBER)
// PUT    /api/milestones/:id           → updateMilestone  (ADMIN|PI|MEMBER)
// DELETE /api/milestones/:id           → deleteMilestone  (ADMIN|PI)
// ============================================================

export const getMilestonesByProject = async (projectId: string): Promise<MilestoneDTO[]> => {
  const response = await axiosInstance.get<ApiResponse<MilestoneDTO[]>>(
    `/api/projects/${projectId}/milestones`
  );
  return response.data.data;
};

export const createMilestone = async (
  projectId: string,
  data: MilestoneDTO
): Promise<MilestoneDTO> => {
  const response = await axiosInstance.post<ApiResponse<MilestoneDTO>>(
    `/api/projects/${projectId}/milestones`,
    data
  );
  return response.data.data;
};

export const updateMilestone = async (
  milestoneId: string,
  data: MilestoneDTO
): Promise<MilestoneDTO> => {
  const response = await axiosInstance.put<ApiResponse<MilestoneDTO>>(
    `/api/milestones/${milestoneId}`,
    data
  );
  return response.data.data;
};

export const deleteMilestone = async (milestoneId: string): Promise<void> => {
  await axiosInstance.delete(`/api/milestones/${milestoneId}`);
};
