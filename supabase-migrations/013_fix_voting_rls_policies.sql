-- Fix RLS policies to allow voting on ratings
-- This script updates the RLS policies to allow users to vote on any review

-- First, let's check what policies exist and drop the restrictive ones
DROP POLICY IF EXISTS "Allow authenticated users to manage fountains" ON public.ratings;
DROP POLICY IF EXISTS "Allow authenticated users to manage reviews" ON public.ratings;

-- Create a policy that allows authenticated users to update upvotes and downvotes on any review
CREATE POLICY "Allow authenticated users to vote on reviews" ON public.ratings
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Ensure the existing read policy allows everyone to read reviews
CREATE POLICY "Public reviews are viewable by everyone." ON public.ratings
    FOR SELECT
    USING (true);

-- Ensure users can still create their own reviews
CREATE POLICY "Authenticated users can create their own reviews." ON public.ratings
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Ensure users can still update their own reviews (for content changes)
CREATE POLICY "Authenticated users can update their own review content." ON public.ratings
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own reviews
CREATE POLICY "Authenticated users can delete their own reviews." ON public.ratings
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
