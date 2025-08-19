-- Add reports table for post reporting system
CREATE TABLE IF NOT EXISTS post_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  reporter_ip VARCHAR(45), -- Store IP address for anonymous reporting
  reason VARCHAR(100), -- Report reason (spam, inappropriate, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add report_count column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_post_reports_post_id ON post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_ip ON post_reports(reporter_ip);

-- Enable RLS for reports table
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones to avoid conflicts
DROP POLICY IF EXISTS "Anyone can create post reports" ON post_reports;
DROP POLICY IF EXISTS "Wall creators can view reports for their walls" ON post_reports;

-- RLS Policy for reports - anyone can create reports, only wall creators can view
CREATE POLICY "Anyone can create post reports" ON post_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Wall creators can view reports for their walls" ON post_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      JOIN walls ON posts.wall_id = walls.id 
      WHERE posts.id = post_reports.post_id 
      AND walls.creator_id = auth.uid()
    )
  );

-- Function to auto-hide posts with too many reports
CREATE OR REPLACE FUNCTION check_post_reports()
RETURNS TRIGGER AS $$
BEGIN
  -- If post reaches 5 reports, mark it as hidden (we'll add is_hidden column)
  IF NEW.report_count >= 5 THEN
    -- For now, we'll delete the post automatically
    DELETE FROM posts WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check reports when count is updated
DROP TRIGGER IF EXISTS trigger_check_post_reports ON posts;
CREATE TRIGGER trigger_check_post_reports
  AFTER UPDATE OF report_count ON posts
  FOR EACH ROW EXECUTE FUNCTION check_post_reports();
