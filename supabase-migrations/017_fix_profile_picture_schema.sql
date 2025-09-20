-- Migration to fix profile picture schema mismatch
-- This script updates the existing profile_photo_url column to profile_picture_url
-- and creates the correct profile-pictures bucket

-- First, rename the column from profile_photo_url to profile_picture_url
ALTER TABLE public.users 
RENAME COLUMN profile_photo_url TO profile_picture_url;

-- Update the comment
COMMENT ON COLUMN public.users.profile_picture_url IS 'URL of the user profile picture stored in Supabase Storage';

-- Create the new profile-pictures bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the new profile-pictures bucket
CREATE POLICY IF NOT EXISTS "Profile pictures are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-pictures');

CREATE POLICY IF NOT EXISTS "Users can upload their own profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can update their own profile pictures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can delete their own profile pictures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Optional: Remove old policies for profile-photos bucket (uncomment if you want to clean up)
-- DROP POLICY IF EXISTS "Profile photos are publicly accessible" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can upload their own profile photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;
