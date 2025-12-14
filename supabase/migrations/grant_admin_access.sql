-- Force update beta access for the specific admin user
-- Run this in Supabase Dashboard -> SQL Editor

UPDATE profiles 
SET beta_access = true 
WHERE id = '50758578-ce0b-4992-8345-c793ed4f5e63';

-- Also ensure the column exists just in case
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'beta_access') THEN
        ALTER TABLE profiles ADD COLUMN beta_access boolean DEFAULT false;
    END IF;
END $$;
