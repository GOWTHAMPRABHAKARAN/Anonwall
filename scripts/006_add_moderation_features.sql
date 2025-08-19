-- Add moderation features: keyword filtering, spam detection, moderation queue, and logs

-- Keyword filtering table
CREATE TABLE IF NOT EXISTS banned_keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL UNIQUE,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  action TEXT NOT NULL DEFAULT 'flag' CHECK (action IN ('flag', 'block', 'auto_delete')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Moderation queue table
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  wall_id UUID REFERENCES walls(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  flagged_keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id)
);

-- Moderation logs table
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  wall_id UUID REFERENCES walls(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  reason TEXT NOT NULL,
  moderator_id UUID REFERENCES users(id),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spam detection tracking
CREATE TABLE IF NOT EXISTS spam_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  wall_id UUID REFERENCES walls(id) ON DELETE CASCADE,
  post_count INTEGER DEFAULT 1,
  last_post_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Added unique constraint for ON CONFLICT to work properly
  UNIQUE(ip_address, wall_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_banned_keywords_keyword ON banned_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_created_at ON moderation_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_created_at ON moderation_logs(created_at);
-- Removed redundant index since we now have unique constraint
-- CREATE INDEX IF NOT EXISTS idx_spam_tracking_ip_wall ON spam_tracking(ip_address, wall_id);

-- Updated with comprehensive professional word list for better content moderation
-- Clear existing placeholder keywords and insert professional word list
DELETE FROM banned_keywords WHERE keyword IN ('spam', 'scam', 'hate', 'abuse', 'harassment');

-- Insert comprehensive banned keywords for anonymous discussion platform
INSERT INTO banned_keywords (keyword, severity, action) VALUES
-- High priority offensive content (block immediately)
('f***', 'high', 'block'),
('s***', 'high', 'block'),
('b****', 'high', 'block'),
('n****r', 'high', 'block'),
('f****t', 'high', 'block'),

-- Hate speech and harassment (flag for review)
('kill yourself', 'high', 'flag'),
('kys', 'high', 'flag'),
('die', 'medium', 'flag'),
('stupid', 'low', 'flag'),
('idiot', 'low', 'flag'),
('moron', 'medium', 'flag'),

-- Spam and scam indicators (block)
('click here', 'medium', 'flag'),
('free money', 'high', 'block'),
('get rich quick', 'high', 'block'),
('viagra', 'high', 'block'),
('casino', 'medium', 'flag'),
('lottery', 'medium', 'flag'),

-- Inappropriate content
('porn', 'high', 'block'),
('sex', 'medium', 'flag'),
('nude', 'high', 'block'),

-- Harassment patterns
('doxx', 'high', 'block'),
('dox', 'high', 'block'),
('swat', 'high', 'block'),
('threat', 'high', 'flag'),
('violence', 'high', 'flag')

ON CONFLICT (keyword) DO NOTHING;

-- RLS Policies
ALTER TABLE banned_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE spam_tracking ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones to prevent conflicts
-- Banned keywords policies (admin only)
DROP POLICY IF EXISTS "Admin can manage banned keywords" ON banned_keywords;
CREATE POLICY "Admin can manage banned keywords" ON banned_keywords
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM users WHERE email LIKE '%@admin.%'
  ));

-- Moderation queue policies
DROP POLICY IF EXISTS "Anyone can view moderation queue" ON moderation_queue;
CREATE POLICY "Anyone can view moderation queue" ON moderation_queue
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can insert into moderation queue" ON moderation_queue;
CREATE POLICY "System can insert into moderation queue" ON moderation_queue
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Moderators can update moderation queue" ON moderation_queue;
CREATE POLICY "Moderators can update moderation queue" ON moderation_queue
  FOR UPDATE USING (auth.uid() IN (
    SELECT id FROM users WHERE email LIKE '%@admin.%'
  ));

-- Moderation logs policies (read-only for transparency)
DROP POLICY IF EXISTS "Anyone can view moderation logs" ON moderation_logs;
CREATE POLICY "Anyone can view moderation logs" ON moderation_logs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can insert moderation logs" ON moderation_logs;
CREATE POLICY "System can insert moderation logs" ON moderation_logs
  FOR INSERT WITH CHECK (true);

-- Spam tracking policies (system only)
DROP POLICY IF EXISTS "System can manage spam tracking" ON spam_tracking;
CREATE POLICY "System can manage spam tracking" ON spam_tracking
  FOR ALL USING (true);

-- Enhanced keyword checking function with pattern matching for variations
-- Function to check for banned keywords with improved pattern matching
CREATE OR REPLACE FUNCTION check_banned_keywords(content TEXT)
RETURNS TABLE(
  found_keywords TEXT[],
  max_severity TEXT,
  recommended_action TEXT
) AS $$
DECLARE
  keyword_record RECORD;
  found_words TEXT[] := '{}';
  current_severity TEXT := 'low';
  current_action TEXT := 'flag';
  clean_content TEXT;
BEGIN
  -- Clean content for better matching (remove special chars, normalize spaces)
  clean_content := LOWER(REGEXP_REPLACE(content, '[^a-zA-Z0-9\s]', ' ', 'g'));
  clean_content := REGEXP_REPLACE(clean_content, '\s+', ' ', 'g');
  
  -- Check content against banned keywords with pattern matching
  FOR keyword_record IN 
    SELECT keyword, severity, action 
    FROM banned_keywords 
  LOOP
    -- Check for exact matches and common variations
    IF clean_content LIKE '%' || LOWER(keyword_record.keyword) || '%' OR
       clean_content LIKE '%' || REPLACE(LOWER(keyword_record.keyword), ' ', '') || '%' THEN
      
      found_words := array_append(found_words, keyword_record.keyword);
      
      -- Update severity and action based on highest severity found
      IF keyword_record.severity = 'high' THEN
        current_severity := 'high';
        current_action := keyword_record.action;
      ELSIF keyword_record.severity = 'medium' AND current_severity != 'high' THEN
        current_severity := 'medium';
        current_action := keyword_record.action;
      END IF;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT found_words, current_severity, current_action;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check spam patterns
CREATE OR REPLACE FUNCTION check_spam_pattern(
  user_ip INET,
  wall_uuid UUID,
  content_text TEXT
)
RETURNS TABLE(
  is_spam BOOLEAN,
  reason TEXT
) AS $$
DECLARE
  recent_posts INTEGER;
  similar_posts INTEGER;
  tracking_record RECORD;
BEGIN
  -- Fixed spam detection to use spam_tracking table instead of non-existent posts.ip_address column
  -- Check for rapid posting using spam_tracking table
  SELECT COALESCE(post_count, 0) INTO recent_posts
  FROM spam_tracking
  WHERE ip_address = user_ip
    AND wall_id = wall_uuid
    AND last_post_at > NOW() - INTERVAL '5 minutes';
  
  IF recent_posts >= 5 THEN
    RETURN QUERY SELECT true, 'Rapid posting detected';
    RETURN;
  END IF;
  
  -- Check for similar content in recent posts (without IP filtering since posts table doesn't have IP)
  SELECT COUNT(*) INTO similar_posts
  FROM posts p
  WHERE p.wall_id = wall_uuid
    AND p.content = content_text
    AND p.created_at > NOW() - INTERVAL '1 hour';
  
  IF similar_posts > 0 THEN
    RETURN QUERY SELECT true, 'Duplicate content detected';
    RETURN;
  END IF;
  
  -- Update spam tracking
  INSERT INTO spam_tracking (ip_address, wall_id, post_count, last_post_at)
  VALUES (user_ip, wall_uuid, 1, NOW())
  ON CONFLICT (ip_address, wall_id) 
  DO UPDATE SET 
    post_count = spam_tracking.post_count + 1,
    last_post_at = NOW();
  
  RETURN QUERY SELECT false, 'No spam detected';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
