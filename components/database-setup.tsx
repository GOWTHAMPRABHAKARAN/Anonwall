"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Play, Copy, CheckCircle } from "lucide-react"
import { useState } from "react"

export function DatabaseSetup() {
  const [copiedScript, setCopiedScript] = useState<string | null>(null)

  const copyToClipboard = (text: string, scriptName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedScript(scriptName)
    setTimeout(() => setCopiedScript(null), 2000)
  }

  const createTablesScript = `-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create walls table
CREATE TABLE IF NOT EXISTS walls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT true,
  pin TEXT,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wall_id UUID REFERENCES walls(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE walls ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Public walls are viewable by everyone" ON walls FOR SELECT USING (is_public = true OR creator_id = auth.uid());
CREATE POLICY "Users can create walls" ON walls FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Users can update their own walls" ON walls FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Users can delete their own walls" ON walls FOR DELETE USING (creator_id = auth.uid());
CREATE POLICY "Posts in public walls are viewable by everyone" ON posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM walls WHERE walls.id = posts.wall_id AND (walls.is_public = true OR walls.creator_id = auth.uid()))
);
CREATE POLICY "Anyone can create posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Wall creators can delete posts" ON posts FOR DELETE USING (
  EXISTS (SELECT 1 FROM walls WHERE walls.id = posts.wall_id AND walls.creator_id = auth.uid())
);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();`

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Database className="h-12 w-12 text-purple-500" />
          </div>
          <CardTitle className="text-2xl text-white">Database Setup Required</CardTitle>
          <CardDescription className="text-gray-400">
            AnonWall needs database tables to be created before you can start using the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Play className="h-5 w-5 text-green-500" />
              Step 1: Run Database Setup Script
            </h3>
            <p className="text-gray-400 mb-4">
              Copy and run this SQL script in your Supabase SQL Editor to create the required tables and security
              policies.
            </p>
            <div className="relative">
              <pre className="bg-gray-950 text-gray-300 p-4 rounded-lg text-sm overflow-x-auto max-h-64 overflow-y-auto">
                {createTablesScript}
              </pre>
              <Button
                onClick={() => copyToClipboard(createTablesScript, "setup")}
                className="absolute top-2 right-2 bg-purple-600 hover:bg-purple-700"
                size="sm"
              >
                {copiedScript === "setup" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">How to run the script:</h4>
            <ol className="text-gray-300 space-y-1 text-sm">
              <li>1. Go to your Supabase project dashboard</li>
              <li>2. Navigate to the "SQL Editor" section</li>
              <li>3. Create a new query and paste the script above</li>
              <li>4. Click "Run" to execute the script</li>
              <li>5. Refresh this page once the script completes</li>
            </ol>
          </div>

          <div className="text-center">
            <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
              I've run the script - Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
