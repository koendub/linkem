-- Create profiles table for user information
-- This extends the auth.users table with additional user data
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create links table
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  href_path_format TEXT NOT NULL,
  on_xpath TEXT NOT NULL,
  on_selected_text_regex TEXT,
  position TEXT NOT NULL CHECK (position IN ('on_text', 'next_to_text', 'user_default')),
  display_name TEXT,
  icon TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('local', 'private', 'public')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create conditions table
CREATE TABLE conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES links (id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('url_start', 'url_contains', 'xpath_exists', 'value_match')),
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  default_link_position TEXT NOT NULL DEFAULT 'next_to_text' CHECK (default_link_position IN ('on_text', 'next_to_text')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_links_user_id ON links (user_id);
CREATE INDEX idx_links_visibility ON links (visibility);
CREATE INDEX idx_conditions_link_id ON conditions (link_id);
CREATE INDEX idx_user_settings_user_id ON user_settings (user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for links table
CREATE POLICY "Users can view their own private links" ON links
  FOR SELECT USING (
    auth.uid() = user_id AND visibility = 'private'
    OR visibility = 'public'
  );

CREATE POLICY "Users can insert their own links" ON links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own links" ON links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own links" ON links
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for conditions table
CREATE POLICY "Users can view conditions for their links" ON conditions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = conditions.link_id
      AND (
        links.user_id = auth.uid()
        OR links.visibility = 'public'
      )
    )
  );

CREATE POLICY "Users can insert conditions for their links" ON conditions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = link_id
      AND links.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update conditions for their links" ON conditions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = link_id
      AND links.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete conditions for their links" ON conditions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = link_id
      AND links.user_id = auth.uid()
    )
  );

-- RLS Policies for user_settings table
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);
