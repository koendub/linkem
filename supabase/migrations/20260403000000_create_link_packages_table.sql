-- Create link_packages table
CREATE TABLE link_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create junction table to associate links with packages
CREATE TABLE link_package_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_package_id UUID NOT NULL REFERENCES link_packages (id) ON DELETE CASCADE,
  link_id UUID NOT NULL REFERENCES links (id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(link_package_id, link_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_link_packages_user_id ON link_packages (user_id);
CREATE INDEX idx_link_package_links_link_package_id ON link_package_links (link_package_id);
CREATE INDEX idx_link_package_links_link_id ON link_package_links (link_id);

-- Enable Row Level Security
ALTER TABLE link_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_package_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for link_packages table
CREATE POLICY "Users can view their own packages" ON link_packages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own packages" ON link_packages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own packages" ON link_packages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own packages" ON link_packages
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for link_package_links table
CREATE POLICY "Users can view package links for their packages" ON link_package_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM link_packages
      WHERE link_packages.id = link_package_links.link_package_id
      AND link_packages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert package links for their packages" ON link_package_links
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM link_packages
      WHERE link_packages.id = link_package_links.link_package_id
      AND link_packages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete package links from their packages" ON link_package_links
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM link_packages
      WHERE link_packages.id = link_package_links.link_package_id
      AND link_packages.user_id = auth.uid()
    )
  );
