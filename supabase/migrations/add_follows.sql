-- Create Follows Table
CREATE TABLE IF NOT EXISTS follows (
    follower_id uuid references profiles(id) on delete cascade not null,
    followed_id uuid references profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    PRIMARY KEY (follower_id, followed_id),
    CONSTRAINT no_self_follow CHECK (follower_id != followed_id)
);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public Read (Needed for "Following" feed queries and initial state check)
DROP POLICY IF EXISTS "Follows are viewable by everyone." ON follows;
CREATE POLICY "Follows are viewable by everyone." 
    on follows for select 
    using (true);

-- Authenticated Insert (Follow)
DROP POLICY IF EXISTS "Users can follow others." ON follows;
CREATE POLICY "Users can follow others." 
    on follows for insert 
    with check (auth.uid() = follower_id);

-- Authenticated Delete (Unfollow)
DROP POLICY IF EXISTS "Users can unfollow." ON follows;
CREATE POLICY "Users can unfollow." 
    on follows for delete 
    using (auth.uid() = follower_id);
