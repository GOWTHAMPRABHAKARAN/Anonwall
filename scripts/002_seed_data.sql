-- Insert sample users (these will be created through Supabase Auth)
-- This is just for reference - actual users will be created via auth

-- Insert sample public walls for testing
INSERT INTO walls (name, description, tags, is_public, creator_id) VALUES
  ('General Discussion', 'Share your thoughts anonymously on any topic', ARRAY['general', 'discussion', 'anonymous'], true, NULL),
  ('Tech Talk', 'Anonymous discussions about technology, programming, and innovation', ARRAY['tech', 'programming', 'innovation'], true, NULL),
  ('Feedback Corner', 'Anonymous feedback and suggestions for improvement', ARRAY['feedback', 'suggestions', 'improvement'], true, NULL);

-- Insert sample posts for the public walls
INSERT INTO posts (wall_id, content, anonymous_author) VALUES
  ((SELECT id FROM walls WHERE name = 'General Discussion' LIMIT 1), 'Welcome to the general discussion wall! Feel free to share your thoughts anonymously.', 'Anonymous User'),
  ((SELECT id FROM walls WHERE name = 'Tech Talk' LIMIT 1), 'What are your thoughts on the latest AI developments?', 'Tech Enthusiast'),
  ((SELECT id FROM walls WHERE name = 'Feedback Corner' LIMIT 1), 'This platform is great for anonymous discussions!', 'Happy User');
