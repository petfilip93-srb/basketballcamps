/*
  # Add Anonymous User Access

  1. Changes
    - Add policies to allow anonymous (unauthenticated) users to view:
      - Countries table
      - Approved camps
    - This enables the "Browse as Guest" functionality
  
  2. Security
    - Only SELECT access is granted
    - Only approved camps are visible
    - Write operations still require authentication
*/

-- Allow anonymous users to read countries
CREATE POLICY "Anonymous users can read countries"
  ON countries FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to view approved camps
CREATE POLICY "Anonymous users can view approved camps"
  ON camps FOR SELECT
  TO anon
  USING (status = 'approved');
