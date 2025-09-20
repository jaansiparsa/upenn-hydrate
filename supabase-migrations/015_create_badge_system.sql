-- Migration to create badge and achievement system
-- This script creates the badge system with progression tracking

-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    category text NOT NULL,
    tier text DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'special')),
    requirement_type text NOT NULL CHECK (requirement_type IN ('count', 'streak', 'special', 'social')),
    requirement_value integer,
    requirement_data jsonb, -- For complex requirements like "all 4 categories"
    is_progression boolean DEFAULT false,
    progression_group text, -- Groups related progression badges
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create user_badges table to track earned badges
CREATE TABLE IF NOT EXISTS public.user_badges (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at timestamp with time zone DEFAULT now(),
    progress_data jsonb, -- Store progress for progression badges
    UNIQUE(user_id, badge_id)
);

-- Create badge_progress table for tracking progress on progression badges
CREATE TABLE IF NOT EXISTS public.badge_progress (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    progression_group text NOT NULL,
    current_tier text NOT NULL,
    progress_value integer DEFAULT 0,
    last_updated timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, progression_group)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges table (public read)
CREATE POLICY "Badges are publicly readable" ON public.badges
    FOR SELECT USING (true);

-- RLS Policies for user_badges table
CREATE POLICY "Users can view their own badges" ON public.user_badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view other users' badges" ON public.user_badges
    FOR SELECT USING (true);

CREATE POLICY "System can insert user badges" ON public.user_badges
    FOR INSERT WITH CHECK (true);

-- RLS Policies for badge_progress table
CREATE POLICY "Users can view their own progress" ON public.badge_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage badge progress" ON public.badge_progress
    FOR ALL USING (true);

-- Insert all the badges
INSERT INTO public.badges (name, description, icon, category, tier, requirement_type, requirement_value, is_progression, progression_group) VALUES

-- Beginner Engagement
('First Sip', 'Leave your first review', '💧', 'beginner', 'special', 'count', 1, false, null),
('Cartographer', 'Add your first new fountain to the map', '🗺', 'beginner', 'special', 'count', 1, false, null),

-- Reviewer Progression
('Bronze Reviewer', 'Write 5 reviews', '🥉', 'reviewer', 'bronze', 'count', 5, true, 'reviewer'),
('Silver Reviewer', 'Write 15 reviews', '🥈', 'reviewer', 'silver', 'count', 15, true, 'reviewer'),
('Gold Reviewer', 'Write 40 reviews', '🥇', 'reviewer', 'gold', 'count', 40, true, 'reviewer'),
('Platinum Reviewer', 'Write 100+ reviews', '💎', 'reviewer', 'platinum', 'count', 100, true, 'reviewer'),

-- Explorer Progression
('Campus Explorer', 'Review 5 unique fountains', '🧭', 'explorer', 'bronze', 'count', 5, true, 'explorer'),
('Neighborhood Navigator', 'Review 15 unique fountains', '🗺', 'explorer', 'silver', 'count', 15, true, 'explorer'),
('Campus Cartographer', 'Review 30 unique fountains', '📐', 'explorer', 'gold', 'count', 30, true, 'explorer'),
('Legendary Explorer', 'Review all fountains in database', '👑', 'explorer', 'platinum', 'count', 50, true, 'explorer'),

-- Visual Contributor Progression
('Shutterbug', 'Upload 3 fountain photos', '📷', 'visual', 'bronze', 'count', 3, true, 'visual'),
('Photo Enthusiast', 'Upload 10 photos', '📸', 'visual', 'silver', 'count', 10, true, 'visual'),
('Visual Storyteller', 'Upload 25 photos', '🎨', 'visual', 'gold', 'count', 25, true, 'visual'),
('Campus Documentarian', 'Upload 50+ photos', '📚', 'visual', 'platinum', 'count', 50, true, 'visual'),

-- Quality Critic Path
('Balanced Judge', 'Give reviews in all 4 categories', '⚖️', 'quality', 'special', 'special', 1, false, null),
('Thoughtful Reviewer', 'Write 10 reviews with comments', '✍️', 'quality', 'bronze', 'count', 10, true, 'quality'),
('Insightful Critic', 'Write 25 deep reviews with comments', '🔍', 'quality', 'silver', 'count', 25, true, 'quality'),
('Fountain Scholar', 'Write 50+ quality reviews', '🎓', 'quality', 'gold', 'count', 50, true, 'quality'),

-- Social Progression
('Friendly Follower', 'Follow 3 users', '🤝', 'social', 'bronze', 'count', 3, true, 'social'),
('Hydrate Buddy', 'Follow 5 users', '👥', 'social', 'silver', 'count', 5, true, 'social'),
('Community Member', 'Follow 10 users', '🏘️', 'social', 'gold', 'count', 10, true, 'social'),
('Campus Influencer', 'Get 25 followers', '🌟', 'social', 'platinum', 'count', 25, true, 'social'),

-- Maintenance Helper Path
('Filter Watcher', 'Flag 3 bad filters', '🟡', 'maintenance', 'bronze', 'count', 3, true, 'maintenance'),
('Condition Reporter', 'Report 10 fountain issues', '🔴', 'maintenance', 'silver', 'count', 10, true, 'maintenance'),
('Maintenance Scout', 'Report 25 fountain issues', '🛠️', 'maintenance', 'gold', 'count', 25, true, 'maintenance'),
('Guardian of Hydration', 'Report 50+ fountain issues', '🛡️', 'maintenance', 'platinum', 'count', 50, true, 'maintenance'),

-- Streaks & Consistency
('Daily Drinker', 'Review 3 days in a row', '🔥', 'streak', 'bronze', 'streak', 3, true, 'streak'),
('Weekly Warrior', 'Review once a week for a month', '⚔️', 'streak', 'silver', 'streak', 4, true, 'streak'),
('Semester Survivor', 'Stay active all semester', '🎓', 'streak', 'gold', 'streak', 12, true, 'streak'),
('Hydration Veteran', '1-year activity streak', '🏆', 'streak', 'platinum', 'streak', 52, true, 'streak'),

-- Special Achievements
('Hidden Gem Finder', 'First to review an unreviewed fountain', '💎', 'special', 'special', 'special', 1, false, null),
('Trendsetter', 'Review becomes most liked of the week', '🥇', 'special', 'special', 'special', 1, false, null),
('Ripple Effect', 'Your reviews get 50 total likes', '🌊', 'special', 'special', 'count', 50, false, null),
('All Floors Covered', 'Review fountains across 5 different buildings', '🏢', 'special', 'special', 'count', 5, false, null);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_badge_progress_user_id ON public.badge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_badge_progress_group ON public.badge_progress(progression_group);

-- Add comments
COMMENT ON TABLE public.badges IS 'Master list of all available badges and achievements';
COMMENT ON TABLE public.user_badges IS 'Tracks which badges each user has earned';
COMMENT ON TABLE public.badge_progress IS 'Tracks progress on progression-based badges';
