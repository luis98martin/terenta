-- Add optional location to proposals
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS location TEXT;