-- Add profile picture storage bucket and URL column to users table
-- Migration: 014_add_profile_pictures.sql

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access to profile pictures
CREATE POLICY "Public read access for profile pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-pictures');

-- Create policy for authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for authenticated users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-pictures' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for authenticated users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-pictures' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add profile_picture_url column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Add comment for the new column
COMMENT ON COLUMN public.users.profile_picture_url IS 'URL to user profile picture in Supabase Storage';

-- Create index for better performance when querying by profile picture URL
CREATE INDEX IF NOT EXISTS idx_users_profile_picture_url ON public.users (profile_picture_url) WHERE profile_picture_url IS NOT NULL;
