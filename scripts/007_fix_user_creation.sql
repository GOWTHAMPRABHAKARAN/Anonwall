-- Fix RLS policies for user creation
-- The trigger needs to be able to INSERT into users table

-- Drop existing policy if it exists to prevent duplicate error
DROP POLICY IF EXISTS "Allow user creation via trigger" ON users;

-- Add INSERT policy for the trigger function
CREATE POLICY "Allow user creation via trigger" ON users
  FOR INSERT WITH CHECK (true);

-- Also ensure the trigger function has proper permissions
-- Update the trigger function to handle potential conflicts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Use INSERT ... ON CONFLICT to handle potential duplicate entries
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE LOG 'Error creating user record: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
