import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/workflow/StatusBadge';
import { PriorityBadge } from '@/components/workflow/PriorityBadge';
import { TypeBadge } from '@/components/workflow/TypeBadge';
import { RequestTimeline } from '@/components/workflow/RequestTimeline';
import { 
  useRequest, 
  useRequestTimeline, 
  useRequestComments, 
  useAddComment,
  useApproveRequest,
  useRejectRequest,
  useUpdateRequest 
} from '@/hooks/useRequests';
import { useAuth } from '@/hooks/useAuth';
import { getStatusLabel } from '@/lib/mock-data';
import { format, formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Building2,
  User,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  Paperclip,
  Send,
  MoreHorizontal,
  Sparkles,
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

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, profile, user } = useAuth();
  const [newComment, setNewComment] = useState('');

  const { data: request, isLoading: requestLoading } = useRequest(id);
  const { data: timeline, isLoading: timelineLoading } = useRequestTimeline(id);
  const { data: comments, isLoading: commentsLoading } = useRequestComments(id);
  
  const addComment = useAddComment();
  const approveRequest = useApproveRequest();
  const rejectRequest = useRejectRequest();
  const updateRequest = useUpdateRequest();

  if (requestLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold">Request not found</h2>
        <p className="text-muted-foreground mt-1">
          The request you're looking for doesn't exist
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/requests')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Requests
        </Button>
      </div>
    );
  }

  const requesterInitials = request.requester?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const canApprove = role && user && request.requester_id !== user.id && (
    role === 'admin' ||
    (role === 'finance' && request.request_type === 'purchase') ||
    (role === 'hr' && request.request_type === 'leave') ||
    (role === 'it' && request.request_type === 'it_support') ||
    (role === 'manager') // Keep manager broad for now, or could restrict
  );
  const isPending = ['submitted', 'pending_approval'].includes(request.status);

  const handleAddComment = async () => {
    if (!newComment.trim() || !id) return;
    await addComment.mutateAsync({ requestId: id, content: newComment });
    setNewComment('');
  };

  const handleApprove = async () => {
    if (!id) return;
    await approveRequest.mutateAsync(id);
  };

  const handleReject = async () => {
    if (!id) return;
    await rejectRequest.mutateAsync(id);
  };

  const handleStartProgress = async () => {
    if (!id) return;
    await updateRequest.mutateAsync({ id, status: 'in_progress' });
  };

  const handleComplete = async () => {
    if (!id) return;
    await updateRequest.mutateAsync({ id, status: 'completed' });
  };

  const currentUserInitials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight">
                {request.title}
              </h1>
              <TypeBadge type={request.request_type} />
            </div>
            <div className="flex items-center gap-3 mt-2 text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {request.requester?.full_name || 'Unknown'}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {request.department}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canApprove && isPending && (
            <>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleReject}
                disabled={rejectRequest.isPending}
              >
                {rejectRequest.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Reject
              </Button>
              <Button 
                className="gap-2"
                onClick={handleApprove}
                disabled={approveRequest.isPending}
              >
                {approveRequest.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Approve
              </Button>
            </>
          )}
          {canApprove && request.status === 'approved' && (
            <Button onClick={handleStartProgress} disabled={updateRequest.isPending}>
              {updateRequest.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Start Progress
            </Button>
          )}
          {canApprove && request.status === 'in_progress' && (
            <Button onClick={handleComplete} disabled={updateRequest.isPending}>
              {updateRequest.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Mark Complete
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Request</DropdownMenuItem>
              <DropdownMenuItem>Reassign</DropdownMenuItem>
              <DropdownMenuItem>Add Attachment</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Cancel Request
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status and Priority */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <StatusBadge status={request.status} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Priority:</span>
                  <PriorityBadge priority={request.priority} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              {request.description ? (
                <p className="text-sm leading-relaxed">{request.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No description provided
                </p>
              )}
            </CardContent>
          </Card>

          {/* AI Summary */}
          <Card className="border-accent/30 bg-accent/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                AI Summary
              </CardTitle>
              <CardDescription>
                AI-generated summary for quick review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                This is a {request.request_type.replace('_', ' ')} request from{' '}
                {request.requester?.full_name || 'a user'} in the {request.department} department.
                {request.estimated_cost && (
                  <> The estimated cost is ${request.estimated_cost.toLocaleString()}.</>
                )}
                {request.due_date && (
                  <> The requested completion date is {format(new Date(request.due_date), 'MMMM d, yyyy')}.</>
                )}
                {' '}The request is currently {getStatusLabel(request.status).toLowerCase()}.
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Suggest Approval
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Generate Response
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs: Comments & Timeline */}
          <Tabs defaultValue="comments" className="w-full">
            <TabsList>
              <TabsTrigger value="comments" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments ({comments?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-2">
                <Clock className="h-4 w-4" />
                Timeline ({timeline?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="attachments" className="gap-2">
                <Paperclip className="h-4 w-4" />
                Attachments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="mt-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  {/* Add comment */}
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {currentUserInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Add a comment..."
                        className="min-h-[80px] resize-none"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || addComment.isPending}
                        >
                          {addComment.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Send className="h-3 w-3 mr-1" />
                          )}
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Comments list */}
                  {commentsLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="h-20" />
                      ))}
                    </div>
                  ) : comments && comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => {
                        const commentInitials = comment.author?.full_name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase() || 'U';

                        return (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {commentInitials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {comment.author?.full_name || 'Unknown'}
                                </span>
                                {comment.is_internal && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    Internal
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(comment.created_at), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{comment.content}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No comments yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  {timelineLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  ) : timeline && timeline.length > 0 ? (
                    <RequestTimeline entries={timeline as any} />
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No timeline entries yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attachments" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center py-8">
                    <Paperclip className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No attachments yet
                    </p>
                    <Button variant="outline" size="sm" className="mt-4">
                      <Paperclip className="h-3 w-3 mr-1" />
                      Add Attachment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Request ID</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {request.id.slice(0, 8)}
                </code>
              </div>

              {request.estimated_cost && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Estimated Cost
                  </span>
                  <span className="font-medium">
                    ${request.estimated_cost.toLocaleString()}
                  </span>
                </div>
              )}

              {request.due_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </span>
                  <span className="font-medium">
                    {format(new Date(request.due_date), 'MMM d, yyyy')}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">
                  {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Updated</span>
                <span className="text-sm">
                  {format(new Date(request.updated_at), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Requester Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Requester</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {requesterInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{request.requester?.full_name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.requester?.email || 'No email'}
                  </p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {request.department}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignee */}
          {request.assignee && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assigned To</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-accent/20 text-accent">
                      {request.assignee.full_name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.assignee.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.assignee.email}
                    </p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {request.assignee.department}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
