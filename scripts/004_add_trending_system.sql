-- Add trending and streak system to walls and users

-- Add trending fields to walls table
ALTER TABLE walls ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false;
ALTER TABLE walls ADD COLUMN IF NOT EXISTS trending_score INTEGER DEFAULT 0;
ALTER TABLE walls ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add streak fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_trending_date DATE;

-- Create trending_history table to track trending walls over time
CREATE TABLE IF NOT EXISTS trending_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wall_id UUID REFERENCES walls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trending_date DATE DEFAULT CURRENT_DATE,
  trending_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wall_id, trending_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_walls_trending ON walls(is_trending, trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_walls_last_activity ON walls(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_trending_history_date ON trending_history(trending_date DESC);
CREATE INDEX IF NOT EXISTS idx_trending_history_user ON trending_history(user_id, trending_date);

-- Function to calculate trending score based on recent activity
CREATE OR REPLACE FUNCTION calculate_trending_score(wall_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  recent_posts INTEGER;
  wall_age_hours INTEGER;
  trending_score INTEGER;
BEGIN
  -- Count posts from last 24 hours
  SELECT COUNT(*) INTO recent_posts
  FROM posts 
  WHERE wall_id = wall_id_param 
  AND created_at > NOW() - INTERVAL '24 hours';
  
  -- Get wall age in hours
  SELECT EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 INTO wall_age_hours
  FROM walls 
  WHERE id = wall_id_param;
  
  -- Calculate trending score (more recent posts = higher score, newer walls get bonus)
  trending_score := recent_posts * 10;
  
  -- Bonus for newer walls (within 7 days)
  IF wall_age_hours < 168 THEN
    trending_score := trending_score + (168 - wall_age_hours) / 24;
  END IF;
  
  RETURN GREATEST(trending_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update trending status for all walls
CREATE OR REPLACE FUNCTION update_trending_walls()
RETURNS void AS $$
DECLARE
  wall_record RECORD;
  score INTEGER;
BEGIN
  -- Reset all trending status
  UPDATE walls SET is_trending = false, trending_score = 0;
  
  -- Calculate trending scores for all public walls
  FOR wall_record IN 
    SELECT id FROM walls WHERE is_public = true
  LOOP
    score := calculate_trending_score(wall_record.id);
    
    UPDATE walls 
    SET trending_score = score,
        is_trending = (score >= 10) -- Trending threshold
    WHERE id = wall_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update user streaks
CREATE OR REPLACE FUNCTION update_user_streaks()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  consecutive_days INTEGER;
  today_date DATE := CURRENT_DATE;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT creator_id FROM walls WHERE creator_id IS NOT NULL
  LOOP
    -- Count consecutive days with trending walls
    WITH consecutive_trending AS (
      SELECT 
        trending_date,
        ROW_NUMBER() OVER (ORDER BY trending_date DESC) as rn,
        trending_date - INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY trending_date DESC) - 1) as group_date
      FROM trending_history th
      JOIN walls w ON th.wall_id = w.id
      WHERE w.creator_id = user_record.creator_id
      AND trending_date >= today_date - INTERVAL '30 days'
      ORDER BY trending_date DESC
    ),
    streak_groups AS (
      SELECT 
        group_date,
        COUNT(*) as streak_length
      FROM consecutive_trending
      WHERE group_date = today_date - INTERVAL '1 day' * (
        SELECT MIN(rn) - 1 FROM consecutive_trending WHERE group_date = consecutive_trending.group_date
      )
      GROUP BY group_date
      ORDER BY group_date DESC
      LIMIT 1
    )
    SELECT COALESCE(streak_length, 0) INTO consecutive_days FROM streak_groups;
    
    -- Update user streak
    UPDATE users 
    SET 
      current_streak = consecutive_days,
      best_streak = GREATEST(best_streak, consecutive_days),
      last_trending_date = (
        SELECT MAX(trending_date) 
        FROM trending_history th
        JOIN walls w ON th.wall_id = w.id
        WHERE w.creator_id = user_record.creator_id
      )
    WHERE id = user_record.creator_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to record trending walls daily
CREATE OR REPLACE FUNCTION record_daily_trending()
RETURNS void AS $$
BEGIN
  -- Record today's trending walls
  INSERT INTO trending_history (wall_id, user_id, trending_date, trending_score)
  SELECT 
    w.id,
    w.creator_id,
    CURRENT_DATE,
    w.trending_score
  FROM walls w
  WHERE w.is_trending = true
  ON CONFLICT (wall_id, trending_date) DO UPDATE SET
    trending_score = EXCLUDED.trending_score;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_activity_at when posts are added
CREATE OR REPLACE FUNCTION update_wall_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE walls 
  SET last_activity_at = NOW()
  WHERE id = NEW.wall_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_wall_activity_trigger ON posts;
CREATE TRIGGER update_wall_activity_trigger
  AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION update_wall_activity();

-- Enable RLS for new table
ALTER TABLE trending_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policy before creating new one to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view trending history" ON trending_history;

-- RLS Policy for trending_history
CREATE POLICY "Anyone can view trending history" ON trending_history
  FOR SELECT USING (true);

-- Initial trending calculation
SELECT update_trending_walls();
SELECT record_daily_trending();
SELECT update_user_streaks();
