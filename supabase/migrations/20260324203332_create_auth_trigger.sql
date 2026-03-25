/*
  # Authentication Trigger for Profile Creation

  ## 1. Purpose
    - Automatically create a profile when a user signs up
    - Set default role to 'client'
    - Store email from auth.users

  ## 2. Security
    - Runs in security definer context to bypass RLS
    - Only creates profiles for new users
    - Extracts email from user metadata

  ## 3. Important Notes
    - This trigger fires on auth.users insert
    - Profile creation is mandatory for all authenticated users
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;
