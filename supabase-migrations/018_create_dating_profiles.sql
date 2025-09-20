-- hyDATEr feature - Real-time compatibility calculation
-- Migration: 018_create_hydater_feature.sql

-- This migration enables the hyDATEr dating feature
-- Compatibility scores are calculated in real-time based on fountain ratings
-- No additional tables needed - uses existing users and ratings tables

-- Add comment to document the hyDATEr feature
COMMENT ON TABLE public.users IS 'Users table - supports hyDATEr compatibility matching based on fountain ratings';
COMMENT ON TABLE public.ratings IS 'Ratings table - used for hyDATEr compatibility calculations between users';
