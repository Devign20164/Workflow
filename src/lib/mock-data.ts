import { Request, Profile, TimelineEntry, Comment, Notification, DashboardStats, RequestType, RequestStatus, RequestPriority, AppRole } from '@/types/workflow';

// Mock profiles
export const mockProfiles: Profile[] = [
  {
    id: '1',
    user_id: 'user-1',
    email: 'john.smith@company.com',
    full_name: 'John Smith',
    department: 'Engineering',
    avatar_url: undefined,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    user_id: 'user-2',
    email: 'sarah.johnson@company.com',
    full_name: 'Sarah Johnson',
    department: 'Engineering',
    avatar_url: undefined,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    user_id: 'user-3',
    email: 'mike.chen@company.com',
    full_name: 'Mike Chen',
    department: 'Finance',
    avatar_url: undefined,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    user_id: 'user-4',
    email: 'emma.wilson@company.com',
    full_name: 'Emma Wilson',
    department: 'HR',
    avatar_url: undefined,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    user_id: 'user-5',
    email: 'david.brown@company.com',
    full_name: 'David Brown',
    department: 'IT',
    avatar_url: undefined,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Mock requests
export const mockRequests: Request[] = [
  {
    id: 'req-1',
    title: 'New MacBook Pro for Development',
    description: 'Requesting a new MacBook Pro M3 for development work. Current machine is 4 years old and struggling with build times.',
    request_type: 'purchase',
    status: 'pending_approval',
    priority: 'high',
    requester_id: 'user-1',
    department: 'Engineering',
    estimated_cost: 2499.00,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    requester: mockProfiles[0],
  },
  {
    id: 'req-2',
    title: 'Annual Leave Request - March',
    description: 'Requesting 5 days of annual leave from March 15-19 for a family vacation.',
    request_type: 'leave',
    status: 'approved',
    priority: 'medium',
    requester_id: 'user-2',
    assigned_to: 'user-4',
    department: 'Engineering',
    due_date: '2024-03-15',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-12T14:30:00Z',
    requester: mockProfiles[1],
    assignee: mockProfiles[3],
  },
  {
    id: 'req-3',
    title: 'VPN Access Not Working',
    description: 'Unable to connect to company VPN since yesterday. Getting authentication errors.',
    request_type: 'it_support',
    status: 'in_progress',
    priority: 'urgent',
    requester_id: 'user-1',
    assigned_to: 'user-5',
    department: 'Engineering',
    created_at: '2024-01-14T08:15:00Z',
    updated_at: '2024-01-14T11:00:00Z',
    requester: mockProfiles[0],
    assignee: mockProfiles[4],
  },
  {
    id: 'req-4',
    title: 'Office Supplies - Q1 2024',
    description: 'Monthly office supplies order including notebooks, pens, and printer paper.',
    request_type: 'purchase',
    status: 'completed',
    priority: 'low',
    requester_id: 'user-4',
    assigned_to: 'user-3',
    department: 'HR',
    estimated_cost: 350.00,
    created_at: '2024-01-05T11:00:00Z',
    updated_at: '2024-01-08T16:00:00Z',
    requester: mockProfiles[3],
    assignee: mockProfiles[2],
  },
  {
    id: 'req-5',
    title: 'Sick Leave - January 16',
    description: 'Taking sick leave due to flu. Will work from home if feeling better.',
    request_type: 'leave',
    status: 'submitted',
    priority: 'medium',
    requester_id: 'user-5',
    department: 'IT',
    due_date: '2024-01-16',
    created_at: '2024-01-16T07:30:00Z',
    updated_at: '2024-01-16T07:30:00Z',
    requester: mockProfiles[4],
  },
  {
    id: 'req-6',
    title: 'Monitor Upgrade Request',
    description: 'Requesting dual 27-inch monitors for improved productivity.',
    request_type: 'purchase',
    status: 'rejected',
    priority: 'medium',
    requester_id: 'user-2',
    department: 'Engineering',
    estimated_cost: 800.00,
    created_at: '2024-01-08T14:20:00Z',
    updated_at: '2024-01-10T09:15:00Z',
    requester: mockProfiles[1],
  },
  {
    id: 'req-7',
    title: 'Software License - Figma',
    description: 'Annual Figma license renewal for the design team.',
    request_type: 'purchase',
    status: 'approved',
    priority: 'high',
    requester_id: 'user-2',
    assigned_to: 'user-3',
    department: 'Engineering',
    estimated_cost: 1200.00,
    created_at: '2024-01-12T13:45:00Z',
    updated_at: '2024-01-14T10:00:00Z',
    requester: mockProfiles[1],
    assignee: mockProfiles[2],
  },
  {
    id: 'req-8',
    title: 'Password Reset - Email Account',
    description: 'Forgot email password and need it reset.',
    request_type: 'it_support',
    status: 'completed',
    priority: 'high',
    requester_id: 'user-3',
    assigned_to: 'user-5',
    department: 'Finance',
    created_at: '2024-01-13T09:00:00Z',
    updated_at: '2024-01-13T09:30:00Z',
    requester: mockProfiles[2],
    assignee: mockProfiles[4],
  },
];

// Mock timeline entries
export const mockTimeline: TimelineEntry[] = [
  {
    id: 'tl-1',
    request_id: 'req-1',
    action: 'Request created',
    new_status: 'submitted',
    actor_id: 'user-1',
    notes: 'Request submitted for review',
    created_at: '2024-01-15T10:30:00Z',
    actor: mockProfiles[0],
  },
  {
    id: 'tl-2',
    request_id: 'req-1',
    action: 'Status changed',
    previous_status: 'submitted',
    new_status: 'pending_approval',
    actor_id: 'user-2',
    notes: 'Forwarded to manager for approval',
    created_at: '2024-01-15T11:00:00Z',
    actor: mockProfiles[1],
  },
];

// Mock comments
export const mockComments: Comment[] = [
  {
    id: 'cmt-1',
    request_id: 'req-1',
    author_id: 'user-2',
    content: 'This looks reasonable. I\'ll forward to finance for budget approval.',
    is_internal: false,
    created_at: '2024-01-15T11:00:00Z',
    updated_at: '2024-01-15T11:00:00Z',
    author: mockProfiles[1],
  },
  {
    id: 'cmt-2',
    request_id: 'req-1',
    author_id: 'user-3',
    content: 'Budget looks okay for Q1. Approve from finance side.',
    is_internal: true,
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z',
    author: mockProfiles[2],
  },
];

// Mock notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'user-1',
    title: 'Request Update',
    message: 'Your purchase request "New MacBook Pro" is pending approval.',
    request_id: 'req-1',
    is_read: false,
    created_at: '2024-01-15T11:00:00Z',
  },
  {
    id: 'notif-2',
    user_id: 'user-1',
    title: 'IT Support Update',
    message: 'Your VPN issue is being investigated by David Brown.',
    request_id: 'req-3',
    is_read: false,
    created_at: '2024-01-14T11:00:00Z',
  },
  {
    id: 'notif-3',
    user_id: 'user-1',
    title: 'Comment Added',
    message: 'Sarah Johnson commented on your purchase request.',
    request_id: 'req-1',
    is_read: true,
    created_at: '2024-01-15T11:05:00Z',
  },
];

// Mock dashboard stats
export const mockDashboardStats: DashboardStats = {
  totalRequests: 8,
  pendingApprovals: 2,
  inProgress: 1,
  completedThisMonth: 2,
  requestsByType: [
    { type: 'purchase', count: 4 },
    { type: 'leave', count: 2 },
    { type: 'it_support', count: 2 },
  ],
  requestsByStatus: [
    { status: 'submitted', count: 1 },
    { status: 'pending_approval', count: 1 },
    { status: 'approved', count: 2 },
    { status: 'rejected', count: 1 },
    { status: 'in_progress', count: 1 },
    { status: 'completed', count: 2 },
  ],
  recentRequests: mockRequests.slice(0, 5),
};

// Current mock user (for demo purposes)
export const mockCurrentUser: Profile = mockProfiles[0];
export const mockCurrentUserRole: AppRole = 'manager';

// Helper functions
export function getStatusLabel(status: RequestStatus): string {
  const labels: Record<RequestStatus, string> = {
    submitted: 'Submitted',
    pending_approval: 'Pending Approval',
    approved: 'Approved',
    rejected: 'Rejected',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return labels[status];
}

export function getPriorityLabel(priority: RequestPriority): string {
  const labels: Record<RequestPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  };
  return labels[priority];
}

export function getTypeLabel(type: RequestType): string {
  const labels: Record<RequestType, string> = {
    purchase: 'Purchase Request',
    leave: 'Leave Request',
    it_support: 'IT Support',
  };
  return labels[type];
}

export function getRoleLabel(role: AppRole): string {
  const labels: Record<AppRole, string> = {
    employee: 'Employee',
    manager: 'Manager',
    finance: 'Finance',
    hr: 'Human Resources',
    it: 'IT Support',
    admin: 'Administrator',
  };
  return labels[role];
}
