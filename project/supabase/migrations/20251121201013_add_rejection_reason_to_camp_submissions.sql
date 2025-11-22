/*
  # Add rejection_reason column to camp_submissions

  1. Changes
    - Add `rejection_reason` column to `camp_submissions` table
    - Column stores the reason provided by admin when rejecting a camp submission
    - Column is optional (nullable) as it's only filled when status is 'rejected'

  2. Details
    - Type: text
    - Nullable: true (only filled when rejected)
    - No default value needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camp_submissions' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE camp_submissions ADD COLUMN rejection_reason text;
  END IF;
END $$;
