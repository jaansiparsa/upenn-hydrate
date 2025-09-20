-- Create storage bucket for fountain images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('fountain-images', 'fountain-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access to fountain images
CREATE POLICY "Public read access for fountain images" ON storage.objects
FOR SELECT USING (bucket_id = 'fountain-images');

-- Create policy for authenticated users to upload fountain images
CREATE POLICY "Authenticated users can upload fountain images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'fountain-images' 
  AND auth.role() = 'authenticated'
);

-- Create policy for authenticated users to update fountain images
CREATE POLICY "Authenticated users can update fountain images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'fountain-images' 
  AND auth.role() = 'authenticated'
);

-- Create policy for authenticated users to delete fountain images
CREATE POLICY "Authenticated users can delete fountain images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'fountain-images' 
  AND auth.role() = 'authenticated'
);
