import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RequestCard } from '@/components/workflow/RequestCard';
import { useDashboardStats } from '@/hooks/useRequests';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function RecentRequests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats(user?.id);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg">Recent Requests</CardTitle>
            <CardDescription>Latest activity across all request types</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg">Recent Requests</CardTitle>
          <CardDescription>Latest activity across all request types</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/requests')}>
          View all
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {stats?.recentRequests && stats.recentRequests.length > 0 ? (
          stats.recentRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request as any}
              onClick={() => navigate(`/requests/${request.id}`)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No requests yet</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/requests/new')}>
              Create your first request
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
