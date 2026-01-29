import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useDashboardStats } from '@/hooks/useRequests';
import { useAuth } from '@/hooks/useAuth';
import { getTypeLabel, getStatusLabel } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';

const typeColors = {
  purchase: 'hsl(217, 91%, 60%)',
  leave: 'hsl(142, 71%, 45%)',
  it_support: 'hsl(280, 87%, 60%)',
};

const statusColors = {
  submitted: 'hsl(217, 91%, 60%)',
  pending_approval: 'hsl(38, 92%, 50%)',
  approved: 'hsl(142, 71%, 45%)',
  rejected: 'hsl(0, 84%, 60%)',
  in_progress: 'hsl(280, 87%, 60%)',
  completed: 'hsl(142, 71%, 45%)',
  cancelled: 'hsl(215, 16%, 47%)',
};

interface RequestsChartProps {
  userId?: string;
}

export function RequestsChart({ userId }: RequestsChartProps) {
  const { data: stats, isLoading } = useDashboardStats(userId);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  const typeData = (stats?.requestsByType || []).map((item) => ({
    name: getTypeLabel(item.type),
    value: item.count,
    color: typeColors[item.type as keyof typeof typeColors],
  }));

  const statusData = (stats?.requestsByStatus || [])
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: getStatusLabel(item.status),
      value: item.count,
      color: statusColors[item.status as keyof typeof statusColors],
    }));

  const hasTypeData = typeData.some(d => d.value > 0);
  const hasStatusData = statusData.length > 0;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* By Type */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Requests by Type</CardTitle>
          <CardDescription>Distribution of request categories</CardDescription>
        </CardHeader>
        <CardContent>
          {hasTypeData ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              No requests yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* By Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Requests by Status</CardTitle>
          <CardDescription>Current workflow distribution</CardDescription>
        </CardHeader>
        <CardContent>
          {hasStatusData ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              No requests yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
