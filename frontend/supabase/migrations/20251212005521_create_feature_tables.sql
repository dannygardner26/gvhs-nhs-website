-- Create volunteer_organizations table
CREATE TABLE IF NOT EXISTS volunteer_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon_name VARCHAR(50) DEFAULT 'Users',
  color VARCHAR(20) DEFAULT '#3B82F6',
  contact_email VARCHAR(255),
  website VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add organization_id to volunteer_events if it exists, otherwise create the table
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'volunteer_events') THEN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'volunteer_events' AND column_name = 'organization_id') THEN
      ALTER TABLE volunteer_events ADD COLUMN organization_id UUID REFERENCES volunteer_organizations(id);
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'volunteer_events' AND column_name = 'event_date') THEN
      ALTER TABLE volunteer_events ADD COLUMN event_date DATE;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'volunteer_events' AND column_name = 'start_time') THEN
      ALTER TABLE volunteer_events ADD COLUMN start_time TIME;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'volunteer_events' AND column_name = 'end_time') THEN
      ALTER TABLE volunteer_events ADD COLUMN end_time TIME;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'volunteer_events' AND column_name = 'spots_available') THEN
      ALTER TABLE volunteer_events ADD COLUMN spots_available INTEGER;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'volunteer_events' AND column_name = 'spots_filled') THEN
      ALTER TABLE volunteer_events ADD COLUMN spots_filled INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'volunteer_events' AND column_name = 'is_active') THEN
      ALTER TABLE volunteer_events ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
  ELSE
    -- Create table if it doesn't exist
    CREATE TABLE volunteer_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID REFERENCES volunteer_organizations(id),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      location VARCHAR(255),
      event_date DATE,
      start_time TIME,
      end_time TIME,
      spots_available INTEGER,
      spots_filled INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- Create event_signups table
CREATE TABLE IF NOT EXISTS event_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES volunteer_events(id) ON DELETE CASCADE,
  user_id VARCHAR(6) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  is_pinned BOOLEAN DEFAULT false,
  created_by VARCHAR(50) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create monthly_service_submissions table
CREATE TABLE IF NOT EXISTS monthly_service_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(6) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  month VARCHAR(7) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'submitted',
  admin_notes TEXT,
  reviewed_by VARCHAR(50),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Create independent_projects table
CREATE TABLE IF NOT EXISTS independent_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(6) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  project_title VARCHAR(255) NOT NULL,
  project_description TEXT NOT NULL,
  start_date DATE NOT NULL,
  expected_end_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create isp_checkins table
CREATE TABLE IF NOT EXISTS isp_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES independent_projects(id) ON DELETE CASCADE,
  quarter VARCHAR(7) NOT NULL,
  progress_update TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'submitted',
  admin_notes TEXT,
  reviewed_by VARCHAR(50),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, quarter)
);

-- Seed initial organizations
INSERT INTO volunteer_organizations (name, slug, description, icon_name, color, sort_order) VALUES
  ('NHS Elementary Visits', 'nhs-elementary', 'Visit local elementary schools to read to students and help with activities', 'Users', '#3B82F6', 1),
  ('Kids in Motion', 'kids-in-motion', 'Support youth sports programs and promote physical activity', 'Heart', '#10B981', 2),
  ('Interact Club', 'interact-club', 'General community service drives and volunteering initiatives', 'Globe', '#F59E0B', 3),
  ('GVCO Tech Seniors', 'gvco-tech-seniors', 'Help senior citizens learn and navigate technology', 'Monitor', '#8B5CF6', 4),
  ('Social Media Team', 'social-media', 'Create engaging content to showcase NHS activities', 'Camera', '#EC4899', 5),
  ('Peer Tutoring', 'peer-tutoring', 'Help fellow students succeed academically', 'BookOpen', '#EF4444', 6)
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE volunteer_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_service_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE independent_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE isp_checkins ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read on volunteer_organizations" ON volunteer_organizations FOR SELECT USING (true);
CREATE POLICY "Allow public read on announcements" ON announcements FOR SELECT USING (is_active = true);

-- Create policies for service role operations (all operations allowed)
CREATE POLICY "Service role full access on volunteer_organizations" ON volunteer_organizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on event_signups" ON event_signups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on announcements" ON announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on monthly_service" ON monthly_service_submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on independent_projects" ON independent_projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on isp_checkins" ON isp_checkins FOR ALL USING (true) WITH CHECK (true);
