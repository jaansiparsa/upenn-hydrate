-- Migration to create reviews table
-- This script creates a reviews table to store user reviews for fountains

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fountain_id UUID NOT NULL REFERENCES public.fountains(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coldness INTEGER NOT NULL CHECK (coldness >= 1 AND coldness <= 5),
    taste INTEGER NOT NULL CHECK (taste >= 1 AND taste <= 5),
    pressure INTEGER NOT NULL CHECK (pressure >= 1 AND pressure <= 5),
    yum_factor INTEGER NOT NULL CHECK (yum_factor >= 1 AND yum_factor <= 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one review per user per fountain
    UNIQUE(fountain_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_fountain_id ON public.reviews(fountain_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to reviews
CREATE POLICY "Public reviews are viewable by everyone."
  ON public.reviews FOR SELECT
  USING (true);

-- Policy for authenticated users to insert their own reviews
CREATE POLICY "Authenticated users can create their own reviews."
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to update their own reviews
CREATE POLICY "Authenticated users can update their own reviews."
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to delete their own reviews
CREATE POLICY "Authenticated users can delete their own reviews."
  ON public.reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_reviews_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on each row update
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at_column();

-- Add comment to document the table
COMMENT ON TABLE public.reviews IS 'User reviews for water fountains';
COMMENT ON COLUMN public.reviews.fountain_id IS 'Reference to the fountain being reviewed';
COMMENT ON COLUMN public.reviews.user_id IS 'Reference to the user who wrote the review';
COMMENT ON COLUMN public.reviews.coldness IS 'Rating for water coldness (1-5 stars)';
COMMENT ON COLUMN public.reviews.taste IS 'Rating for water taste (1-5 stars)';
COMMENT ON COLUMN public.reviews.pressure IS 'Rating for water pressure (1-5 stars)';
COMMENT ON COLUMN public.reviews.yum_factor IS 'Overall enjoyment rating (1-5 stars)';
COMMENT ON COLUMN public.reviews.comments IS 'Optional text comments about the fountain';
