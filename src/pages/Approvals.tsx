import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import RequestsList from './RequestsList';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Approvals = () => {
  const { role, isLoading } = useAuth();
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();

  // Role verification logic
  const isAuthorized = () => {
    if (isLoading) return true; // Wait for loading
    if (!role) return false;
    
    // Admin can see everything
    if (role === 'admin') return true;
    
    // Route matching
    if (type === 'finance' && role === 'finance') return true;
    if (type === 'hr' && role === 'hr') return true;
    if (type === 'it' && role === 'it') return true;
    
    // Employee/Manager generally shouldn't be here unless we add manager approvals later
    // For now, manager approves generic stuff, but let's stick to the requested 3 roles
    return false;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground text-center max-w-md">
          You do not have permission to view this approval queue. 
          This area is restricted to {type?.toUpperCase()} personnel.
        </p>
        <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
      </div>
    );
  }

  const getPageConfig = () => {
    switch (type) {
      case 'finance':
        return {
          title: 'Finance Approvals',
          filters: { type: 'purchase' }
        };
      case 'hr':
        return {
          title: 'HR Approvals',
          filters: { type: 'leave' }
        };
      case 'it':
        return {
          title: 'IT Support Approvals',
          filters: { type: 'it_support' }
        };
      default:
        return {
          title: 'Approvals',
          filters: {}
        };
    }
  };

  const config = getPageConfig();

  return (
    <RequestsList 
      title={config.title}
      hideNewRequest={true}
      forcedFilters={config.filters}
    />
  );
};

export default Approvals;
