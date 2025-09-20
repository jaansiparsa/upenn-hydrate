-- Migration to fix status constraint issue
-- This script ensures the constraint allows 'bad_filter' status

-- First, let's see what constraints exist and remove them all
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    -- Get all check constraints on the fountains table
    FOR constraint_name IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.fountains'::regclass 
        AND contype = 'c'
    LOOP
        EXECUTE 'ALTER TABLE public.fountains DROP CONSTRAINT IF EXISTS ' || constraint_name;
    END LOOP;
END $$;

-- Update any existing 'maintenance' records to 'bad_filter'
UPDATE public.fountains SET status = 'bad_filter' WHERE status = 'maintenance';

-- Add the new CHECK constraint with 'bad_filter' option
ALTER TABLE public.fountains 
ADD CONSTRAINT fountains_status_check 
CHECK (status IN ('working', 'bad_filter', 'out_of_order'));

-- Update the comment to reflect the new status options
COMMENT ON COLUMN public.fountains.status IS 'Fountain status: working, bad_filter, or out_of_order';

-- Verify the constraint was created successfully
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'public.fountains'::regclass 
AND contype = 'c';
