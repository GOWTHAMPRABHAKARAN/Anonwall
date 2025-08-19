-- Create users table for basic user management
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to automatically create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user record
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create walls table for discussion walls
CREATE TABLE IF NOT EXISTS walls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tags TEXT[], -- Array of tags
  is_public BOOLEAN DEFAULT true,
  pin VARCHAR(6), -- 6-digit PIN for private walls
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table for anonymous posts within walls
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wall_id UUID REFERENCES walls(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  anonymous_author VARCHAR(50), -- Optional anonymous identifier
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_walls_public ON walls(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_walls_creator ON walls(creator_id);
CREATE INDEX IF NOT EXISTS idx_walls_expires ON walls(expires_at);
CREATE INDEX IF NOT EXISTS idx_posts_wall ON posts(wall_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE walls ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for walls table
CREATE POLICY "Anyone can view public walls" ON walls
  FOR SELECT USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Authenticated users can create walls" ON walls
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Wall creators can update their walls" ON walls
  FOR UPDATE USING (creator_id = auth.uid());

CREATE POLICY "Wall creators can delete their walls" ON walls
  FOR DELETE USING (creator_id = auth.uid());

-- RLS Policies for posts table
CREATE POLICY "Anyone can view posts in public walls" ON posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM walls 
      WHERE walls.id = posts.wall_id 
      AND (walls.is_public = true OR walls.creator_id = auth.uid())
    )
  );

CREATE POLICY "Anyone can create posts in accessible walls" ON posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM walls 
      WHERE walls.id = posts.wall_id 
      AND (walls.is_public = true OR walls.creator_id = auth.uid())
    )
  );

CREATE POLICY "Wall creators can delete posts in their walls" ON posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM walls 
      WHERE walls.id = posts.wall_id 
      AND walls.creator_id = auth.uid()
    )
  );
