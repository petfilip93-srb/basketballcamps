/*
  # Basketball Camp Booking Platform - Initial Schema

  ## Overview
  Complete database schema for a basketball camp booking platform with user authentication,
  camp listings by country, booking requests, and a review system with email verification.

  ## New Tables

  1. **users_profile** - Extended user profile information
     - Stores user type (regular, camp_owner, admin)
     - Full name, phone, country
     
  2. **countries** - List of European countries
     - Name, country code for grouping camps
     
  3. **camps** - Basketball camp listings
     - Camp details: name, location, dates, price, etc.
     - Status tracking (draft, pending_approval, approved, rejected)
     - Owner relationship and approval tracking
     
  4. **camp_amenities** - Flexible amenity tracking
     - Links camps to amenities they offer
     
  5. **booking_requests** - Booking inquiries
     - Tracks booking requests from users
     - Links to camp and user
     
  6. **reviews** - Participant reviews
     - Ratings (1-5), text reviews
     - Email verification system
     - Status tracking (pending_email_verification, published, rejected)
     - Allows camp owners to reply
     
  7. **review_replies** - Camp owner responses to reviews
     - Stores camp owner replies to reviews
     
  ## Security
  - RLS enabled on all tables
  - Users can only view approved camps
  - Users can only update their own profiles
  - Camp owners manage only their own camps
  - Reviews only from verified attendees
*/

-- Create users_profile table
CREATE TABLE IF NOT EXISTS users_profile (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL DEFAULT 'regular' CHECK (user_type IN ('regular', 'camp_owner', 'admin')),
  full_name text NOT NULL,
  phone text,
  country text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  country_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create camps table
CREATE TABLE IF NOT EXISTS camps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  country_id uuid NOT NULL REFERENCES countries(id) ON DELETE RESTRICT,
  name text NOT NULL,
  location text NOT NULL,
  description text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  duration_days integer NOT NULL,
  price decimal(10, 2) NOT NULL,
  age_group_min integer NOT NULL,
  age_group_max integer NOT NULL,
  skill_levels text[] DEFAULT '{}',
  coaches_info text,
  image_url text,
  status text NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected')),
  approved_by uuid REFERENCES users_profile(id) ON DELETE SET NULL,
  approved_at timestamptz,
  rejection_reason text,
  capacity integer DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create camp_amenities table
CREATE TABLE IF NOT EXISTS camp_amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id uuid NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  amenity text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create booking_requests table
CREATE TABLE IF NOT EXISTS booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id uuid NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  participant_name text NOT NULL,
  participant_age integer NOT NULL,
  participant_email text NOT NULL,
  participant_phone text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id uuid NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  participant_name text NOT NULL,
  participant_email text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  verification_token text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending_email_verification' CHECK (status IN ('pending_email_verification', 'published', 'rejected')),
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create review_replies table
CREATE TABLE IF NOT EXISTS review_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  camp_owner_id uuid NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  reply_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users_profile
CREATE POLICY "Users can read own profile"
  ON users_profile FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users_profile FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow insert for new users"
  ON users_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for countries
CREATE POLICY "Everyone can read countries"
  ON countries FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for camps
CREATE POLICY "Users can view approved camps"
  ON camps FOR SELECT
  TO authenticated
  USING (status = 'approved');

CREATE POLICY "Camp owners can view their own camps at any status"
  ON camps FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can view all camps"
  ON camps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.user_type = 'admin'
    )
  );

CREATE POLICY "Camp owners can insert camps"
  ON camps FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND user_type = 'camp_owner'
    )
  );

CREATE POLICY "Camp owners can update their own camps"
  ON camps FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Admins can update camp status"
  ON camps FOR UPDATE
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

-- RLS Policies for camp_amenities
CREATE POLICY "Everyone can view amenities for approved camps"
  ON camp_amenities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM camps
      WHERE camps.id = camp_amenities.camp_id
      AND camps.status = 'approved'
    )
  );

CREATE POLICY "Camp owners can view amenities for their camps"
  ON camp_amenities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM camps
      WHERE camps.id = camp_amenities.camp_id
      AND camps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Camp owners can manage amenities for their camps"
  ON camp_amenities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM camps
      WHERE camps.id = camp_amenities.camp_id
      AND camps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Camp owners can delete amenities"
  ON camp_amenities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM camps
      WHERE camps.id = camp_amenities.camp_id
      AND camps.owner_id = auth.uid()
    )
  );

-- RLS Policies for booking_requests
CREATE POLICY "Users can view their own booking requests"
  ON booking_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Camp owners can view booking requests for their camps"
  ON booking_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM camps
      WHERE camps.id = booking_requests.camp_id
      AND camps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create booking requests"
  ON booking_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for reviews
CREATE POLICY "Everyone can view published reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (status = 'published');

CREATE POLICY "Users can view their own reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Camp owners can view all reviews for their camps"
  ON reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM camps
      WHERE camps.id = reviews.camp_id
      AND camps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for review_replies
CREATE POLICY "Everyone can view replies for published reviews"
  ON review_replies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews
      WHERE reviews.id = review_replies.review_id
      AND reviews.status = 'published'
    )
  );

CREATE POLICY "Camp owners can view replies for their reviews"
  ON review_replies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews
      JOIN camps ON camps.id = reviews.camp_id
      WHERE reviews.id = review_replies.review_id
      AND camps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Camp owners can create replies"
  ON review_replies FOR INSERT
  TO authenticated
  WITH CHECK (
    camp_owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM reviews
      JOIN camps ON camps.id = reviews.camp_id
      WHERE reviews.id = review_replies.review_id
      AND camps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Camp owners can update their replies"
  ON review_replies FOR UPDATE
  TO authenticated
  USING (camp_owner_id = auth.uid())
  WITH CHECK (camp_owner_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_camps_country_id ON camps(country_id);
CREATE INDEX IF NOT EXISTS idx_camps_owner_id ON camps(owner_id);
CREATE INDEX IF NOT EXISTS idx_camps_status ON camps(status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_camp_id ON booking_requests(camp_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_user_id ON booking_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_camp_id ON reviews(camp_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_review_replies_review_id ON review_replies(review_id);
