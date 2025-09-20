-- Migration to add upvotes and downvotes to ratings table
-- This script adds voting functionality to the existing ratings table

-- Add upvotes and downvotes columns to ratings table
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

-- Add comments to document the new columns
COMMENT ON COLUMN public.ratings.upvotes IS 'Array of user IDs who upvoted this review';
COMMENT ON COLUMN public.ratings.downvotes IS 'Array of user IDs who downvoted this review';
