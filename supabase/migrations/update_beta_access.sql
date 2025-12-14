-- Add beta_access column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'beta_access') THEN
        ALTER TABLE profiles ADD COLUMN beta_access boolean DEFAULT false;
    END IF;
END $$;

-- Update existing users to HAVE access (for testing) if you want, or leave false to test lockout.
-- For the owner (you), let's auto-enable it so you don't get locked out immediately.
-- Replace with your email if needed, or update manually in dashboard.
UPDATE profiles 
SET beta_access = true 
WHERE id IN (
  SELECT id FROM auth.users WHERE email LIKE '%shouldy01@gmail.com%' -- Based on your logs
);
