-- Co-Process Enums
create type co_process_status as enum ('active', 'archived');
create type co_process_role as enum ('owner', 'member');

-- Co-Processes Table
create table co_processes (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  status co_process_status not null default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- For MVP, "One active co-process per user" implies we might check this in app logic or trigger,
  -- but let's keep the table flexible.
  owner_id uuid references profiles(id) on delete cascade not null
);

-- RLS for Co-Processes
alter table co_processes enable row level security;

-- Policy: Members can view
create policy "Co-Processes are viewable by members." 
  on co_processes for select 
  using (
    exists (
      select 1 from co_process_members 
      where co_process_id = co_processes.id 
      and user_id = auth.uid()
    )
  );

-- Policy: Users can create (Owner)
create policy "Users can create co-processes." 
  on co_processes for insert 
  with check (auth.uid() = owner_id);

-- Policy: Owner can update
create policy "Owner can update co-process." 
  on co_processes for update 
  using (auth.uid() = owner_id);


-- Co-Process Members Table
create table co_process_members (
  co_process_id uuid references co_processes(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role co_process_role not null default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  primary key (co_process_id, user_id)
);

-- RLS for Members
alter table co_process_members enable row level security;

-- Policy: Members can view fellow members
create policy "Members can view members of their co-processes." 
  on co_process_members for select 
  using (
    exists (
      select 1 from co_process_members as cm
      where cm.co_process_id = co_process_members.co_process_id 
      and cm.user_id = auth.uid()
    )
  );

-- Policy: Owner can add members (Insert)
create policy "Owner can add members." 
  on co_process_members for insert 
  with check (
    exists (
      select 1 from co_processes 
      where id = co_process_id 
      and owner_id = auth.uid()
    )
  );
  
-- Policy: Owner can remove members (Delete)
create policy "Owner can remove members." 
  on co_process_members for delete 
  using (
    exists (
      select 1 from co_processes 
      where id = co_process_id 
      and owner_id = auth.uid()
    )
  );

-- Policy: Users can leave (Delete own membership)
create policy "Users can leave co-processes." 
  on co_process_members for delete 
  using (auth.uid() = user_id);


-- Co-Process Entries (Shared Diary)
create table co_process_entries (
  id uuid default uuid_generate_v4() primary key,
  co_process_id uuid references co_processes(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text,
  media_url text, -- Supabase Storage URL
  media_type text, -- 'image' or 'audio' or 'video'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Entries
alter table co_process_entries enable row level security;

-- Policy: Members can view entries
create policy "Members can view entries." 
  on co_process_entries for select 
  using (
    exists (
      select 1 from co_process_members 
      where co_process_id = co_process_entries.co_process_id 
      and user_id = auth.uid()
    )
  );

-- Policy: Members can insert entries
create policy "Members can create entries." 
  on co_process_entries for insert 
  with check (
    exists (
      select 1 from co_process_members 
      where co_process_id = co_process_entries.co_process_id 
      and user_id = auth.uid()
    )
    and user_id = auth.uid()
  );

-- Co-Process Feedback / Resonance
-- Scoped strictly to co-processes
create table co_process_feedback (
  id uuid default uuid_generate_v4() primary key,
  entry_id uuid references co_process_entries(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  type text check (type in ('works', 'needs_work', 'inspired', 'resonance')), -- Added 'resonance' generally
  content text, -- Can be empty for simple resonance if desired, or require text
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Feedback
alter table co_process_feedback enable row level security;

-- Policy: Members can view feedback
create policy "Members can view feedback." 
  on co_process_feedback for select 
  using (
    exists (
        select 1 from co_process_entries e
        join co_process_members m on e.co_process_id = m.co_process_id
        where e.id = co_process_feedback.entry_id
        and m.user_id = auth.uid()
    )
  );

-- Policy: Members can add feedback
create policy "Members can add feedback." 
  on co_process_feedback for insert 
  with check (
    exists (
        select 1 from co_process_entries e
        join co_process_members m on e.co_process_id = m.co_process_id
        where e.id = co_process_feedback.entry_id
        and m.user_id = auth.uid()
    )
    and user_id = auth.uid()
  );
