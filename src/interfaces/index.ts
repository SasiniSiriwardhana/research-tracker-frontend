// ============================================================
// API Response Wrapper
// Mirrors: lk.ijse.cmjd.research_tracker.common.ApiResponse
// ============================================================
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================================
// AUTH DTOs
// Mirrors: AuthResponse, LoginRequest, RegisterRequest
// ============================================================
export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  username: string;
  role: UserRole;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
}

// ============================================================
// ENUMS
// Mirrors: UserRole, Status
// ============================================================
export type UserRole = 'ADMIN' | 'PI' | 'MEMBER' | 'VIEWER';

export type ProjectStatus =
  | 'PLANNING'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'ARCHIVED';

// ============================================================
// PROJECT DTO
// Mirrors: ProjectDTO
// ============================================================
export interface ProjectDTO {
  id?: string;
  title: string;
  summary?: string;
  status: ProjectStatus;
  piId: string;
  piName?: string;
  tags?: string;
  startDate?: string; // LocalDate → ISO string "YYYY-MM-DD"
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// MILESTONE DTO
// Mirrors: MilestoneDTO
// ============================================================
export interface MilestoneDTO {
  id?: string;
  projectId?: string;
  title: string;
  description?: string;
  dueDate?: string; // LocalDate → ISO string "YYYY-MM-DD"
  isCompleted?: boolean;
  createdById?: string;
  createdByName?: string;
}

// ============================================================
// DOCUMENT DTO
// Mirrors: DocumentDTO
// ============================================================
export interface DocumentDTO {
  id?: string;
  projectId?: string;
  title: string;
  description?: string;
  urlOrPath: string;
  uploadedById?: string;
  uploadedByName?: string;
  uploadedAt?: string; // LocalDateTime → ISO string
}

// ============================================================
// USER DTO
// Mirrors: UserDTO
// ============================================================
export interface UserDTO {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  createdAt?: string; // LocalDateTime → ISO string
}

// ============================================================
// Auth Context State
// ============================================================
export interface AuthUser {
  token: string;
  userId: string;
  username: string;
  role: UserRole;
}
