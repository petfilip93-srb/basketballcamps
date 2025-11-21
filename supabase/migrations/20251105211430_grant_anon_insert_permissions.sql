/*
  # Grant anon role permissions for camp submissions

  1. Changes
    - Grant INSERT permission to anon role on camp_submissions
    - Ensure the policy allows inserts
*/

-- Grant table permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON camp_submissions TO anon;
GRANT INSERT ON camp_submission_dates TO anon;
GRANT INSERT ON camp_submission_images TO anon;

-- Recreate the policy with explicit permissions
DROP POLICY IF EXISTS "Anyone can submit camps" ON camp_submissions;

CREATE POLICY "Anyone can submit camps"
  ON camp_submissions FOR INSERT
  WITH CHECK (true);
