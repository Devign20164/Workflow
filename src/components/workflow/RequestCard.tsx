import { Request } from '@/types/workflow';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { TypeBadge } from './TypeBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RequestCardProps {
  request: Request;
  onClick?: () => void;
  isSelected?: boolean;
}

export function RequestCard({ request, onClick, isSelected }: RequestCardProps) {
  const initials = request.requester?.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <Card
      className={cn(
        'cursor-pointer transition-smooth hover:shadow-elevated',
        isSelected && 'ring-2 ring-accent shadow-elevated'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="font-medium text-sm leading-tight truncate">
                  {request.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {request.requester?.full_name || 'Unknown'} • {request.department}
                </p>
              </div>
            </div>
            <TypeBadge type={request.request_type} size="sm" showLabel={false} />
          </div>

          {/* Description */}
          {request.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {request.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={request.status} size="sm" />
            <PriorityBadge priority={request.priority} size="sm" />
            
            {request.estimated_cost && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                {request.estimated_cost.toLocaleString()}
              </span>
            )}
            
            {request.due_date && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(request.due_date).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
            </span>
            {request.assignee && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Assigned to</span>
                <span className="font-medium text-foreground">
                  {request.assignee.full_name}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
