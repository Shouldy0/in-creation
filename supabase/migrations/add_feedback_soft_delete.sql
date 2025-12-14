-- Add soft delete support
ALTER TABLE feedback ADD COLUMN if not exists is_deleted boolean DEFAULT false;
