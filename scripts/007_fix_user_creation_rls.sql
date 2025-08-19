-- Fix RLS policy for user creation
-- The trigger function needs permission to insert new user records

-- Add INSERT policy for users table to allow user creation via trigger
CREATE POLICY "Allow user creation via trigger" ON users
  FOR INSERT WITH CHECK (true);

-- Alternative: We could also disable RLS for the trigger function by making it SECURITY DEFINER
-- But the above policy is cleaner and more explicit
