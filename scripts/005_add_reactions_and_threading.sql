-- Add threading support to walls table
ALTER TABLE walls ADD COLUMN IF NOT EXISTS threading_enabled BOOLEAN DEFAULT false;

-- Add threading support to posts table  
ALTER TABLE posts ADD COLUMN IF NOT EXISTS parent_post_id UUID REFERENCES posts(id) ON DELETE CASCADE;

-- Create post_reactions table for emoji reactions
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  reaction_type VARCHAR(10) NOT NULL CHECK (reaction_type IN ('👍', '👎', '❤️')),
  user_ip INET NOT NULL, -- Track by IP to prevent spam while maintaining anonymity
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, reaction_type, user_ip) -- Prevent duplicate reactions from same IP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_parent ON posts(parent_post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_type ON post_reactions(reaction_type);

-- Enable Row Level Security
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view post reactions" ON post_reactions;
DROP POLICY IF EXISTS "Anyone can add reactions" ON post_reactions;
DROP POLICY IF EXISTS "Users can remove their own reactions" ON post_reactions;

-- RLS Policies for post_reactions
CREATE POLICY "Anyone can view post reactions" ON post_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      JOIN walls ON posts.wall_id = walls.id
      WHERE posts.id = post_reactions.post_id 
      AND (walls.is_public = true OR walls.creator_id = auth.uid())
    )
  );

CREATE POLICY "Anyone can add reactions" ON post_reactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts 
      JOIN walls ON posts.wall_id = walls.id
      WHERE posts.id = post_reactions.post_id 
      AND (walls.is_public = true OR walls.creator_id = auth.uid())
    )
  );

CREATE POLICY "Users can remove their own reactions" ON post_reactions
  FOR DELETE USING (user_ip = inet_client_addr());

-- Function to get reaction counts for a post
CREATE OR REPLACE FUNCTION get_post_reaction_counts(post_uuid UUID)
RETURNS TABLE(reaction_type VARCHAR(10), count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.reaction_type,
    COUNT(*) as count
  FROM post_reactions pr
  WHERE pr.post_id = post_uuid
  GROUP BY pr.reaction_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get threaded posts for a wall
CREATE OR REPLACE FUNCTION get_threaded_posts(wall_uuid UUID)
RETURNS TABLE(
  id UUID,
  content TEXT,
  anonymous_author VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE,
  parent_post_id UUID,
  reply_count BIGINT,
  reaction_counts JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH post_replies AS (
    SELECT 
      p.parent_post_id,
      COUNT(*) as reply_count
    FROM posts p
    WHERE p.wall_id = wall_uuid AND p.parent_post_id IS NOT NULL
    GROUP BY p.parent_post_id
  ),
  post_reactions AS (
    SELECT 
      pr.post_id,
      jsonb_object_agg(pr.reaction_type, pr.count) as reaction_counts
    FROM (
      SELECT 
        pr.post_id,
        pr.reaction_type,
        COUNT(*) as count
      FROM post_reactions pr
      JOIN posts p ON pr.post_id = p.id
      WHERE p.wall_id = wall_uuid
      GROUP BY pr.post_id, pr.reaction_type
    ) pr
    GROUP BY pr.post_id
  )
  SELECT 
    p.id,
    p.content,
    p.anonymous_author,
    p.created_at,
    p.parent_post_id,
    COALESCE(pr.reply_count, 0) as reply_count,
    COALESCE(prc.reaction_counts, '{}'::jsonb) as reaction_counts
  FROM posts p
  LEFT JOIN post_replies pr ON p.id = pr.parent_post_id
  LEFT JOIN post_reactions prc ON p.id = prc.post_id
  WHERE p.wall_id = wall_uuid
  -- Changed from ASC to DESC to show newest posts first
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
