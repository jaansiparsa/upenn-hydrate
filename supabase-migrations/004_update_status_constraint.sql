-- Migration to update status constraint to include 'bad_filter'
-- This script modifies the existing CHECK constraint to allow 'bad_filter' status

-- First, update any existing 'maintenance' records to 'bad_filter'
UPDATE public.fountains SET status = 'bad_filter' WHERE status = 'maintenance';

-- Drop the existing CHECK constraint
ALTER TABLE public.fountains DROP CONSTRAINT IF EXISTS fountains_status_check;

-- Add new CHECK constraint with 'bad_filter' option
ALTER TABLE public.fountains 
ADD CONSTRAINT fountains_status_check 
CHECK (status IN ('working', 'bad_filter', 'out_of_order'));

-- Update the comment to reflect the new status options
COMMENT ON COLUMN public.fountains.status IS 'Fountain status: working, bad_filter, or out_of_order';
