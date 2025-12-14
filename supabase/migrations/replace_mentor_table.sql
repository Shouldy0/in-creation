-- Drop old table
DROP TABLE IF EXISTS mentor_responses;

-- Create new mentor_outputs table
CREATE TABLE mentor_outputs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  process_id uuid REFERENCES processes(id) ON DELETE CASCADE NOT NULL UNIQUE,
  summary_json jsonb NOT NULL,
  source_feedback_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE mentor_outputs ENABLE ROW LEVEL SECURITY;

-- Read: Everyone (if process is public), or Owner
CREATE POLICY "Mentor outputs viewable by everyone" ON mentor_outputs 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM processes 
    WHERE processes.id = mentor_outputs.process_id 
    AND (
      (processes.visibility = 'public' AND processes.status = 'published') 
      OR 
      (processes.user_id = auth.uid())
    )
  )
);

-- Write: Authenticated users who own the process
CREATE POLICY "Users can upsert mentor output for own process" ON mentor_outputs 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM processes WHERE id = process_id AND user_id = auth.uid())
);

CREATE POLICY "Users can update mentor output for own process" ON mentor_outputs 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM processes WHERE id = process_id AND user_id = auth.uid())
);
