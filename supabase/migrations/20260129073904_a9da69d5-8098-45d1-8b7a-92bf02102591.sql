-- Fix the overly permissive notification insert policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create more restrictive notification insert policy
CREATE POLICY "Users can create notifications for others" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager') OR
    public.has_role(auth.uid(), 'finance') OR
    public.has_role(auth.uid(), 'hr') OR
    public.has_role(auth.uid(), 'it')
  );

-- Create trigger for initial timeline entry
CREATE TRIGGER request_initial_timeline
  AFTER INSERT ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.create_initial_timeline_entry();