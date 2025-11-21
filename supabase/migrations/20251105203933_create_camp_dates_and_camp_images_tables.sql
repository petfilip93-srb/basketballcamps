/*
  # Create Camp Dates and Camp Images Tables

  1. New Tables
    - `camp_dates` - Store multiple date ranges for each camp
      - Links to camps table
      - Stores start date, end date, duration, and price per session
    - `camp_images` - Store multiple images for each camp
      - Links to camps table
      - Stores image URL and display order
  
  2. Security
    - Enable RLS on both tables
    - Allow anonymous users to view images and dates
    - Allow camp owners to manage their camp's dates and images
    - Allow admins to manage all dates and images

  3. Notes
    - First image (order 0) is the profile picture
    - Multiple dates allow camps to have different pricing for different sessions
*/

-- Create camp_dates table
CREATE TABLE IF NOT EXISTS camp_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id uuid NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  duration_days integer NOT NULL,
  price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_camp_dates_camp_id ON camp_dates(camp_id);
CREATE INDEX IF NOT EXISTS idx_camp_dates_start_date ON camp_dates(start_date);

-- Create camp_images table
CREATE TABLE IF NOT EXISTS camp_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id uuid NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_camp_images_camp_id ON camp_images(camp_id);
CREATE INDEX IF NOT EXISTS idx_camp_images_order ON camp_images(camp_id, image_order);

-- Enable RLS
ALTER TABLE camp_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for camp_dates
CREATE POLICY "Anyone can view camp dates"
  ON camp_dates FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Camp owners can insert their camp dates"
  ON camp_dates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM camps
      WHERE camps.id = camp_dates.camp_id
      AND camps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Camp owners can update their camp dates"
  ON camp_dates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM camps
      WHERE camps.id = camp_dates.camp_id
      AND camps.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM camps
      WHERE camps.id = camp_dates.camp_id
      AND camps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Camp owners can delete their camp dates"
  ON camp_dates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM camps
      WHERE camps.id = camp_dates.camp_id
      AND camps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all camp dates"
  ON camp_dates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND user_type = 'admin'
    )
  );

-- RLS Policies for camp_images
CREATE POLICY "Anyone can view camp images"
  ON camp_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Camp owners can insert their camp images"
  ON camp_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM camps
      WHERE camps.id = camp_images.camp_id
      AND camps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Camp owners can update their camp images"
  ON camp_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM camps
      WHERE camps.id = camp_images.camp_id
      AND camps.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM camps
      WHERE camps.id = camp_images.camp_id
      AND camps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Camp owners can delete their camp images"
  ON camp_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM camps
      WHERE camps.id = camp_images.camp_id
      AND camps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all camp images"
  ON camp_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND user_type = 'admin'
    )
  );
