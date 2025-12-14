-- Force Insert/Update logic (Upsert)
-- Guarantees the profile exists AND has beta access
-- Run in Supabase SQL Editor

INSERT INTO public.profiles (id, username, full_name, beta_access)
VALUES (
  '50758578-ce0b-4992-8345-c793ed4f5e63', -- Your specific ID
  'ShouldyAdmin',                         -- Fallback username
  'Admin',                                -- Fallback name
  true                                    -- Force Beta Access
)
ON CONFLICT (id) DO UPDATE
SET beta_access = true;
