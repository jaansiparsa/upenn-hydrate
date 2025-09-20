-- Migration to rename 'taste' column to 'experience' in ratings table
-- This script renames the taste column to experience and updates constraints

-- Rename the column
ALTER TABLE public.ratings RENAME COLUMN taste TO experience;

-- Drop the old constraint
ALTER TABLE public.ratings DROP CONSTRAINT IF EXISTS ratings_taste_check;

-- Add new constraint for experience
ALTER TABLE public.ratings 
ADD CONSTRAINT ratings_experience_check 
CHECK (
  (
    (experience >= 1)
    and (experience <= 5)
  )
);

-- Update the comment to reflect the new column name
COMMENT ON COLUMN public.ratings.experience IS 'Overall experience rating (1-5 stars)';
