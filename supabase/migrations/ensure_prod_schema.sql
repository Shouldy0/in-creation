-- Create Enums if they don't exist
DO $$ BEGIN
    CREATE TYPE process_phase AS ENUM ('Idea', 'Blocked', 'Flow', 'Revision', 'Finished');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE process_visibility AS ENUM ('public', 'private');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE process_status AS ENUM ('draft', 'published');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE creative_state AS ENUM ('Idea', 'Blocked', 'Flow', 'Revision', 'Resting');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE feedback_type AS ENUM ('works', 'doesnt_work', 'inspired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table (Extends Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  bio text,
  disciplines text[], -- Array of strings
  current_state creative_state default 'Resting',
  avatar_url text,
  beta_access boolean default false, -- Added this recently
  constraint username_length check (char_length(username) >= 3)
);

-- RLS for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." on profiles for select using (true);

DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." on profiles for update using (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);

-- Trigger to create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Processes Table
CREATE TABLE IF NOT EXISTS processes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  title text not null,
  description text,
  phase process_phase not null default 'Idea',
  visibility process_visibility not null default 'public',
  status process_status not null default 'draft',
  
  media_url text,
  media_type text, -- 'image' or 'audio'
  reflection_question text
);

-- RLS for Processes
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public processes are viewable by everyone." ON processes;
CREATE POLICY "Public processes are viewable by everyone." 
  on processes for select 
  using (
    (visibility = 'public' and status = 'published') 
    or 
    (auth.uid() = user_id)
  );

DROP POLICY IF EXISTS "Users can create processes." ON processes;
CREATE POLICY "Users can create processes." on processes for insert with check (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own processes." ON processes;
CREATE POLICY "Users can update own processes." on processes for update using (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own processes." ON processes;
CREATE POLICY "Users can delete own processes." on processes for delete using (auth.uid() = user_id);


-- Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references processes(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  type feedback_type not null,
  content text not null,
  parent_id uuid references feedback(id) on delete cascade -- For 1-level replies
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Feedback is viewable by everyone." ON feedback;
CREATE POLICY "Feedback is viewable by everyone." on feedback for select using (true);

DROP POLICY IF EXISTS "Authenticated users can insert feedback." ON feedback;
CREATE POLICY "Authenticated users can insert feedback." on feedback for insert with check (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own feedback." ON feedback;
CREATE POLICY "Users can delete own feedback." on feedback for delete using (auth.uid() = user_id);


-- Mentor Responses Table
CREATE TABLE IF NOT EXISTS mentor_responses (
  process_id uuid references processes(id) on delete cascade not null primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  summary text,
  questions text[],
  exercise text
);

ALTER TABLE mentor_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Mentor responses viewable by everyone" ON mentor_responses;
CREATE POLICY "Mentor responses viewable by everyone" on mentor_responses for select using (true);

DROP POLICY IF EXISTS "Users can save mentor response for own process" ON mentor_responses;
CREATE POLICY "Users can save mentor response for own process" on mentor_responses for insert 
with check (
  exists (select 1 from processes where id = process_id and user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update mentor response for own process" ON mentor_responses;
CREATE POLICY "Users can update mentor response for own process" on mentor_responses for update
using (
  exists (select 1 from processes where id = process_id and user_id = auth.uid())
);
