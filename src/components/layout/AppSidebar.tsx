import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Plus,
  Clock,
  CheckSquare,
  Users,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  ShoppingCart,
  Calendar,
  Headphones,
  BarChart3,
  ClipboardCheck,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useRequests';
import { getRoleLabel } from '@/lib/mock-data';

const mainNavItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'All Requests',
    url: '/requests',
    icon: FileText,
  },
];

const requestTypeItems = [
  {
    title: 'Purchase Requests',
    url: '/requests/type/purchase',
    icon: ShoppingCart,
  },
  {
    title: 'Leave Requests',
    url: '/requests/type/leave',
    icon: Calendar,
  },
  {
    title: 'IT Support',
    url: '/requests/type/it_support',
    icon: Headphones,
  },
];

const workflowItems = [
  {
    title: 'My Requests',
    url: '/requests?my=true',
    icon: CheckSquare,
  },
];

const adminItems = [
  {
    title: 'Users',
    url: '/users',
    icon: Users,
  },
  {
    title: 'Analytics',
    url: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

const getApprovalLink = (role: string | null) => {
  switch (role) {
    case 'finance':
      return { title: 'Finance Approvals', url: '/approvals/finance', icon: ClipboardCheck };
    case 'hr':
      return { title: 'HR Approvals', url: '/approvals/hr', icon: ClipboardCheck };
    case 'it':
      return { title: 'IT Approvals', url: '/approvals/it', icon: ClipboardCheck };
    default:
      return null;
  }
};

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [requestsOpen, setRequestsOpen] = useState(true);
  
  const { profile, role, signOut, user } = useAuth();
  const { data: notifications } = useNotifications(user?.id);

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;
  const displayName = profile?.full_name || user?.email || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isActive = (url: string) => {
    if (url === '/') return location.pathname === '/';
    return location.pathname.startsWith(url.split('?')[0]);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold">
            W
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">WorkflowHub</span>
              <span className="text-xs text-sidebar-foreground/60">
                Enterprise Suite
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* New Request Button */}
        <div className="py-3">
          <NavLink to="/requests/new">
            <Button
              className={cn(
                'w-full justify-start gap-2',
                isCollapsed && 'justify-center px-0'
              )}
            >
              <Plus className="h-4 w-4" />
              {!isCollapsed && <span>New Request</span>}
            </Button>
          </NavLink>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Request Types */}
        {!isCollapsed && (
          <Collapsible open={requestsOpen} onOpenChange={setRequestsOpen}>
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent rounded-md transition-colors">
                  <span>Request Types</span>
                  <ChevronDown
                    className={cn(
                      'ml-auto h-4 w-4 transition-transform',
                      requestsOpen && 'rotate-180'
                    )}
                  />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {requestTypeItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild tooltip={item.title}>
                          <NavLink to={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {/* Workflow */}
        <SidebarGroup>
          <SidebarGroupLabel>Workflow</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Approval Link (Dynamic based on role) */}
              {role && ['finance', 'hr', 'it'].includes(role) && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Approvals">
                    <NavLink to={getApprovalLink(role)?.url || '#'} className="relative">
                      <ClipboardCheck className="h-4 w-4" />
                      <span>Approvals</span>
                      {/* We could fetch pending count here if needed */}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {workflowItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className="relative">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin (show based on role) */}
        {role && ['admin', 'manager'].includes(role) && false && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {/* Notifications */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Notifications">
              <NavLink to="/notifications" className="relative">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
                {unreadCount > 0 && !isCollapsed && (
                  <Badge
                    variant="destructive"
                    className="ml-auto h-5 min-w-5 px-1 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Sign Out */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              onClick={handleSignOut}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* User Profile */}
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              tooltip={displayName}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col flex-1 text-left text-sm">
                  <span className="font-medium truncate">
                    {displayName}
                  </span>
                  <span className="text-xs text-sidebar-foreground/60 truncate">
                    {role ? getRoleLabel(role) : 'Employee'}
                  </span>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
