-- Migration to add profile photo support to users table
-- This script adds profile photo functionality to the existing users table

-- Add profile_photo_url column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS profile_photo_url text;

-- Add comment to document the new column
COMMENT ON COLUMN public.users.profile_photo_url IS 'URL of the user profile photo stored in Supabase Storage';

-- Create a storage bucket for profile photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for profile photos bucket
CREATE POLICY IF NOT EXISTS "Profile photos are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY IF NOT EXISTS "Users can upload their own profile photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can update their own profile photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can delete their own profile photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
