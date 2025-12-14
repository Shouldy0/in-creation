-- Add block_index to resonances
ALTER TABLE resonances ADD COLUMN IF NOT EXISTS block_index INTEGER DEFAULT NULL;

-- Drop old unique constraint
ALTER TABLE resonances DROP CONSTRAINT IF EXISTS resonances_process_id_user_id_key;

-- Add new unique constraint
ALTER TABLE resonances ADD CONSTRAINT resonances_process_id_user_id_block_index_key UNIQUE (process_id, user_id, block_index);

-- Index for efficient lookup by block
CREATE INDEX IF NOT EXISTS resonances_process_block_idx ON resonances (process_id, block_index);
