/*
  # Add Commission Field to User Profiles

  1. Changes
    - Add `commission_per_participant` column to users_profile table
    - This field stores the commission amount camp owners agree to pay per participant
    - Minimum value enforced at 10 (representing currency units like EUR)
    - Only relevant for camp_owner user type
  
  2. Notes
    - Default value is NULL for regular users
    - Camp owners should specify this during registration
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profile' AND column_name = 'commission_per_participant'
  ) THEN
    ALTER TABLE users_profile ADD COLUMN commission_per_participant numeric CHECK (commission_per_participant IS NULL OR commission_per_participant >= 10);
  END IF;
END $$;