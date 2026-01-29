import { StatCard } from '@/components/workflow/StatCard';
import { FileText, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useRequests';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStatsProps {
  userId?: string;
  role?: string | null;
}

interface RequestsChartProps {
  userId?: string;
}

export function DashboardStats({ userId, role }: DashboardStatsProps) {
  const { data: stats, isLoading } = useDashboardStats(userId, role as string);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const isDepartmentView = role === 'it' || role === 'finance' || role === 'hr' || role === 'admin';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title={isDepartmentView ? "Total Requests" : "My Requests"}
        value={stats?.totalRequests || 0}
        description={isDepartmentView ? "Department Wide" : "Total Submitted"}
        icon={FileText}
        variant="primary"
      />
      <StatCard
        title="Pending Approval"
        value={stats?.pendingApprovals || 0}
        description="Awaiting action"
        icon={Clock}
        variant="warning"
      />
      <StatCard
        title="In Progress"
        value={stats?.inProgress || 0}
        description="Being processed"
        icon={ArrowRight}
        variant="default"
      />
      <StatCard
        title="Completed"
        value={stats?.completedThisMonth || 0}
        description="This month"
        icon={CheckCircle2}
        variant="success"
        trend={stats?.completedThisMonth ? { value: stats.completedThisMonth, isPositive: true } : undefined}
      />
    </div>
  );
}
