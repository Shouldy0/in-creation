-- Create Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid default uuid_generate_v4() primary key,
  participant_a uuid references profiles(id) on delete cascade not null,
  participant_b uuid references profiles(id) on delete cascade not null,
  context_type text not null check (context_type in ('process', 'profile', 'commission')),
  context_id uuid, -- Optional, can link to a process or be null for profile-initiated
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Prevent duplicate conversations for the same context
  constraint unique_context_conversation unique (participant_a, participant_b, context_type, context_id),
  -- Ensure participant_a is always 'smaller' uuid or just enforced by app logic?
  -- For unique constraint to work bidirectionally without sorting, we usually rely on app logic to sort IDs.
  -- Alternatively, we can add a check constraint that participant_a < participant_b
  constraint participants_ordered check (participant_a < participant_b)
);

-- RLS for Conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations" on conversations 
  for select using (auth.uid() = participant_a or auth.uid() = participant_b);

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" on conversations 
  for insert with check (auth.uid() = participant_a or auth.uid() = participant_b);


-- Create Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null check (char_length(content) > 0 and char_length(content) < 2000),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" on messages 
  for select using (
    exists (
      select 1 from conversations 
      where id = messages.conversation_id 
      and (participant_a = auth.uid() or participant_b = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
CREATE POLICY "Users can send messages to their conversations" on messages 
  for insert with check (
    auth.uid() = sender_id 
    and exists (
      select 1 from conversations 
      where id = messages.conversation_id 
      and (participant_a = auth.uid() or participant_b = auth.uid())
    )
    -- Add blocking check logic here later or ensure it via API
  );
