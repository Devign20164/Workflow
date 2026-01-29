import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ArrowLeft, Calendar as CalendarIcon, Upload, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RequestType, RequestPriority } from '@/types/workflow';
import { toast } from '@/hooks/use-toast';
import { useCreateRequest } from '@/hooks/useRequests';
import { useAuth } from '@/hooks/useAuth';

const NewRequest = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const createRequest = useCreateRequest();
  
  const [requestType, setRequestType] = useState<RequestType | ''>('');
  const [priority, setPriority] = useState<RequestPriority>('medium');
  const [dueDate, setDueDate] = useState<Date>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestType || !title) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    await createRequest.mutateAsync({
      title,
      description: description || undefined,
      request_type: requestType,
      priority,
      department: profile?.department || 'General',
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
      estimated_cost: estimatedCost ? parseFloat(estimatedCost) : undefined,
    });

    navigate('/requests');
  };

  const handleAIAssist = () => {
    if (title) {
      setDescription(
        `This is an AI-generated description for "${title}". The request is categorized as ${requestType || 'general'} with ${priority} priority. ${
          estimatedCost ? `The estimated cost is $${estimatedCost}.` : ''
        } ${
          dueDate ? `The desired completion date is ${format(dueDate, 'MMMM d, yyyy')}.` : ''
        } Please review and update as needed.`
      );
      toast({
        title: 'AI Suggestion',
        description: 'Description generated based on your inputs',
      });
    } else {
      toast({
        title: 'Enter a title first',
        description: 'AI needs a title to generate suggestions',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New Request</h1>
          <p className="text-muted-foreground mt-1">
            Create a new workflow request
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>
              Fill in the details for your new request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Request Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">
                Request Type <span className="text-destructive">*</span>
              </Label>
              <Select value={requestType} onValueChange={(v) => setRequestType(v as RequestType)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Purchase Request</SelectItem>
                  <SelectItem value="leave">Leave Request</SelectItem>
                  <SelectItem value="it_support">IT Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description with AI Assist */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleAIAssist}
                >
                  <Sparkles className="h-3 w-3" />
                  AI Assist
                </Button>
              </div>
              <Textarea
                id="description"
                placeholder="Provide additional details about your request"
                className="min-h-[120px] resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Priority and Due Date */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as RequestPriority)}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'justify-start text-left font-normal',
                        !dueDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Cost (for purchase requests) */}
            {requestType === 'purchase' && (
              <div className="grid gap-2">
                <Label htmlFor="cost">Estimated Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  placeholder="0.00"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                />
              </div>
            )}

            {/* Attachments */}
            <div className="grid gap-2">
              <Label>Attachments</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Drop files here or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, XLS, PNG, JPG up to 10MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createRequest.isPending}>
            {createRequest.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit Request
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewRequest;
