export interface UserProfile {
  id: string;
  user_type: 'regular' | 'camp_owner' | 'admin';
  full_name: string;
  phone: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: string;
  name: string;
  country_code: string;
  created_at: string;
}

export interface Camp {
  id: string;
  owner_id: string;
  country_id: string;
  name?: string;
  camp_name?: string;
  location: string;
  description: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  price: number | string;
  age_group_min: number;
  age_group_max: number;
  skill_levels: string[];
  gender: 'boys' | 'girls' | 'both';
  coaches_info: string | null;
  image_url: string | null;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  capacity: number;
  camp_email?: string;
  created_at: string;
  updated_at: string;
}

export interface CampWithCountry extends Camp {
  countries?: Country;
}

export interface Review {
  id: string;
  camp_id: string;
  user_id: string;
  participant_name: string;
  participant_email: string;
  rating: number;
  review_text: string;
  verification_token: string;
  status: 'pending_email_verification' | 'published' | 'rejected';
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewReply {
  id: string;
  review_id: string;
  camp_owner_id: string;
  reply_text: string;
  created_at: string;
  updated_at: string;
}

export interface BookingRequest {
  id: string;
  camp_id: string;
  user_id: string;
  participant_name: string;
  participant_age: number;
  participant_email: string;
  participant_phone: string;
  message: string;
  created_at: string;
}
