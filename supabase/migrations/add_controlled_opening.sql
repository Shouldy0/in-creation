-- Add Controlled Opening fields to profiles

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS onboarding_answer TEXT,
ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;

-- Backfill joined_at for existing users (preserve approximate join time if possible, otherwise now)
-- Since we don't track it elsewhere, we just default to NOW for everyone existing 
-- if they were added before this column. Default now() handles new inserts.
-- Existing users will be treated as "New" for 3 days from MIGRATION time unless we manually update.
-- This is likely acceptable for a soft launch reset, or I can try to use created_at from auth.users?
-- profiles.id is a FK to auth.users.id. We can't easily join auth schema in standard migration unless allowed.
-- For MVP/Safety: Let's assume existing beta users are manually updated or we accept they are observers for 3 days (helps test!).
-- Or, if we want to grandfather them, we could set their joined_at to '2024-01-01'.

UPDATE profiles SET joined_at = '2024-01-01' WHERE joined_at IS NULL OR joined_at > now(); 
-- Wait, default is now(). When adding column with default, existing rows get the default value (now).
-- So existing rows have joined_at = [Migration Time].
-- I will set them to '2024-01-01' to bypass observer mode for CURRENT users.

UPDATE profiles 
SET joined_at = '2024-01-01' 
WHERE joined_at >= (now() - interval '1 minute'); -- Heuristic to catch just-added defaults
