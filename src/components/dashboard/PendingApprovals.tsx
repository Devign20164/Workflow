import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/workflow/StatusBadge';
import { TypeBadge } from '@/components/workflow/TypeBadge';
import { useRequests, useApproveRequest, useRejectRequest } from '@/hooks/useRequests';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function PendingApprovals() {
  const navigate = useNavigate();
  const { data: requests, isLoading } = useRequests();
  const approveRequest = useApproveRequest();
  const rejectRequest = useRejectRequest();

  const { role } = useAuth();

  const canApprove = (request: any) => {
    if (!role) return false;
    if (role === 'admin') return true;
    if (role === 'manager') return true;
    if (role === 'finance' && request.request_type === 'purchase') return true;
    if (role === 'hr' && request.request_type === 'leave') return true;
    if (role === 'it' && request.request_type === 'it_support') return true;
    return false;
  };

  const pendingRequests = requests?.filter(
    (r) => (r.status === 'pending_approval' || r.status === 'submitted') && canApprove(r)
  ) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending Approvals</CardTitle>
          <CardDescription>Requests awaiting your action</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending Approvals</CardTitle>
          <CardDescription>Requests awaiting your action</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm text-muted-foreground">
              No pending approvals at the moment
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleApprove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await approveRequest.mutateAsync(id);
  };

  const handleReject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await rejectRequest.mutateAsync(id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pending Approvals</CardTitle>
        <CardDescription>Requests awaiting your action</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingRequests.slice(0, 5).map((request) => {
          const initials = request.requester?.full_name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase() || 'U';

          return (
            <div
              key={request.id}
              className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/requests/${request.id}`)}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium text-sm truncate">
                      {request.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {request.requester?.full_name} • {request.department}
                    </p>
                  </div>
                  <TypeBadge type={request.request_type} size="sm" showLabel={false} />
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={request.status} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => handleApprove(e, request.id)}
                    disabled={approveRequest.isPending}
                  >
                    {approveRequest.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={(e) => handleReject(e, request.id)}
                    disabled={rejectRequest.isPending}
                  >
                    {rejectRequest.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
