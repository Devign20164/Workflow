import { RequestStatus } from '@/types/workflow';
import { getStatusLabel } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { Circle, Clock, CheckCircle2, XCircle, ArrowRight, CheckCheck, Ban } from 'lucide-react';

interface StatusBadgeProps {
  status: RequestStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const statusConfig: Record<RequestStatus, { className: string; icon: React.ElementType }> = {
  submitted: { className: 'status-submitted', icon: Circle },
  pending_approval: { className: 'status-pending', icon: Clock },
  approved: { className: 'status-approved', icon: CheckCircle2 },
  rejected: { className: 'status-rejected', icon: XCircle },
  in_progress: { className: 'status-in-progress', icon: ArrowRight },
  completed: { className: 'status-completed', icon: CheckCheck },
  cancelled: { className: 'status-cancelled', icon: Ban },
};

export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full transition-smooth',
        sizeClasses[size],
        config.className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {getStatusLabel(status)}
    </span>
  );
}
