/*
  # Fix camp submissions insert policy

  1. Changes
    - Drop and recreate the insert policy for camp_submissions
    - Ensure anonymous and authenticated users can submit camps
*/

DROP POLICY IF EXISTS "Anyone can submit camps" ON camp_submissions;

CREATE POLICY "Anyone can submit camps"
  ON camp_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
