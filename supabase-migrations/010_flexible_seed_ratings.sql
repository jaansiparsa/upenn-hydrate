-- Alternative seeding script that works with any existing fountains
-- This script creates sample users and ratings for any fountains in the database

-- Create sample users (only if they don't exist)
INSERT INTO public.users (id, email, penn_email, display_name, total_ratings, badges, created_at) 
VALUES 
-- Sample user 1
('11111111-1111-1111-1111-111111111111', 'alice.johnson@upenn.edu', 'alice.johnson@upenn.edu', 'Alice Johnson', 0, ARRAY['new_reviewer'], NOW() - INTERVAL '5 days'),
-- Sample user 2  
('22222222-2222-2222-2222-222222222222', 'bob.smith@upenn.edu', 'bob.smith@upenn.edu', 'Bob Smith', 0, ARRAY['new_reviewer'], NOW() - INTERVAL '3 days'),
-- Sample user 3
('33333333-3333-3333-3333-333333333333', 'charlie.brown@upenn.edu', 'charlie.brown@upenn.edu', 'Charlie Brown', 0, ARRAY['new_reviewer'], NOW() - INTERVAL '7 days'),
-- Sample user 4
('44444444-4444-4444-4444-444444444444', 'diana.prince@upenn.edu', 'diana.prince@upenn.edu', 'Diana Prince', 0, ARRAY['new_reviewer'], NOW() - INTERVAL '2 days'),
-- Sample user 5
('55555555-5555-5555-5555-555555555555', 'eve.adams@upenn.edu', 'eve.adams@upenn.edu', 'Eve Adams', 0, ARRAY['new_reviewer'], NOW() - INTERVAL '10 days'),
-- Sample user 6
('66666666-6666-6666-6666-666666666666', 'frank.miller@upenn.edu', 'frank.miller@upenn.edu', 'Frank Miller', 0, ARRAY['new_reviewer'], NOW() - INTERVAL '1 day'),
-- Sample user 7
('77777777-7777-7777-7777-777777777777', 'grace.hopper@upenn.edu', 'grace.hopper@upenn.edu', 'Grace Hopper', 0, ARRAY['new_reviewer'], NOW() - INTERVAL '4 days'),
-- Sample user 8
('88888888-8888-8888-8888-888888888888', 'henry.ford@upenn.edu', 'henry.ford@upenn.edu', 'Henry Ford', 0, ARRAY['new_reviewer'], NOW() - INTERVAL '6 days'),
-- Sample user 9
('99999999-9999-9999-9999-999999999999', 'iris.wilson@upenn.edu', 'iris.wilson@upenn.edu', 'Iris Wilson', 0, ARRAY['new_reviewer'], NOW() - INTERVAL '8 days'),
-- Sample user 10
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'jack.davis@upenn.edu', 'jack.davis@upenn.edu', 'Jack Davis', 0, ARRAY['new_reviewer'], NOW() - INTERVAL '9 days')
ON CONFLICT (id) DO NOTHING;

-- Create sample ratings for existing fountains
-- This will create 2-3 ratings per fountain with realistic data
WITH fountain_data AS (
  SELECT id, name, status FROM public.fountains LIMIT 10
),
user_data AS (
  SELECT id FROM public.users WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222', 
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666',
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888',
    '99999999-9999-9999-9999-999999999999',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  )
),
rating_combinations AS (
  SELECT 
    f.id as fountain_id,
    f.name as fountain_name,
    f.status as fountain_status,
    u.id as user_id,
    -- Generate realistic ratings based on fountain status
    CASE 
      WHEN f.status = 'working' THEN floor(random() * 2) + 4  -- 4-5 stars
      WHEN f.status = 'bad_filter' THEN floor(random() * 2) + 2  -- 2-3 stars  
      WHEN f.status = 'out_of_order' THEN floor(random() * 2) + 1  -- 1-2 stars
      ELSE floor(random() * 3) + 3  -- 3-5 stars
    END as coldness,
    CASE 
      WHEN f.status = 'working' THEN floor(random() * 2) + 4  -- 4-5 stars
      WHEN f.status = 'bad_filter' THEN floor(random() * 2) + 2  -- 2-3 stars
      WHEN f.status = 'out_of_order' THEN floor(random() * 2) + 1  -- 1-2 stars
      ELSE floor(random() * 3) + 3  -- 3-5 stars
    END as experience,
    CASE 
      WHEN f.status = 'working' THEN floor(random() * 2) + 3  -- 3-4 stars
      WHEN f.status = 'bad_filter' THEN floor(random() * 2) + 2  -- 2-3 stars
      WHEN f.status = 'out_of_order' THEN floor(random() * 2) + 1  -- 1-2 stars
      ELSE floor(random() * 3) + 3  -- 3-5 stars
    END as pressure,
    CASE 
      WHEN f.status = 'working' THEN floor(random() * 2) + 4  -- 4-5 stars
      WHEN f.status = 'bad_filter' THEN floor(random() * 2) + 2  -- 2-3 stars
      WHEN f.status = 'out_of_order' THEN floor(random() * 2) + 1  -- 1-2 stars
      ELSE floor(random() * 3) + 3  -- 3-5 stars
    END as yum_factor,
    -- Generate realistic comments based on ratings
    CASE 
      WHEN f.status = 'working' THEN 
        CASE floor(random() * 4)
          WHEN 0 THEN 'Great fountain! Water is really cold and refreshing.'
          WHEN 1 THEN 'Excellent water quality. Perfect for staying hydrated.'
          WHEN 2 THEN 'Love this fountain! Always reliable and clean.'
          ELSE 'Best fountain on campus! Highly recommend.'
        END
      WHEN f.status = 'bad_filter' THEN
        CASE floor(random() * 3)
          WHEN 0 THEN 'Water tastes a bit off. Filter might need changing.'
          WHEN 1 THEN 'Decent fountain but water quality could be better.'
          ELSE 'Average fountain. Nothing special but works.'
        END
      WHEN f.status = 'out_of_order' THEN
        CASE floor(random() * 3)
          WHEN 0 THEN 'This fountain is broken. No water coming out.'
          WHEN 1 THEN 'Out of order. Needs repair.'
          ELSE 'Not working properly. Avoid this one.'
        END
      ELSE 'Decent fountain. Gets the job done.'
    END as comment,
    NOW() - (random() * INTERVAL '10 days') as created_at
  FROM fountain_data f
  CROSS JOIN user_data u
  WHERE random() < 0.3  -- Only create ratings for 30% of combinations
)
INSERT INTO public.ratings (fountain_id, user_id, coldness, experience, pressure, yum_factor, comment, created_at)
SELECT 
  fountain_id,
  user_id, 
  coldness,
  experience,
  pressure,
  yum_factor,
  comment,
  created_at
FROM rating_combinations
ON CONFLICT DO NOTHING;

-- Update user total_ratings counts
UPDATE public.users 
SET total_ratings = (
  SELECT COUNT(*) 
  FROM public.ratings 
  WHERE ratings.user_id = users.id
);

-- Update badges based on rating counts
UPDATE public.users 
SET badges = CASE 
  WHEN total_ratings >= 5 THEN ARRAY['frequent_reviewer', 'quality_reviewer', 'helpful_reviewer']
  WHEN total_ratings >= 3 THEN ARRAY['frequent_reviewer', 'quality_reviewer'] 
  WHEN total_ratings >= 1 THEN ARRAY['new_reviewer']
  ELSE ARRAY[]::text[]
END;

-- Display summary
SELECT 
  'Seeding Complete!' as status,
  (SELECT COUNT(*) FROM public.users WHERE total_ratings > 0) as users_with_ratings,
  (SELECT COUNT(*) FROM public.ratings) as total_ratings,
  (SELECT COUNT(DISTINCT fountain_id) FROM public.ratings) as fountains_with_ratings;
