/*
  # Add camp_email field to camp_submissions

  1. Changes
    - Add camp_email field to camp_submissions table
    - This email will receive booking requests from participants
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camp_submissions' AND column_name = 'camp_email'
  ) THEN
    ALTER TABLE camp_submissions ADD COLUMN camp_email text NOT NULL DEFAULT '';
  END IF;
END $$;
