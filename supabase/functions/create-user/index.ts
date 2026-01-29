import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      // Supabase API URL - Env var automatically populated by Supabase
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase Service Role Key - Env var automatically populated by Supabase
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, fullName, department, role } = await req.json()

    // 1. Create user in auth.users
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password, // Should be 'password123!' by default
      email_confirm: true,
      user_metadata: { full_name: fullName, department },
    })

    if (authError) throw authError

    const userId = authData.user.id

    // 2. Insert into profiles (if not handled by trigger, or to ensure fields)
    // Assuming trigger might exist, but explicit upsert is safer for metadata
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .upsert({
        user_id: userId,
        email: email,
        full_name: fullName,
        department: department
      })

    if (profileError) throw profileError

    // 3. Insert into user_roles
    const { error: roleError } = await supabaseClient
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: role || 'employee'
      })

    if (roleError) throw roleError

    return new Response(
      JSON.stringify({ user: authData.user, message: 'User created successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
