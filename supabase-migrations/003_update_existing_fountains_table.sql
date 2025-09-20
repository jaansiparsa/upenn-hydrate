-- Migration to update existing fountains table with new features
-- This script modifies the existing table to add status, type, last_checked, and image_url fields

-- Add new columns to existing fountains table
ALTER TABLE public.fountains 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'working' CHECK (status IN ('working', 'maintenance', 'out_of_order')),
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'indoor' CHECK (type IN ('indoor', 'outdoor')),
ADD COLUMN IF NOT EXISTS last_checked TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update existing records to have proper status and type
-- You may want to adjust these defaults based on your existing data
UPDATE public.fountains 
SET status = 'working', type = 'indoor' 
WHERE status IS NULL OR type IS NULL;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_fountains_status ON public.fountains(status);
CREATE INDEX IF NOT EXISTS idx_fountains_type ON public.fountains(type);

-- Add comment to document the changes
COMMENT ON COLUMN public.fountains.status IS 'Fountain status: working, maintenance, or out_of_order';
COMMENT ON COLUMN public.fountains.type IS 'Fountain type: indoor or outdoor';
COMMENT ON COLUMN public.fountains.last_checked IS 'When the fountain was last checked';
COMMENT ON COLUMN public.fountains.image_url IS 'URL to fountain image in Supabase Storage';

-- Update sample data with new fields (optional - remove if you don't want sample data)
-- Note: This will only insert if the records don't already exist
INSERT INTO public.fountains (name, building, floor, latitude, longitude, description, status, type, last_checked, image_url) 
VALUES 
('Van Pelt Library Fountain', 'Van Pelt Library', 'Ground Floor', 39.9522, -75.1932, 'Main library fountain near the entrance', 'working', 'indoor', '2024-01-15', 'https://your-project.supabase.co/storage/v1/object/public/fountain-images/van-pelt-library.jpg'),
('Locust Walk Fountain', 'Outdoor', 'Ground Level', 39.9515, -75.194, 'Popular outdoor fountain on Locust Walk', 'working', 'outdoor', '2024-01-14', 'https://your-project.supabase.co/storage/v1/object/public/fountain-images/locust-walk.jpg'),
('Engineering Fountain', 'Engineering Building', '2nd Floor', 39.953, -75.192, 'Fountain in the engineering building', 'maintenance', 'indoor', '2024-01-10', 'https://your-project.supabase.co/storage/v1/object/public/fountain-images/engineering.jpg'),
('College Hall Fountain', 'College Hall', 'Ground Floor', 39.951, -75.195, 'Historic fountain in College Hall', 'out_of_order', 'outdoor', '2024-01-08', 'https://your-project.supabase.co/storage/v1/object/public/fountain-images/college-hall.jpg')
ON CONFLICT (id) DO NOTHING;
