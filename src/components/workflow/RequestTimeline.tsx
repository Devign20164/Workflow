import { TimelineEntry } from '@/types/workflow';
import { StatusBadge } from './StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface RequestTimelineProps {
  entries: TimelineEntry[];
}

export function RequestTimeline({ entries }: RequestTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No timeline entries yet
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {entries.map((entry, index) => {
        const initials = entry.actor?.full_name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase() || 'S';

        const isLast = index === entries.length - 1;

        return (
          <div key={entry.id} className="flex gap-3">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <Avatar className="h-8 w-8 shrink-0 border-2 border-background">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!isLast && (
                <div className="w-px flex-1 bg-border my-2" />
              )}
            </div>

            {/* Content */}
            <div className={cn('flex-1 pb-6', isLast && 'pb-0')}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">
                  {entry.actor?.full_name || 'System'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {entry.action.toLowerCase()}
                </span>
              </div>

              {/* Status change */}
              {entry.previous_status && entry.new_status && (
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={entry.previous_status} size="sm" showIcon={false} />
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <StatusBadge status={entry.new_status} size="sm" />
                </div>
              )}

              {/* New status only (for creation) */}
              {!entry.previous_status && entry.new_status && (
                <div className="mt-2">
                  <StatusBadge status={entry.new_status} size="sm" />
                </div>
              )}

              {/* Notes */}
              {entry.notes && (
                <p className="text-sm text-muted-foreground mt-2 bg-muted/50 rounded-md p-2">
                  {entry.notes}
                </p>
              )}

              {/* Timestamp */}
              <p className="text-xs text-muted-foreground mt-2">
                {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
