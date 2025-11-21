/*
  # Add automatic user profile creation

  1. Changes
    - Creates a trigger function to automatically create a user profile when a new auth user signs up
    - Adds the trigger to the auth.users table
  
  2. Security
    - Function runs with security definer privileges to ensure it can insert into users_profile table
*/

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users_profile (id, user_type, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'user_type', 'regular'),
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
