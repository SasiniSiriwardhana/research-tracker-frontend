import axiosInstance from './axiosInstance';
import { ApiResponse, DocumentDTO } from '../interfaces';

// ============================================================
// Document Service
// Documents are scoped to a project.
// GET    /api/projects/:id/documents  → getDocumentsByProject
// POST   /api/projects/:id/documents  → createDocument (ADMIN|PI|MEMBER)
// DELETE /api/documents/:id           → deleteDocument  (ADMIN|PI)
// ============================================================

export const getDocumentsByProject = async (projectId: string): Promise<DocumentDTO[]> => {
  const response = await axiosInstance.get<ApiResponse<DocumentDTO[]>>(
    `/api/projects/${projectId}/documents`
  );
  return response.data.data;
};

export const createDocument = async (
  projectId: string,
  data: DocumentDTO
): Promise<DocumentDTO> => {
  const response = await axiosInstance.post<ApiResponse<DocumentDTO>>(
    `/api/projects/${projectId}/documents`,
    data
  );
  return response.data.data;
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  await axiosInstance.delete(`/api/documents/${documentId}`);
};
