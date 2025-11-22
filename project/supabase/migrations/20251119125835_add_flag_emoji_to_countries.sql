/*
  # Add flag_emoji column to countries table

  1. Changes
    - Add `flag_emoji` column to countries table
    - This stores the emoji flag for each country
  
  2. Notes
    - Required for displaying country flags in the UI
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'countries' AND column_name = 'flag_emoji'
  ) THEN
    ALTER TABLE countries ADD COLUMN flag_emoji text NOT NULL DEFAULT '🏀';
  END IF;
END $$;