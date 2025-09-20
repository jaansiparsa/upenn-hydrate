-- Add followers and following columns to users table
-- Migration: 011_add_followers_following_to_users.sql

-- Add followers column (array of user IDs who follow this user)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS followers uuid[] DEFAULT '{}'::uuid[];

-- Add following column (array of user IDs this user follows)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS following uuid[] DEFAULT '{}'::uuid[];

-- Add comments for the new columns
COMMENT ON COLUMN public.users.followers IS 'Array of user IDs who follow this user';
COMMENT ON COLUMN public.users.following IS 'Array of user IDs this user follows';

-- Create indexes for better performance when querying followers/following
CREATE INDEX IF NOT EXISTS idx_users_followers ON public.users USING GIN (followers);
CREATE INDEX IF NOT EXISTS idx_users_following ON public.users USING GIN (following);
