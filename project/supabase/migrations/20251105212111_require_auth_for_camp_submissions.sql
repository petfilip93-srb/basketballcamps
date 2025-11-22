/*
  # Require Authentication for Camp Submissions

  1. Changes
    - Update INSERT policies to require authenticated users
    - Camp owners must be logged in to submit camps
*/

-- Update camp_submissions policy
DROP POLICY IF EXISTS "Anyone can submit camps" ON camp_submissions;

CREATE POLICY "Authenticated users can submit camps"
  ON camp_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Update camp_submission_dates policy
DROP POLICY IF EXISTS "Anyone can insert dates with submission" ON camp_submission_dates;

CREATE POLICY "Authenticated users can insert dates with submission"
  ON camp_submission_dates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM camp_submissions
      WHERE camp_submissions.id = submission_id
      AND camp_submissions.owner_id = auth.uid()
    )
  );

-- Update camp_submission_images policy
DROP POLICY IF EXISTS "Anyone can insert images with submission" ON camp_submission_images;

CREATE POLICY "Authenticated users can insert images with submission"
  ON camp_submission_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM camp_submissions
      WHERE camp_submissions.id = submission_id
      AND camp_submissions.owner_id = auth.uid()
    )
  );
