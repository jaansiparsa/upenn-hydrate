-- Create rating comments table with voting functionality
-- Migration: 017_create_rating_comments_table.sql

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public comments are viewable by everyone." ON public.rating_comments;
DROP POLICY IF EXISTS "Authenticated users can create their own comments." ON public.rating_comments;
DROP POLICY IF EXISTS "Authenticated users can update their own comments." ON public.rating_comments;
DROP POLICY IF EXISTS "Authenticated users can delete their own comments." ON public.rating_comments;
DROP POLICY IF EXISTS "Authenticated users can vote on comments." ON public.rating_comments;

-- Create rating comments table
CREATE TABLE IF NOT EXISTS public.rating_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rating_id UUID NOT NULL REFERENCES public.ratings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL CHECK (length(comment_text) > 0 AND length(comment_text) <= 1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    upvotes UUID[] DEFAULT '{}'::uuid[],
    downvotes UUID[] DEFAULT '{}'::uuid[],
    
    -- Ensure no duplicate votes from same user
    CONSTRAINT rating_comments_no_duplicate_votes CHECK (NOT (upvotes && downvotes))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rating_comments_rating_id ON public.rating_comments(rating_id);
CREATE INDEX IF NOT EXISTS idx_rating_comments_user_id ON public.rating_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_rating_comments_created_at ON public.rating_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_rating_comments_upvotes ON public.rating_comments USING GIN (upvotes);
CREATE INDEX IF NOT EXISTS idx_rating_comments_downvotes ON public.rating_comments USING GIN (downvotes);

-- Enable Row Level Security (RLS)
ALTER TABLE public.rating_comments ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to comments
CREATE POLICY "Public comments are viewable by everyone." ON public.rating_comments
    FOR SELECT
    USING (true);

-- Policy for authenticated users to create their own comments
CREATE POLICY "Authenticated users can create their own comments." ON public.rating_comments
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to update their own comments
CREATE POLICY "Authenticated users can update their own comments." ON public.rating_comments
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to delete their own comments
CREATE POLICY "Authenticated users can delete their own comments." ON public.rating_comments
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy for authenticated users to vote on any comment
CREATE POLICY "Authenticated users can vote on comments." ON public.rating_comments
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add comments to the new columns
COMMENT ON TABLE public.rating_comments IS 'Comments on fountain ratings with voting functionality';
COMMENT ON COLUMN public.rating_comments.rating_id IS 'Reference to the rating this comment belongs to';
COMMENT ON COLUMN public.rating_comments.user_id IS 'User who created the comment';
COMMENT ON COLUMN public.rating_comments.comment_text IS 'The comment text (max 1000 characters)';
COMMENT ON COLUMN public.rating_comments.upvotes IS 'Array of user IDs who upvoted this comment';
COMMENT ON COLUMN public.rating_comments.downvotes IS 'Array of user IDs who downvoted this comment';
