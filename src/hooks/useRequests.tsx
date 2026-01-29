import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { RequestType, RequestStatus, RequestPriority } from '@/types/workflow';

interface CreateRequestInput {
  title: string;
  description?: string;
  request_type: RequestType;
  priority: RequestPriority;
  department: string;
  due_date?: string;
  estimated_cost?: number;
}

interface UpdateRequestInput {
  id: string;
  status?: RequestStatus;
  priority?: RequestPriority;
  assigned_to?: string;
  title?: string;
  description?: string;
}

export function useRequests(filters?: {
  type?: string;
  status?: string;
  priority?: string;
  search?: string;
  my?: boolean;
  userId?: string;
}) {
  return useQuery({
    queryKey: ['requests', filters],
    queryFn: async () => {
      let query = supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('request_type', filters.type as RequestType);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as RequestStatus);
      }
      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority as RequestPriority);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.my && filters.userId) {
        query = query.eq('requester_id', filters.userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch profiles for requesters
      const requesterIds = [...new Set(data?.map(r => r.requester_id) || [])];
      const assigneeIds = [...new Set(data?.filter(r => r.assigned_to).map(r => r.assigned_to!) || [])];
      const allUserIds = [...new Set([...requesterIds, ...assigneeIds])];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', allUserIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return data?.map(request => ({
        ...request,
        requester: profileMap.get(request.requester_id),
        assignee: request.assigned_to ? profileMap.get(request.assigned_to) : undefined,
      })) || [];
    },
  });
}

export function useRequest(id: string | undefined) {
  return useQuery({
    queryKey: ['request', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Fetch requester profile
      const { data: requesterProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.requester_id)
        .maybeSingle();

      // Fetch assignee profile if assigned
      let assigneeProfile = null;
      if (data.assigned_to) {
        const { data: assignee } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.assigned_to)
          .maybeSingle();
        assigneeProfile = assignee;
      }

      return {
        ...data,
        requester: requesterProfile,
        assignee: assigneeProfile,
      };
    },
    enabled: !!id,
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRequestInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('requests')
        .insert({
          ...input,
          requester_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Request submitted',
        description: 'Your request has been submitted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateRequestInput) => {
      const { data, error } = await supabase
        .from('requests')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['request', data.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useApproveRequest() {
  const updateRequest = useUpdateRequest();

  return useMutation({
    mutationFn: async (id: string) => {
      return updateRequest.mutateAsync({ id, status: 'approved' });
    },
    onSuccess: () => {
      toast({
        title: 'Request approved',
        description: 'The request has been approved successfully',
      });
    },
  });
}

export function useRejectRequest() {
  const updateRequest = useUpdateRequest();

  return useMutation({
    mutationFn: async (id: string) => {
      return updateRequest.mutateAsync({ id, status: 'rejected' });
    },
    onSuccess: () => {
      toast({
        title: 'Request rejected',
        description: 'The request has been rejected',
      });
    },
  });
}

export function useDashboardStats(userId?: string, role?: string) {
  return useQuery({
    queryKey: ['dashboard-stats', userId, role],
    queryFn: async () => {
      // Get all requests
      let query = supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: allRequests, error } = await query;

      if (error) throw error;

      // Filter requests based on Role scope
      let scopedRequests = allRequests || [];

      if (role === 'admin') {
        // Admin sees everything
        scopedRequests = allRequests || [];
      } else if (role === 'it') {
        // IT sees ALL IT Support requests
        scopedRequests = allRequests?.filter(r => r.request_type === 'it_support') || [];
      } else if (role === 'finance') {
        // Finance sees ALL Purchase requests
        scopedRequests = allRequests?.filter(r => r.request_type === 'purchase') || [];
      } else if (role === 'hr') {
        // HR sees ALL Leave requests
        scopedRequests = allRequests?.filter(r => r.request_type === 'leave') || [];
      } else {
        // Regular employees (and Managers for now) see only their OWN requests
        scopedRequests = allRequests?.filter(r => r.requester_id === userId) || [];
      }

      // Calculate stats based on the scoped requests
      const totalRequests = scopedRequests.length;
      
      const pendingApprovals = scopedRequests.filter(r => 
        r.status === 'pending_approval' || r.status === 'submitted'
      ).length;

      const inProgress = scopedRequests.filter(r => r.status === 'in_progress').length;
      
      // Completed this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const completedThisMonth = scopedRequests.filter(r => 
        r.status === 'completed' && 
        new Date(r.updated_at) >= startOfMonth
      ).length;

      // By type (for the scoped view)
      const requestsByType = [
        { type: 'purchase' as RequestType, count: scopedRequests.filter(r => r.request_type === 'purchase').length },
        { type: 'leave' as RequestType, count: scopedRequests.filter(r => r.request_type === 'leave').length },
        { type: 'it_support' as RequestType, count: scopedRequests.filter(r => r.request_type === 'it_support').length },
      ];

      // By status (for the scoped view)
      const requestsByStatus = [
        { status: 'submitted' as RequestStatus, count: scopedRequests.filter(r => r.status === 'submitted').length },
        { status: 'pending_approval' as RequestStatus, count: scopedRequests.filter(r => r.status === 'pending_approval').length },
        { status: 'approved' as RequestStatus, count: scopedRequests.filter(r => r.status === 'approved').length },
        { status: 'rejected' as RequestStatus, count: scopedRequests.filter(r => r.status === 'rejected').length },
        { status: 'in_progress' as RequestStatus, count: scopedRequests.filter(r => r.status === 'in_progress').length },
        { status: 'completed' as RequestStatus, count: scopedRequests.filter(r => r.status === 'completed').length },
      ];

      // Recent requests (from the scoped view)
      const recentRequests = scopedRequests.slice(0, 5);
      const requesterIds = [...new Set(recentRequests.map(r => r.requester_id))];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', requesterIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return {
        totalRequests,
        pendingApprovals,
        inProgress,
        completedThisMonth,
        requestsByType,
        requestsByStatus,
        recentRequests: recentRequests.map(r => ({
          ...r,
          requester: profileMap.get(r.requester_id),
        })),
        // Map simplified stats to the explicit keys if needed by UI
        createdRequestsCount: totalRequests, 
        assignedWorkCompletedCount: completedThisMonth,
      };
    },
  });
}

export function useRequestTimeline(requestId: string | undefined) {
  return useQuery({
    queryKey: ['request-timeline', requestId],
    queryFn: async () => {
      if (!requestId) return [];

      const { data, error } = await supabase
        .from('request_timeline')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch actor profiles
      const actorIds = [...new Set(data?.filter(t => t.actor_id).map(t => t.actor_id!) || [])];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', actorIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return data?.map(entry => ({
        ...entry,
        actor: entry.actor_id ? profileMap.get(entry.actor_id) : undefined,
      })) || [];
    },
    enabled: !!requestId,
  });
}

export function useRequestComments(requestId: string | undefined) {
  return useQuery({
    queryKey: ['request-comments', requestId],
    queryFn: async () => {
      if (!requestId) return [];

      const { data, error } = await supabase
        .from('request_comments')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch author profiles
      const authorIds = [...new Set(data?.map(c => c.author_id) || [])];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', authorIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return data?.map(comment => ({
        ...comment,
        author: profileMap.get(comment.author_id),
      })) || [];
    },
    enabled: !!requestId,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, content, isInternal }: { requestId: string; content: string; isInternal?: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('request_comments')
        .insert({
          request_id: requestId,
          author_id: user.id,
          content,
          is_internal: isInternal || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['request-comments', data.request_id] });
      toast({
        title: 'Comment added',
        description: 'Your comment has been added',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
