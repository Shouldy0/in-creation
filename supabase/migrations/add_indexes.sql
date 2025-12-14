-- Indexes for foreign keys to speed up joins
CREATE INDEX IF NOT EXISTS idx_processes_user_id ON processes(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_post_id ON feedback(post_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_outputs_process_id ON mentor_outputs(process_id);
CREATE INDEX IF NOT EXISTS idx_mentor_responses_process_id ON mentor_responses(process_id); -- Case where old table still exists
