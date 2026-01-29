import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AppRole } from '@/types/workflow';

const SEED_USERS = [
  { role: 'admin' as AppRole, email: 'admin@demo.co', password: 'password123', name: 'Admin User', department: 'Management' },
  { role: 'manager' as AppRole, email: 'manager@demo.co', password: 'password123', name: 'Manager User', department: 'Management' },
  { role: 'hr' as AppRole, email: 'hr@demo.co', password: 'password123', name: 'HR User', department: 'HR' },
  { role: 'finance' as AppRole, email: 'finance@demo.co', password: 'password123', name: 'Finance User', department: 'Finance' },
  { role: 'it' as AppRole, email: 'it@demo.co', password: 'password123', name: 'IT User', department: 'IT' },
  { role: 'employee' as AppRole, email: 'employee@demo.co', password: 'password123', name: 'Employee User', department: 'Engineering' },
];

export const seedDatabase = async () => {
  let successCount = 0;
  let failCount = 0;

  for (const user of SEED_USERS) {
    try {
      console.log(`Seeding user: ${user.email}`);

      // 1. Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.name,
            department: user.department,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
            console.log(`User ${user.email} already exists, skipping auth creation.`);
            // Proceed to check/update profile and role if we were logged in, but we might not be.
            // If we are not logged in as this user, we can't reliably update their private data due to RLS.
            // So we skip.
            // However, the user might want us to login? No, simpler to just skip.
        } else {
            console.error(`Error creating auth for ${user.email}:`, authError);
            failCount++;
            continue;
        }
      }

      // If signup was successful and returned a user (meaning we are now logged in as them, or simple creation happened)
      if (authData.user) {
        const userId = authData.user.id;

        // 2. Create Profile (Upsert to be safe)
        const { error: profileError } = await supabase.from('profiles').upsert({
          user_id: userId,
          email: user.email,
          full_name: user.name,
          department: user.department,
        }, { onConflict: 'user_id' });

        if (profileError) console.error(`Error creating profile for ${user.email}:`, profileError);

        // 3. Create Role
        const { error: roleError } = await supabase.from('user_roles').upsert({
          user_id: userId,
          role: user.role,
        }, { onConflict: 'user_id' });

        if (roleError) console.error(`Error creating role for ${user.email}:`, roleError);
        
        // 4. Sign Out immediately so we can process next user
        await supabase.auth.signOut();
        successCount++;
      }
      
      // Small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`Unexpected error for ${user.email}:`, error);
      failCount++;
    }
  }

  return { successCount, failCount };
};
