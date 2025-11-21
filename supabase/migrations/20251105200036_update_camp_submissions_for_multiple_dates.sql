/*
  # Update Camp Submissions for Multiple Dates

  1. Changes
    - Remove single date/price fields from camp_submissions
    - Create new table for multiple camp dates and prices
    - Each camp submission can have multiple date ranges with different prices
  
  2. New Table
    - `camp_submission_dates` - Stores multiple date ranges for camp submissions
*/

CREATE TABLE IF NOT EXISTS camp_submission_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES camp_submissions(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  duration_days integer NOT NULL,
  price decimal(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE camp_submission_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert dates with submission"
  ON camp_submission_dates FOR INSERT
  TO anon, authenticated
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

CREATE INDEX IF NOT EXISTS idx_camp_submission_dates_submission_id ON camp_submission_dates(submission_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camp_submissions' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE camp_submissions DROP COLUMN start_date;
    ALTER TABLE camp_submissions DROP COLUMN end_date;
    ALTER TABLE camp_submissions DROP COLUMN duration_days;
    ALTER TABLE camp_submissions DROP COLUMN price;
  END IF;
END $$;
