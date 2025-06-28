-- User Profiles and Admin Approval System
-- This file contains the database schema for user management and approval workflow

-- Create user roles enum
CREATE TYPE user_role_enum AS ENUM (
  'researcher',
  'regulator', 
  'consultant',
  'public',
  'admin'
);

-- Create user status enum
CREATE TYPE user_status_enum AS ENUM (
  'pending_approval',
  'approved',
  'rejected',
  'suspended'
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  organization TEXT NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'public',
  status user_status_enum NOT NULL DEFAULT 'pending_approval',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND 
    -- Only allow updating certain fields
    (SELECT COUNT(*) FROM jsonb_object_keys(to_jsonb(NEW) - to_jsonb(OLD)) AS changed_fields) = 0
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert new profiles (signup handled by trigger)
CREATE POLICY "Only admins can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Create function to get user profile
CREATE OR REPLACE FUNCTION get_user_profile(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  email TEXT,
  full_name TEXT,
  organization TEXT,
  role user_role_enum,
  status user_status_enum,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.user_id,
    up.email,
    up.full_name,
    up.organization,
    up.role,
    up.status,
    up.approved_by,
    up.approved_at,
    up.rejection_reason,
    up.created_at,
    up.updated_at
  FROM user_profiles up
  WHERE up.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to approve user
CREATE OR REPLACE FUNCTION approve_user(
  p_user_id UUID,
  p_approved_by UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    status = 'approved',
    approved_by = p_approved_by,
    approved_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reject user
CREATE OR REPLACE FUNCTION reject_user(
  p_user_id UUID,
  p_rejected_by UUID,
  p_rejection_reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    status = 'rejected',
    approved_by = p_rejected_by,
    approved_at = NOW(),
    rejection_reason = p_rejection_reason
  WHERE user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get pending approvals
CREATE OR REPLACE FUNCTION get_pending_approvals(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  email TEXT,
  full_name TEXT,
  organization TEXT,
  role user_role_enum,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.user_id,
    up.email,
    up.full_name,
    up.organization,
    up.role,
    up.created_at
  FROM user_profiles up
  WHERE up.status = 'pending_approval'
  ORDER BY up.created_at ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all users (admin only)
CREATE OR REPLACE FUNCTION get_all_users(
  p_status user_status_enum DEFAULT NULL,
  p_role user_role_enum DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  email TEXT,
  full_name TEXT,
  organization TEXT,
  role user_role_enum,
  status user_status_enum,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.user_id,
    up.email,
    up.full_name,
    up.organization,
    up.role,
    up.status,
    up.approved_by,
    up.approved_at,
    up.created_at
  FROM user_profiles up
  WHERE (p_status IS NULL OR up.status = p_status)
    AND (p_role IS NULL OR up.role = p_role)
  ORDER BY up.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Insert default admin user (you'll need to create this user in Supabase Auth first)
-- Replace 'your-admin-user-id' with the actual UUID of your admin user
-- INSERT INTO user_profiles (user_id, email, full_name, organization, role, status, approved_by, approved_at)
-- VALUES ('your-admin-user-id', 'admin@example.com', 'System Administrator', 'Georgia EPD', 'admin', 'approved', 'your-admin-user-id', NOW()); 