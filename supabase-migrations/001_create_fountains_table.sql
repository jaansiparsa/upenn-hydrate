-- Create fountains table
CREATE TABLE IF NOT EXISTS public.fountains (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    coordinates POINT NOT NULL, -- PostgreSQL POINT type for coordinates
    status TEXT NOT NULL CHECK (status IN ('working', 'maintenance', 'out_of_order')),
    type TEXT NOT NULL CHECK (type IN ('indoor', 'outdoor')),
    last_checked TIMESTAMP WITH TIME ZONE,
    image_url TEXT, -- URL to fountain image in Supabase Storage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fountains_status ON public.fountains(status);
CREATE INDEX IF NOT EXISTS idx_fountains_type ON public.fountains(type);
CREATE INDEX IF NOT EXISTS idx_fountains_coordinates ON public.fountains USING GIST(coordinates);

-- Enable Row Level Security (RLS)
ALTER TABLE public.fountains ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed for your use case)
CREATE POLICY "Allow public read access to fountains" ON public.fountains
    FOR SELECT USING (true);

-- Create policy for authenticated users to insert/update/delete (adjust as needed)
CREATE POLICY "Allow authenticated users to manage fountains" ON public.fountains
    FOR ALL USING (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_fountains_updated_at 
    BEFORE UPDATE ON public.fountains 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - remove if you don't want sample data)
INSERT INTO public.fountains (name, coordinates, status, type, last_checked, image_url) VALUES
('Van Pelt Library Fountain', POINT(-75.1932, 39.9522), 'working', 'indoor', '2024-01-15', 'https://your-project.supabase.co/storage/v1/object/public/fountain-images/van-pelt-library.jpg'),
('Locust Walk Fountain', POINT(-75.194, 39.9515), 'working', 'outdoor', '2024-01-14', 'https://your-project.supabase.co/storage/v1/object/public/fountain-images/locust-walk.jpg'),
('Engineering Fountain', POINT(-75.192, 39.953), 'maintenance', 'indoor', '2024-01-10', 'https://your-project.supabase.co/storage/v1/object/public/fountain-images/engineering.jpg'),
('College Hall Fountain', POINT(-75.195, 39.951), 'out_of_order', 'outdoor', '2024-01-08', 'https://your-project.supabase.co/storage/v1/object/public/fountain-images/college-hall.jpg')
ON CONFLICT DO NOTHING;
