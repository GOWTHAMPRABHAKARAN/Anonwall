-- Create short_urls table for URL shortening
CREATE TABLE IF NOT EXISTS short_urls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code VARCHAR(6) NOT NULL UNIQUE,
  wall_id UUID NOT NULL REFERENCES walls(id) ON DELETE CASCADE,
  wall_slug VARCHAR(50) NOT NULL,
  pin VARCHAR(6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_short_urls_code ON short_urls(short_code);
CREATE INDEX IF NOT EXISTS idx_short_urls_wall_id ON short_urls(wall_id);
CREATE INDEX IF NOT EXISTS idx_short_urls_expires_at ON short_urls(expires_at);

-- Add RLS policies
ALTER TABLE short_urls ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read short URLs (needed for redirects)
CREATE POLICY "Allow public read access to short_urls" ON short_urls
  FOR SELECT USING (true);

-- Allow authenticated users to create short URLs for their walls
CREATE POLICY "Allow users to create short URLs for their walls" ON short_urls
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM walls 
      WHERE walls.id = short_urls.wall_id 
      AND walls.creator_id = auth.uid()
    )
  );

-- Allow wall creators to delete their short URLs
CREATE POLICY "Allow users to delete their short URLs" ON short_urls
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM walls 
      WHERE walls.id = short_urls.wall_id 
      AND walls.creator_id = auth.uid()
    )
  );

-- Function to clean up expired short URLs
CREATE OR REPLACE FUNCTION cleanup_expired_short_urls()
RETURNS void AS $$
BEGIN
  DELETE FROM short_urls WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired URLs (runs daily)
-- Note: This requires pg_cron extension which may not be available on all Supabase plans
-- You can run this manually or set up a cron job in your application
-- SELECT cron.schedule('cleanup-expired-short-urls', '0 0 * * *', 'SELECT cleanup_expired_short_urls();');
