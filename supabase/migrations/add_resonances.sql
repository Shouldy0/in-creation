-- Create resonances table
CREATE TABLE IF NOT EXISTS resonances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(process_id, user_id)
);

-- Note: We do NOT index for counts or ranking as requested ("No counters shown"). 
-- But we might need an index for quick lookup of specific user's resonance.
CREATE INDEX IF NOT EXISTS resonances_user_process_idx ON resonances (user_id, process_id);
CREATE INDEX IF NOT EXISTS resonances_process_idx ON resonances (process_id); -- For fetching "has any" efficiently?

-- Enable RLS
ALTER TABLE resonances ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public can read resonances (to know if "Ha risuonato" should be shown, 
-- though the UI will obscure exact counts, the data existence is public)
CREATE POLICY "Resonances are viewable by everyone"
  ON resonances FOR SELECT
  USING (true);

-- Authenticated users can create their own resonance
CREATE POLICY "Users can resonate"
  ON resonances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own resonance
CREATE POLICY "Users can un-resonate"
  ON resonances FOR DELETE
  USING (auth.uid() = user_id);
