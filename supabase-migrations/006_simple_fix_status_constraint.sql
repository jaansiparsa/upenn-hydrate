-- Simple fix for status constraint issue
-- Run this if the previous migration didn't work

-- Step 1: Remove ALL check constraints on the fountains table
ALTER TABLE public.fountains DROP CONSTRAINT IF EXISTS fountains_status_check;
ALTER TABLE public.fountains DROP CONSTRAINT IF EXISTS fountains_type_check;

-- Step 2: Update any existing 'maintenance' records to 'bad_filter'
UPDATE public.fountains SET status = 'bad_filter' WHERE status = 'maintenance';

-- Step 3: Add the correct constraints back
ALTER TABLE public.fountains 
ADD CONSTRAINT fountains_status_check 
CHECK (status IN ('working', 'bad_filter', 'out_of_order'));

ALTER TABLE public.fountains 
ADD CONSTRAINT fountains_type_check 
CHECK (type IN ('indoor', 'outdoor'));

-- Step 4: Update comments
COMMENT ON COLUMN public.fountains.status IS 'Fountain status: working, bad_filter, or out_of_order';
COMMENT ON COLUMN public.fountains.type IS 'Fountain type: indoor or outdoor';
