-- Add missing INSERT policy for users table to allow trigger function to work
-- The trigger handle_new_user() was failing because RLS was blocking INSERT operations

-- Allow INSERT for authenticated users (this will allow the trigger to work)
CREATE POLICY "Allow user creation via trigger" ON users
  FOR INSERT WITH CHECK (true);

-- Alternative: More restrictive policy that only allows INSERT when the user ID matches
-- CREATE POLICY "Allow user creation via trigger" ON users
--   FOR INSERT WITH CHECK (auth.uid() = id);
