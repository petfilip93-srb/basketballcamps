/*
  # Add Camp Submission Images Support

  1. New Table
    - `camp_submission_images` - Stores image URLs for camp submissions
      - Links to camp_submissions table
      - Stores order (first image is profile picture)
      - Stores image URL
  
  2. Security
    - Enable RLS
    - Allow anonymous users to insert images with submission
    - Admins can view/manage all images
*/

CREATE TABLE IF NOT EXISTS camp_submission_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES camp_submissions(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE camp_submission_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert images with submission"
  ON camp_submission_images FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all submission images"
  ON camp_submission_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can delete submission images"
  ON camp_submission_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND user_type = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_camp_submission_images_submission_id ON camp_submission_images(submission_id);
CREATE INDEX IF NOT EXISTS idx_camp_submission_images_order ON camp_submission_images(submission_id, image_order);
