import { RequestType } from '@/types/workflow';
import { getTypeLabel } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { ShoppingCart, Calendar, Headphones } from 'lucide-react';

interface TypeBadgeProps {
  type: RequestType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
}

const typeConfig: Record<RequestType, { className: string; icon: React.ElementType; shortLabel: string }> = {
  purchase: { className: 'type-purchase', icon: ShoppingCart, shortLabel: 'Purchase' },
  leave: { className: 'type-leave', icon: Calendar, shortLabel: 'Leave' },
  it_support: { className: 'type-it-support', icon: Headphones, shortLabel: 'IT Support' },
};

export function TypeBadge({ type, size = 'md', showIcon = true, showLabel = true }: TypeBadgeProps) {
  const config = typeConfig[type];
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
      {showLabel && config.shortLabel}
    </span>
  );
}
