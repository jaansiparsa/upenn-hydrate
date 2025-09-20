-- Database seeding script for ratings and users
-- This script creates sample users and ratings for testing the application

-- First, create sample users
-- Note: These users won't have auth accounts, but will have entries in the users table
INSERT INTO public.users (id, email, penn_email, display_name, total_ratings, badges, created_at) 
VALUES 
-- Sample user 1
('11111111-1111-1111-1111-111111111111', 'alice.johnson@upenn.edu', 'alice.johnson@upenn.edu', 'Alice Johnson', 3, ARRAY['frequent_reviewer'], NOW() - INTERVAL '5 days'),
-- Sample user 2  
('22222222-2222-2222-2222-222222222222', 'bob.smith@upenn.edu', 'bob.smith@upenn.edu', 'Bob Smith', 2, ARRAY['new_reviewer'], NOW() - INTERVAL '3 days'),
-- Sample user 3
('33333333-3333-3333-3333-333333333333', 'charlie.brown@upenn.edu', 'charlie.brown@upenn.edu', 'Charlie Brown', 4, ARRAY['frequent_reviewer', 'quality_reviewer'], NOW() - INTERVAL '7 days'),
-- Sample user 4
('44444444-4444-4444-4444-444444444444', 'diana.prince@upenn.edu', 'diana.prince@upenn.edu', 'Diana Prince', 2, ARRAY['new_reviewer'], NOW() - INTERVAL '2 days'),
-- Sample user 5
('55555555-5555-5555-5555-555555555555', 'eve.adams@upenn.edu', 'eve.adams@upenn.edu', 'Eve Adams', 5, ARRAY['frequent_reviewer', 'quality_reviewer', 'helpful_reviewer'], NOW() - INTERVAL '10 days'),
-- Sample user 6
('66666666-6666-6666-6666-666666666666', 'frank.miller@upenn.edu', 'frank.miller@upenn.edu', 'Frank Miller', 1, ARRAY['new_reviewer'], NOW() - INTERVAL '1 day'),
-- Sample user 7
('77777777-7777-7777-7777-777777777777', 'grace.hopper@upenn.edu', 'grace.hopper@upenn.edu', 'Grace Hopper', 3, ARRAY['frequent_reviewer'], NOW() - INTERVAL '4 days'),
-- Sample user 8
('88888888-8888-8888-8888-888888888888', 'henry.ford@upenn.edu', 'henry.ford@upenn.edu', 'Henry Ford', 2, ARRAY['new_reviewer'], NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

-- Get fountain IDs for creating realistic ratings
-- We'll use the sample fountains from the migration files
-- Note: You may need to adjust these IDs based on your actual fountain data

-- Create sample ratings for various fountains
-- Rating 1: Alice's review of Van Pelt Library Fountain
INSERT INTO public.ratings (id, fountain_id, user_id, coldness, experience, pressure, yum_factor, comment, created_at)
VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 (SELECT id FROM public.fountains WHERE name = 'Van Pelt Library Fountain' LIMIT 1),
 '11111111-1111-1111-1111-111111111111', 
 4, 5, 3, 4, 
 'Great fountain! Water is really cold and tastes clean. Pressure could be better though.', 
 NOW() - INTERVAL '5 days'),

-- Rating 2: Bob's review of Locust Walk Fountain  
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 (SELECT id FROM public.fountains WHERE name = 'Locust Walk Fountain' LIMIT 1),
 '22222222-2222-2222-2222-222222222222',
 3, 4, 5, 4,
 'Nice outdoor fountain with good pressure. Water is decently cold.',
 NOW() - INTERVAL '3 days'),

-- Rating 3: Charlie's review of Engineering Fountain
('cccccccc-cccc-cccc-cccc-cccccccccccc',
 (SELECT id FROM public.fountains WHERE name = 'Engineering Fountain' LIMIT 1),
 '33333333-3333-3333-3333-333333333333',
 2, 2, 2, 2,
 'This fountain needs maintenance. Water is warm and tastes off.',
 NOW() - INTERVAL '7 days'),

-- Rating 4: Diana's review of College Hall Fountain
('dddddddd-dddd-dddd-dddd-dddddddddddd',
 (SELECT id FROM public.fountains WHERE name = 'College Hall Fountain' LIMIT 1),
 '44444444-4444-4444-4444-444444444444',
 1, 1, 1, 1,
 'Completely broken. No water coming out at all.',
 NOW() - INTERVAL '2 days'),

-- Rating 5: Eve's review of Van Pelt Library Fountain (second review)
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
 (SELECT id FROM public.fountains WHERE name = 'Van Pelt Library Fountain' LIMIT 1),
 '55555555-5555-5555-5555-555555555555',
 5, 5, 4, 5,
 'Excellent fountain! Always reliable and the water tastes great. Perfect for studying.',
 NOW() - INTERVAL '10 days'),

-- Rating 6: Frank's review of Locust Walk Fountain
('ffffffff-ffff-ffff-ffff-ffffffffffff',
 (SELECT id FROM public.fountains WHERE name = 'Locust Walk Fountain' LIMIT 1),
 '66666666-6666-6666-6666-666666666666',
 4, 4, 4, 4,
 'Good fountain for a quick drink between classes.',
 NOW() - INTERVAL '1 day'),

-- Rating 7: Grace's review of Engineering Fountain
('gggggggg-gggg-gggg-gggg-gggggggggggg',
 (SELECT id FROM public.fountains WHERE name = 'Engineering Fountain' LIMIT 1),
 '77777777-7777-7777-7777-777777777777',
 3, 3, 3, 3,
 'Average fountain. Nothing special but gets the job done.',
 NOW() - INTERVAL '4 days'),

-- Rating 8: Henry's review of College Hall Fountain
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
 (SELECT id FROM public.fountains WHERE name = 'College Hall Fountain' LIMIT 1),
 '88888888-8888-8888-8888-888888888888',
 2, 2, 2, 2,
 'Had issues with this fountain. Water pressure is very low.',
 NOW() - INTERVAL '6 days'),

-- Additional ratings for more variety
-- Rating 9: Alice's second review (Locust Walk)
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
 (SELECT id FROM public.fountains WHERE name = 'Locust Walk Fountain' LIMIT 1),
 '11111111-1111-1111-1111-111111111111',
 4, 4, 5, 4,
 'Love this outdoor fountain! Great for hot days.',
 NOW() - INTERVAL '4 days'),

-- Rating 10: Charlie's second review (Van Pelt)
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj',
 (SELECT id FROM public.fountains WHERE name = 'Van Pelt Library Fountain' LIMIT 1),
 '33333333-3333-3333-3333-333333333333',
 5, 5, 4, 5,
 'Best fountain on campus! Always cold and refreshing.',
 NOW() - INTERVAL '6 days'),

-- Rating 11: Eve's second review (Locust Walk)
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk',
 (SELECT id FROM public.fountains WHERE name = 'Locust Walk Fountain' LIMIT 1),
 '55555555-5555-5555-5555-555555555555',
 4, 4, 4, 4,
 'Reliable outdoor fountain. Good for staying hydrated.',
 NOW() - INTERVAL '8 days'),

-- Rating 12: Grace's second review (Van Pelt)
('llllllll-llll-llll-llll-llllllllllll',
 (SELECT id FROM public.fountains WHERE name = 'Van Pelt Library Fountain' LIMIT 1),
 '77777777-7777-7777-7777-777777777777',
 4, 4, 3, 4,
 'Good fountain inside the library. Convenient location.',
 NOW() - INTERVAL '3 days'),

-- Rating 13: Alice's third review (Engineering)
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm',
 (SELECT id FROM public.fountains WHERE name = 'Engineering Fountain' LIMIT 1),
 '11111111-1111-1111-1111-111111111111',
 3, 3, 3, 3,
 'Decent fountain. Could be colder but works fine.',
 NOW() - INTERVAL '2 days'),

-- Rating 14: Charlie's third review (College Hall)
('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn',
 (SELECT id FROM public.fountains WHERE name = 'College Hall Fountain' LIMIT 1),
 '33333333-3333-3333-3333-333333333333',
 2, 2, 2, 2,
 'This fountain has been problematic. Needs repair.',
 NOW() - INTERVAL '5 days'),

-- Rating 15: Eve's third review (Engineering)
('oooooooo-oooo-oooo-oooo-oooooooooooo',
 (SELECT id FROM public.fountains WHERE name = 'Engineering Fountain' LIMIT 1),
 '55555555-5555-5555-5555-555555555555',
 3, 3, 3, 3,
 'Average fountain. Nothing to complain about.',
 NOW() - INTERVAL '7 days')

ON CONFLICT (id) DO NOTHING;

-- Update user total_ratings counts based on actual ratings
UPDATE public.users 
SET total_ratings = (
  SELECT COUNT(*) 
  FROM public.ratings 
  WHERE ratings.user_id = users.id
);

-- Add some additional badges based on rating counts
UPDATE public.users 
SET badges = CASE 
  WHEN total_ratings >= 5 THEN ARRAY['frequent_reviewer', 'quality_reviewer', 'helpful_reviewer']
  WHEN total_ratings >= 3 THEN ARRAY['frequent_reviewer', 'quality_reviewer']
  WHEN total_ratings >= 1 THEN ARRAY['new_reviewer']
  ELSE ARRAY[]::text[]
END;

-- Display summary of seeded data
SELECT 
  'Users seeded: ' || COUNT(*) as summary
FROM public.users 
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888'
)

UNION ALL

SELECT 
  'Ratings seeded: ' || COUNT(*) as summary
FROM public.ratings 
WHERE id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'gggggggg-gggg-gggg-gggg-gggggggggggg',
  'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
  'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
  'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj',
  'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk',
  'llllllll-llll-llll-llll-llllllllllll',
  'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm',
  'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn',
  'oooooooo-oooo-oooo-oooo-oooooooooooo'
);
