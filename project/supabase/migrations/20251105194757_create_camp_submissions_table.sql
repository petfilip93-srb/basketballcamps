/*
  # Create Camp Submissions Table

  1. New Table
    - `camp_submissions` - Stores public camp submissions from camp owners
      - All camp information fields
      - Contact information for camp owner
      - Status tracking (pending, approved, rejected)
  
  2. Security
    - Enable RLS
    - Allow anonymous users to insert submissions
    - Only admins can view/update submissions
*/

CREATE TABLE IF NOT EXISTS camp_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name text NOT NULL,
  owner_email text NOT NULL,
  owner_phone text NOT NULL,
  camp_name text NOT NULL,
  country_id uuid NOT NULL REFERENCES countries(id) ON DELETE RESTRICT,
  location text NOT NULL,
  description text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  duration_days integer NOT NULL,
  price decimal(10, 2) NOT NULL,
  age_group_min integer NOT NULL,
  age_group_max integer NOT NULL,
  gender text NOT NULL DEFAULT 'both' CHECK (gender IN ('boys', 'girls', 'both')),
  coaches_info text,
  capacity integer DEFAULT 30,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE camp_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit camps"
  ON camp_submissions FOR INSERT
  TO anon, authenticated
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

CREATE INDEX IF NOT EXISTS idx_camp_submissions_status ON camp_submissions(status);
CREATE INDEX IF NOT EXISTS idx_camp_submissions_country_id ON camp_submissions(country_id);
