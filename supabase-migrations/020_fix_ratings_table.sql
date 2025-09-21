-- Fix ratings table issue
-- Migration: 020_fix_ratings_table.sql
-- This script ensures the ratings table exists and has the correct structure

-- Check if reviews table exists and rename it to ratings if needed
DO $$
BEGIN
    -- If reviews table exists but ratings doesn't, rename reviews to ratings
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews' AND table_schema = 'public')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ratings' AND table_schema = 'public') THEN
        
        -- Rename reviews table to ratings
        ALTER TABLE public.reviews RENAME TO ratings;
        
        -- Rename indexes
        ALTER INDEX IF EXISTS idx_reviews_fountain_id RENAME TO idx_ratings_fountain_id;
        ALTER INDEX IF EXISTS idx_reviews_user_id RENAME TO idx_ratings_user_id;
        ALTER INDEX IF EXISTS idx_reviews_created_at RENAME TO idx_ratings_created_at;
        
        -- Rename trigger
        DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.ratings;
        CREATE TRIGGER update_ratings_updated_at
            BEFORE UPDATE ON public.ratings
            FOR EACH ROW
            EXECUTE FUNCTION update_reviews_updated_at_column();
            
        -- Update comments
        COMMENT ON TABLE public.ratings IS 'User reviews for water fountains';
        COMMENT ON COLUMN public.ratings.fountain_id IS 'Reference to the fountain being reviewed';
        COMMENT ON COLUMN public.ratings.user_id IS 'Reference to the user who wrote the review';
        COMMENT ON COLUMN public.ratings.coldness IS 'Rating for water coldness (1-5 stars)';
        COMMENT ON COLUMN public.ratings.experience IS 'Overall experience rating (1-5 stars)';
        COMMENT ON COLUMN public.ratings.pressure IS 'Rating for water pressure (1-5 stars)';
        COMMENT ON COLUMN public.ratings.yum_factor IS 'Overall enjoyment rating (1-5 stars)';
        COMMENT ON COLUMN public.ratings.comment IS 'Optional text comments about the fountain';
        
    END IF;
END $$;

-- Ensure the ratings table has all required columns
ALTER TABLE public.ratings 
ADD COLUMN IF NOT EXISTS upvotes uuid[] DEFAULT '{}'::uuid[],
ADD COLUMN IF NOT EXISTS downvotes uuid[] DEFAULT '{}'::uuid[];

-- Add constraint to prevent users from both upvoting and downvoting the same review
ALTER TABLE public.ratings 
ADD CONSTRAINT IF NOT EXISTS ratings_no_duplicate_votes 
CHECK (NOT (upvotes && downvotes));

-- Create indexes for better performance on vote queries
CREATE INDEX IF NOT EXISTS idx_ratings_upvotes 
ON public.ratings USING gin (upvotes);

CREATE INDEX IF NOT EXISTS idx_ratings_downvotes 
ON public.ratings USING gin (downvotes);

-- Ensure RLS is enabled
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Public reviews are viewable by everyone." ON public.ratings;
DROP POLICY IF EXISTS "Authenticated users can create their own reviews." ON public.ratings;
DROP POLICY IF EXISTS "Authenticated users can update their own reviews." ON public.ratings;
DROP POLICY IF EXISTS "Authenticated users can delete their own reviews." ON public.ratings;
DROP POLICY IF EXISTS "Allow authenticated users to vote on reviews" ON public.ratings;
DROP POLICY IF EXISTS "Authenticated users can update their own review content." ON public.ratings;

-- Create proper RLS policies for ratings table
CREATE POLICY "Public ratings are viewable by everyone." ON public.ratings
    FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create their own ratings." ON public.ratings
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own rating content." ON public.ratings
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to vote on ratings" ON public.ratings
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete their own ratings." ON public.ratings
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Add comments to document the voting columns
COMMENT ON COLUMN public.ratings.upvotes IS 'Array of user IDs who upvoted this review';
COMMENT ON COLUMN public.ratings.downvotes IS 'Array of user IDs who downvoted this review';
