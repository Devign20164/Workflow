import { useAuth } from '@/hooks/useAuth';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentRequests } from '@/components/dashboard/RecentRequests';
import { RequestsChart } from '@/components/dashboard/RequestsChart';
import { PendingApprovals } from '@/components/dashboard/PendingApprovals';

const Dashboard = () => {
  const { profile, role, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-muted/50 rounded-lg w-1/3" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting()}, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your workflow today
        </p>
      </div>

      {/* Stats */}
      <DashboardStats userId={user?.id} role={role} />

      {/* Charts */}
      <RequestsChart userId={role === 'admin' ? undefined : user?.id} />

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentRequests />
        <PendingApprovals />
      </div>
    </div>
  );
};

export default Dashboard;
