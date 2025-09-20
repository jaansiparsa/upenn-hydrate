-- Fix RLS policies for drinks table
-- Migration: 016_fix_drinks_rls_policies.sql

-- Drop existing policies
DROP POLICY IF EXISTS "Public drinks are viewable by everyone." ON public.drinks;
DROP POLICY IF EXISTS "Authenticated users can create their own drinks." ON public.drinks;
DROP POLICY IF EXISTS "Authenticated users can update their own drinks." ON public.drinks;
DROP POLICY IF EXISTS "Authenticated users can delete their own drinks." ON public.drinks;

-- Create simpler, more permissive policies for drinks
-- Allow authenticated users to insert drinks (user_id will be set automatically)
CREATE POLICY "Allow authenticated users to insert drinks" ON public.drinks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to read all drinks (for social features)
CREATE POLICY "Allow authenticated users to read drinks" ON public.drinks
  FOR SELECT TO authenticated
  USING (true);

-- Allow users to update their own drinks
CREATE POLICY "Allow users to update their own drinks" ON public.drinks
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own drinks
CREATE POLICY "Allow users to delete their own drinks" ON public.drinks
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
