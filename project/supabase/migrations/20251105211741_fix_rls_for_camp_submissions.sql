/*
  # Fix RLS for camp submissions
  
  1. Changes
    - Disable and re-enable RLS
    - Recreate all policies with proper permissions
    - Ensure anon users can insert
*/

-- Disable RLS temporarily
ALTER TABLE camp_submissions DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE camp_submissions ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can submit camps" ON camp_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON camp_submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON camp_submissions;
DROP POLICY IF EXISTS "Camp owners can view their submissions" ON camp_submissions;
DROP POLICY IF EXISTS "Camp owners can update their submissions" ON camp_submissions;

-- Recreate policies
CREATE POLICY "Anyone can submit camps"
  ON camp_submissions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all submissions"
  ON camp_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND user_type = 'admin'
    )
  );

CREATE POLICY "Camp owners can view their submissions"
  ON camp_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can update submissions"
  ON camp_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND user_type = 'admin'
    )
  );

CREATE POLICY "Camp owners can update their submissions"
  ON camp_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Ensure related tables also have proper policies
ALTER TABLE camp_submission_dates DISABLE ROW LEVEL SECURITY;
ALTER TABLE camp_submission_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert dates with submission" ON camp_submission_dates;
DROP POLICY IF EXISTS "Admins can view all submission dates" ON camp_submission_dates;

CREATE POLICY "Anyone can insert dates with submission"
  ON camp_submission_dates FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all submission dates"
  ON camp_submission_dates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND user_type = 'admin'
    )
  );

-- Fix camp submission images policies
ALTER TABLE camp_submission_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE camp_submission_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert images with submission" ON camp_submission_images;
DROP POLICY IF EXISTS "Admins can view all submission images" ON camp_submission_images;

CREATE POLICY "Anyone can insert images with submission"
  ON camp_submission_images FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all submission images"
  ON camp_submission_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND user_type = 'admin'
    )
  );
