export type RequestType = 'purchase' | 'leave' | 'it_support';
export type RequestStatus = 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AppRole = 'employee' | 'manager' | 'finance' | 'hr' | 'it' | 'admin';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  department: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Request {
  id: string;
  title: string;
  description?: string;
  request_type: RequestType;
  status: RequestStatus;
  priority: RequestPriority;
  requester_id: string;
  assigned_to?: string;
  department: string;
  estimated_cost?: number;
  attachments?: string[];
  metadata?: Record<string, unknown>;
  due_date?: string;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  assignee?: Profile;
}

export interface TimelineEntry {
  id: string;
  request_id: string;
  action: string;
  previous_status?: RequestStatus;
  new_status?: RequestStatus;
  actor_id?: string;
  notes?: string;
  created_at: string;
  actor?: Profile;
}

export interface Comment {
  id: string;
  request_id: string;
  author_id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  request_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalRequests: number;
  pendingApprovals: number;
  inProgress: number;
  completedThisMonth: number;
  requestsByType: { type: RequestType; count: number }[];
  requestsByStatus: { status: RequestStatus; count: number }[];
  recentRequests: Request[];
}
