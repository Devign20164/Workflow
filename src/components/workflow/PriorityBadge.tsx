import { RequestPriority } from '@/types/workflow';
import { getPriorityLabel } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowRight, ArrowUp, AlertTriangle } from 'lucide-react';

interface PriorityBadgeProps {
  priority: RequestPriority;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const priorityConfig: Record<RequestPriority, { className: string; icon: React.ElementType }> = {
  low: { className: 'priority-low', icon: ArrowDown },
  medium: { className: 'priority-medium', icon: ArrowRight },
  high: { className: 'priority-high', icon: ArrowUp },
  urgent: { className: 'priority-urgent', icon: AlertTriangle },
};

export function PriorityBadge({ priority, size = 'md', showIcon = true }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
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
      {getPriorityLabel(priority)}
    </span>
  );
}
