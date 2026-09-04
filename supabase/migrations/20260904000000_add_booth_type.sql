-- Add booth_type column to stands table
ALTER TABLE public.stands
  ADD COLUMN IF NOT EXISTS booth_type TEXT NOT NULL DEFAULT 'standard'
  CHECK (booth_type IN ('standard', 'corner', 'premium', 'outdoor'));

-- Add zone column if not exists
ALTER TABLE public.stands
  ADD COLUMN IF NOT EXISTS zone TEXT;
