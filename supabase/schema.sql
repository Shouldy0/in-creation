-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Public profiles for users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  bio text,
  disciplines text[], -- Array of strings e.g., ['Visual Art', 'Writing']
  current_state text check (current_state in ('Idea', 'Blocked', 'Flow', 'Revision', 'Resting')),
  
  constraint username_length check (char_length(username) >= 3)
);

-- RLS for Profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- POSTS (Process moments)
create table posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  phase text check (phase in ('Idea', 'Blocked', 'Flow', 'Revision')) not null,
  media_url text, -- Supabase Storage URL
  reflection_question text
);

-- RLS for Posts
alter table posts enable row level security;
create policy "Posts are viewable by everyone." on posts for select using (true);
create policy "Users can create posts." on posts for insert with check (auth.uid() = user_id);
create policy "Users can update own posts." on posts for update using (auth.uid() = user_id);
create policy "Users can delete own posts." on posts for delete using (auth.uid() = user_id);

-- FEEDBACK (Structured feedback)
create table feedback (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  type text check (type in ('works', 'needs_work', 'inspired')) not null,
  content text not null
);

-- RLS for Feedback
alter table feedback enable row level security;
create policy "Feedback is viewable by everyone." on feedback for select using (true);
create policy "Users can insert feedback." on feedback for insert with check (auth.uid() = user_id);
-- No updating feedback to preserve honest initial reaction? Or allow it. Let's allow for now.
create policy "Users can update own feedback." on feedback for update using (auth.uid() = user_id);
create policy "Users can delete own feedback." on feedback for delete using (auth.uid() = user_id);

-- STORAGE BUCKET setup (pseudo-code, needs to be done via API or UI usually, but good to document)
-- insert into storage.buckets (id, name, public) values ('process-media', 'process-media', true);
-- Policy: "Public Access" -> true
-- Policy: "Authenticated can upload" -> auth.role() = 'authenticated'
