# BasketballCamps Platform Guide

A European basketball camp booking platform connecting participants with quality camp experiences and enabling camp owners to manage their listings.

## Platform Overview

### User Types

1. **Regular Users (Participants)**
   - Browse basketball camps across European countries
   - Book spots at camps
   - Leave reviews and ratings after attending camps

2. **Camp Owners**
   - Manage their camp listings
   - Receive and manage booking requests
   - View participant reviews and respond to them
   - Track camp performance through dashboard

3. **Admins**
   - Approve or reject new camp registrations
   - Ensure all camps meet platform standards

## Features

### For Participants

#### Browse & Filter
- View all approved basketball camps
- Filter camps by country
- See detailed camp information:
  - Location, dates, duration, price
  - Age groups and skill levels
  - Coach information
  - Camp description and amenities

#### Book a Camp
- Click "Book a Spot" on any camp
- Enter participant details (name, age, email, phone)
- Write a booking message
- Submit booking request
- Email opens automatically with:
  - Camp owner email
  - Your email (CC'd)
  - Pre-filled camp details and participant info
- Camps handle payment collection directly

#### Leave Reviews
- Access "My Reviews" section after logging in
- Only available after camp ends
- Rate camps using basketball-shaped rating system (1-5 stars)
- Write detailed text reviews
- Verify review via email before it publishes
- View your review history and status

### For Camp Owners

#### Dashboard
- View all your camps and their approval status
- Track booking requests for your camps
- See all reviews from camp participants
- View participant contact information from booking requests

#### Camp Management
- Create new camps (submitted for admin approval)
- Edit camp details:
  - Name, location, dates, duration
  - Price, age groups, skill levels
  - Detailed description
  - Coach information
  - Images and amenities

#### Review Management
- View all published reviews for your camps
- See review ratings and text
- Respond to reviews with camp owner replies
- Build camp reputation through positive engagement

#### Booking Management
- Receive booking requests with participant details
- Communicate directly via email
- Handle payment collection through your preferred methods
- Manage participant information

### For Admins

#### Camp Approval System
- Review pending camp registrations
- Approve camps that meet platform standards
- Reject camps with detailed rejection reasons
- Monitor camp quality across the platform

## How It Works

### Booking Flow

1. **User finds camp** → Clicks "Book a Spot"
2. **Booking modal opens** → User enters participant details
3. **Email interface opens** → Pre-filled with camp info and participant details
4. **Email sent to camp + admin (CC)** → Camp receives booking request
5. **Camp processes booking** → Collects payment through their preferred method
6. **Participant attends camp** → Gains ability to leave review

### Review Verification Flow

1. **User submits review** → Reviews basketball-shaped rating and text
2. **Verification email sent** → To participant email address
3. **User clicks verification link** → Review is published on platform
4. **Review appears publicly** → Other users can see it
5. **Camp owner can respond** → Builds engagement and reputation

## Technical Architecture

### Database Tables

- **users_profile** - User account information and roles
- **countries** - List of European countries for filtering
- **camps** - Basketball camp listings with full details
- **camp_amenities** - Flexible amenity tracking for each camp
- **booking_requests** - Booking inquiries and participant details
- **reviews** - Participant reviews with verification status
- **review_replies** - Camp owner responses to reviews

### Security Features

- Row Level Security (RLS) on all tables
- Users can only access their own data
- Camp owners manage only their camps
- Admin-only approval workflows
- Email verification for review publishing
- Secure authentication with Supabase

## User Registration

### For Participants
- Sign up with email and password
- Provide full name and country
- Account type: "regular"

### For Camp Owners
- Contact platform admin to arrange cooperation
- Receive registration instructions
- Sign cooperation agreement
- Admin creates camp owner account
- Can then create and manage camp listings

### For New Camp Registrations
- Existing camp owners: Use dashboard to add new camps
- New camps: Contact admin for registration instructions
- Submit camp details for approval
- Admin reviews and approves camps

## Review Status Timeline

- **Pending Email Verification** - Review submitted, awaiting email confirmation
- **Published** - Review verified and visible to all users
- **Rejected** - Review did not meet platform guidelines

## Best Practices

### For Camp Owners
- Keep camp information updated and accurate
- Respond to reviews professionally and promptly
- Monitor booking requests regularly
- Provide high-quality camp experiences to earn positive reviews

### For Participants
- Provide accurate booking information
- Write honest and detailed reviews
- Specify your skill level when booking for accurate camp matching
- Contact camps directly with questions before booking

### For Platform Admin
- Review pending camps within 48 hours
- Provide clear feedback for rejections
- Monitor review content for inappropriate material
- Ensure platform maintains quality standards
