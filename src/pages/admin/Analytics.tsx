import { useAuth } from '@/hooks/useAuth';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RequestsChart } from '@/components/dashboard/RequestsChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const { role, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return <div>Loading...</div>;

  if (role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">Only administrators can access system analytics.</p>
        <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive overview of system performance and request metrics.
        </p>
      </div>

      <DashboardStats userId={undefined} role="admin" />

      <div className="grid gap-6 md:grid-cols-2">
        <RequestsChart userId={undefined} />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Department Performance
            </CardTitle>
            <CardDescription>Request completion rates by department</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
            Department breakdown chart coming soon...
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
