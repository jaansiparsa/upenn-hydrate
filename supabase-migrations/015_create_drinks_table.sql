-- Create drinks table to track user consumption from fountains
-- Migration: 015_create_drinks_table.sql

-- Create drinks table
CREATE TABLE IF NOT EXISTS public.drinks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fountain_id UUID NOT NULL REFERENCES public.fountains(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_ml INTEGER NOT NULL CHECK (amount_ml > 0), -- Amount consumed in milliliters
    consumed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Optional: Add notes about the drinking session
    notes TEXT,
    
    -- Optional: Add duration of drinking session in seconds
    duration_seconds INTEGER CHECK (duration_seconds > 0)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drinks_fountain_id ON public.drinks(fountain_id);
CREATE INDEX IF NOT EXISTS idx_drinks_user_id ON public.drinks(user_id);
CREATE INDEX IF NOT EXISTS idx_drinks_consumed_at ON public.drinks(consumed_at);
CREATE INDEX IF NOT EXISTS idx_drinks_user_fountain ON public.drinks(user_id, fountain_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.drinks ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to drinks (users can see others' drinking data)
CREATE POLICY "Public drinks are viewable by everyone."
  ON public.drinks FOR SELECT
  USING (true);

-- Policy for authenticated users to insert their own drinks
CREATE POLICY "Authenticated users can create their own drinks."
  ON public.drinks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to update their own drinks
CREATE POLICY "Authenticated users can update their own drinks."
  ON public.drinks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to delete their own drinks
CREATE POLICY "Authenticated users can delete their own drinks."
  ON public.drinks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_drinks_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on each row update
CREATE TRIGGER update_drinks_updated_at
    BEFORE UPDATE ON public.drinks
    FOR EACH ROW
    EXECUTE FUNCTION update_drinks_updated_at_column();

-- Add comments to document the table
COMMENT ON TABLE public.drinks IS 'Tracks user water consumption from fountains';
COMMENT ON COLUMN public.drinks.fountain_id IS 'Reference to the fountain where water was consumed';
COMMENT ON COLUMN public.drinks.user_id IS 'Reference to the user who consumed the water';
COMMENT ON COLUMN public.drinks.amount_ml IS 'Amount of water consumed in milliliters';
COMMENT ON COLUMN public.drinks.consumed_at IS 'When the water was consumed';
COMMENT ON COLUMN public.drinks.notes IS 'Optional notes about the drinking session';
COMMENT ON COLUMN public.drinks.duration_seconds IS 'Duration of drinking session in seconds';

-- Create a view for aggregated drinking statistics per user
CREATE OR REPLACE VIEW public.user_drinking_stats AS
SELECT 
    user_id,
    COUNT(*) as total_drinks,
    SUM(amount_ml) as total_ml_consumed,
    AVG(amount_ml) as avg_amount_per_drink,
    MIN(consumed_at) as first_drink,
    MAX(consumed_at) as last_drink,
    COUNT(DISTINCT fountain_id) as unique_fountains_used
FROM public.drinks
GROUP BY user_id;

-- Create a view for fountain usage statistics
CREATE OR REPLACE VIEW public.fountain_usage_stats AS
SELECT 
    fountain_id,
    COUNT(*) as total_drinks,
    COUNT(DISTINCT user_id) as unique_users,
    SUM(amount_ml) as total_ml_served,
    AVG(amount_ml) as avg_amount_per_drink,
    MIN(consumed_at) as first_use,
    MAX(consumed_at) as last_use
FROM public.drinks
GROUP BY fountain_id;

-- Add RLS policies for the views
ALTER VIEW public.user_drinking_stats SET (security_invoker = true);
ALTER VIEW public.fountain_usage_stats SET (security_invoker = true);

-- Grant access to the views
GRANT SELECT ON public.user_drinking_stats TO authenticated;
GRANT SELECT ON public.fountain_usage_stats TO authenticated;
