-- Create enum types for the workflow system
CREATE TYPE public.request_type AS ENUM ('purchase', 'leave', 'it_support');
CREATE TYPE public.request_status AS ENUM ('submitted', 'pending_approval', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.request_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.app_role AS ENUM ('employee', 'manager', 'finance', 'hr', 'it', 'admin');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'General',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create requests table
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  request_type request_type NOT NULL,
  status request_status NOT NULL DEFAULT 'submitted',
  priority request_priority NOT NULL DEFAULT 'medium',
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  department TEXT NOT NULL,
  estimated_cost DECIMAL(12, 2),
  attachments TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create request_timeline table for audit history
CREATE TABLE public.request_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  previous_status request_status,
  new_status request_status,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create comments table
CREATE TABLE public.request_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User roles policies (admins can manage, users can view own)
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Requests policies
CREATE POLICY "Users can view relevant requests" ON public.requests
  FOR SELECT TO authenticated USING (
    requester_id = auth.uid() OR
    assigned_to = auth.uid() OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager') OR
    public.has_role(auth.uid(), 'finance') OR
    public.has_role(auth.uid(), 'hr') OR
    public.has_role(auth.uid(), 'it')
  );

CREATE POLICY "Users can create requests" ON public.requests
  FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Authorized users can update requests" ON public.requests
  FOR UPDATE TO authenticated USING (
    requester_id = auth.uid() OR
    assigned_to = auth.uid() OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager') OR
    public.has_role(auth.uid(), 'finance') OR
    public.has_role(auth.uid(), 'hr') OR
    public.has_role(auth.uid(), 'it')
  );

-- Timeline policies
CREATE POLICY "Users can view relevant timeline" ON public.request_timeline
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.requests r 
      WHERE r.id = request_id AND (
        r.requester_id = auth.uid() OR
        r.assigned_to = auth.uid() OR
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'manager') OR
        public.has_role(auth.uid(), 'finance') OR
        public.has_role(auth.uid(), 'hr') OR
        public.has_role(auth.uid(), 'it')
      )
    )
  );

CREATE POLICY "Authorized users can add timeline entries" ON public.request_timeline
  FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- Comments policies
CREATE POLICY "Users can view relevant comments" ON public.request_comments
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.requests r 
      WHERE r.id = request_id AND (
        r.requester_id = auth.uid() OR
        r.assigned_to = auth.uid() OR
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'manager') OR
        public.has_role(auth.uid(), 'finance') OR
        public.has_role(auth.uid(), 'hr') OR
        public.has_role(auth.uid(), 'it')
      )
    )
  );

CREATE POLICY "Users can add comments" ON public.request_comments
  FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update own comments" ON public.request_comments
  FOR UPDATE TO authenticated USING (author_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.request_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create timeline entry on status change
CREATE OR REPLACE FUNCTION public.create_timeline_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.request_timeline (request_id, action, previous_status, new_status, actor_id, notes)
    VALUES (NEW.id, 'Status changed', OLD.status, NEW.status, auth.uid(), NULL);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER request_status_change_timeline
  AFTER UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.create_timeline_on_status_change();

-- Function to create initial timeline entry
CREATE OR REPLACE FUNCTION public.create_initial_timeline_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.request_timeline (request_id, action, new_status, actor_id, notes)
  VALUES (NEW.id, 'Request created', NEW.status, NEW.requester_id, 'Request submitted');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;