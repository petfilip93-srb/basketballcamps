/*
  # Add Gender Field to Camps

  1. Changes
    - Add `gender` column to camps table
    - Options: 'boys', 'girls', 'both'
    - Default to 'both' for existing camps
  
  2. Notes
    - Replaces the skill_levels field conceptually
    - Helps users filter camps by participant gender
*/

-- Add gender column to camps table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'gender'
  ) THEN
    ALTER TABLE camps ADD COLUMN gender text DEFAULT 'both' CHECK (gender IN ('boys', 'girls', 'both'));
  END IF;
END $$;
