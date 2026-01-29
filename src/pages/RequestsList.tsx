import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/workflow/StatusBadge';
import { PriorityBadge } from '@/components/workflow/PriorityBadge';
import { TypeBadge } from '@/components/workflow/TypeBadge';
import { useRequests, useApproveRequest, useRejectRequest } from '@/hooks/useRequests';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import {
  Search,
  Plus,
  MoreHorizontal,
  Grid3X3,
  List,
  Download,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

interface RequestsListProps {
  title?: string;
  hideNewRequest?: boolean;
  forcedFilters?: {
    type?: string;
    status?: string;
    priority?: string;
    my?: boolean;
  };
}

const RequestsList = ({ title, hideNewRequest, forcedFilters }: RequestsListProps = {}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Initialize filters from forced filters, then URL params, then default
  const [typeFilter, setTypeFilter] = useState<string>(
    forcedFilters?.type || searchParams.get('type') || 'all'
  );
  const [statusFilter, setStatusFilter] = useState<string>(
    forcedFilters?.status || searchParams.get('status') || 'all'
  );
  const [priorityFilter, setPriorityFilter] = useState<string>(
    forcedFilters?.priority || 'all'
  );
  const [isMyRequests, setIsMyRequests] = useState(
    forcedFilters?.my !== undefined ? forcedFilters.my : searchParams.get('my') === 'true'
  );

  // Update filters from URL params ONLY if not forced
  useEffect(() => {
    if (forcedFilters?.type) {
      setTypeFilter(forcedFilters.type);
    } else {
      const type = searchParams.get('type');
      if (type) setTypeFilter(type);
    }

    if (forcedFilters?.status) {
      setStatusFilter(forcedFilters.status);
    } else {
      const status = searchParams.get('status');
      if (status) setStatusFilter(status);
    }

    if (forcedFilters?.my !== undefined) {
      setIsMyRequests(forcedFilters.my);
    } else {
      const my = searchParams.get('my');
      setIsMyRequests(my === 'true');
    }
  }, [searchParams, forcedFilters]);

  const { data: requests, isLoading } = useRequests({
    type: typeFilter,
    status: statusFilter,
    priority: priorityFilter,
    search: searchQuery,
    my: isMyRequests,
    userId: user?.id,
  });

  const approveRequest = useApproveRequest();
  const rejectRequest = useRejectRequest();
  const { role } = useAuth();

  const canApprove = (request: any) => {
    if (!role || !user) return false;
    if (request.requester_id === user.id) return false;
    if (role === 'admin') return true;
    if (role === 'manager') return true;
    if (role === 'finance' && request.request_type === 'purchase') return true;
    if (role === 'hr' && request.request_type === 'leave') return true;
    if (role === 'it' && request.request_type === 'it_support') return true;
    return false;
  };

  const toggleSelectAll = () => {
    if (!requests) return;
    if (selectedRequests.length === requests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(requests.map((r) => r.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedRequests.includes(id)) {
      setSelectedRequests(selectedRequests.filter((i) => i !== id));
    } else {
      setSelectedRequests([...selectedRequests, id]);
    }
  };

  const handleApprove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await approveRequest.mutateAsync(id);
  };

  const handleReject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await rejectRequest.mutateAsync(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {title || (isMyRequests ? 'My Requests' : 'Requests')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {title ? 'Review and manage requests requiring your approval' : (isMyRequests ? 'Your submitted requests' : 'Manage and track all workflow requests')}
          </p>
        </div>
        {!hideNewRequest && (
          <Button onClick={() => navigate('/requests/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <Select 
                value={typeFilter} 
                onValueChange={setTypeFilter}
                disabled={!!forcedFilters?.type}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="leave">Leave</SelectItem>
                  <SelectItem value="it_support">IT Support</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
                disabled={!!forcedFilters?.status}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              {/* View toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedRequests.length > 0 && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                {selectedRequests.length} selected
              </span>
              <Button variant="outline" size="sm">
                Approve Selected
              </Button>
              <Button variant="outline" size="sm">
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRequests([])}
              >
                Clear selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {isLoading ? 'Loading...' : `Showing ${requests?.length || 0} requests`}
        </span>
        <Button variant="ghost" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table View */}
      {!isLoading && viewMode === 'table' && requests && requests.length > 0 && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRequests.length === requests.length && requests.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Request</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => {
                const initials = request.requester?.full_name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() || 'U';

                return (
                  <TableRow
                    key={request.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/requests/${request.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRequests.includes(request.id)}
                        onCheckedChange={() => toggleSelect(request.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{request.title}</span>
                        {request.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {request.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TypeBadge type={request.request_type} size="sm" />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} size="sm" />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={request.priority} size="sm" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {request.requester?.full_name || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(request.created_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/requests/${request.id}`)}>
                            View Details
                          </DropdownMenuItem>
                          {canApprove(request) && (request.status === 'submitted' || request.status === 'pending_approval') && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={(e) => handleApprove(e as any, request.id)}>
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleReject(e as any, request.id)}>
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Grid View */}
      {!isLoading && viewMode === 'grid' && requests && requests.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => {
            const initials = request.requester?.full_name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase() || 'U';

            return (
              <Card
                key={request.id}
                className="cursor-pointer hover:shadow-elevated transition-shadow"
                onClick={() => navigate(`/requests/${request.id}`)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <TypeBadge type={request.request_type} size="sm" />
                    <PriorityBadge priority={request.priority} size="sm" />
                  </div>

                  <div>
                    <h3 className="font-medium line-clamp-1">{request.title}</h3>
                    {request.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {request.description}
                      </p>
                    )}
                  </div>

                  <StatusBadge status={request.status} size="sm" />

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {request.requester?.full_name || 'Unknown'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(request.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!requests || requests.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">No requests found</h3>
            <p className="text-muted-foreground text-center mt-1">
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Create your first request to get started'}
            </p>
            <Button
              className="mt-4"
              onClick={() => {
                if (searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all') {
                  setSearchQuery('');
                  setTypeFilter(forcedFilters?.type || 'all');
                  setStatusFilter(forcedFilters?.status || 'all');
                  setPriorityFilter(forcedFilters?.priority || 'all');
                } else {
                  navigate('/requests/new');
                }
              }}
            >
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Clear all filters'
                : 'Create Request'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RequestsList;
