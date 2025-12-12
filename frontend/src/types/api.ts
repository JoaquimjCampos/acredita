/**
 * Tipos para Certifications App
 * Backend: backend/certifications/
 */

export interface ProfessionalCategoryDTO {
  id: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface TrainingProgramDTO {
  id: number;
  category: ProfessionalCategoryDTO;
  category_id?: number;
  title: string;
  description: string;
  duration_hours: number;
  price: number | null;
  status: 'active' | 'draft' | 'archived';
  instructor_name: string;
  max_participants: number;
  enrollment_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CandidateEnrollmentDTO {
  id: number;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  program: TrainingProgramDTO;
  program_id?: number;
  enrollment_date: string;
  status: 'active' | 'completed' | 'withdrawn';
  progress_percentage: number;
  estimated_completion: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkillAssessmentDTO {
  id: number;
  enrollment: CandidateEnrollmentDTO;
  enrollment_id?: number;
  skill_name: string;
  assessment_type: 'practical' | 'theory' | 'project';
  max_score: number;
  created_at: string;
  updated_at: string;
}

export interface AssessmentResultDTO {
  id: number;
  assessment: SkillAssessmentDTO;
  assessment_id?: number;
  score: number;
  feedback: string;
  passed: boolean;
  result_date: string;
  created_at: string;
  updated_at: string;
}

export interface CertificateIssuedDTO {
  id: number;
  enrollment: CandidateEnrollmentDTO;
  enrollment_id?: number;
  certificate_number: string;
  issue_date: string;
  valid_until: string | null;
  pdf_url: string;
  created_at: string;
  updated_at: string;
}

/**
 * Tipos para Marketplace App
 * Backend: backend/marketplace/
 */

export interface ServiceCategoryDTO {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfileDTO {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  profile_picture?: string;
  bio?: string;
  rating?: number;
  total_reviews?: number;
}

export interface ServiceProviderDTO {
  id: number;
  user: UserProfileDTO;
  user_id?: number;
  business_name: string;
  registration_number?: string;
  services_count?: number;
  rating: number;
  total_reviews: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceListingDTO {
  id: number;
  provider: ServiceProviderDTO;
  provider_id?: number;
  category: ServiceCategoryDTO;
  category_id?: number;
  title: string;
  description: string;
  price: number;
  price_type: 'fixed' | 'hourly' | 'negotiable';
  location: string;
  is_featured: boolean;
  views: number;
  status: 'active' | 'inactive' | 'archived';
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface ServiceOrderDTO {
  id: number;
  buyer: UserProfileDTO;
  buyer_id?: number;
  listing: ServiceListingDTO;
  listing_id?: number;
  order_date: string;
  delivery_date: string | null;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  total_amount: number;
  payment_method: 'card' | 'transfer' | 'cash';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceReviewDTO {
  id: number;
  order: ServiceOrderDTO;
  order_id?: number;
  reviewer: UserProfileDTO;
  reviewer_id?: number;
  rating: number; // 1-5
  comment: string;
  verified_purchase: boolean;
  helpful_count?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Tipos para Kixikila App
 * Backend: backend/kixikila/
 */

export interface KixikilaGroupDTO {
  id: number;
  name: string;
  description: string;
  admin: UserProfileDTO;
  admin_id?: number;
  monthly_contribution: number;
  member_count: number;
  members_limit?: number;
  current_round?: number;
  status: 'active' | 'completed' | 'suspended' | 'forming';
  group_type: 'professional' | 'neighborhood' | 'family' | 'business';
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface KixikilaMembershipDTO {
  id: number;
  group: KixikilaGroupDTO;
  group_id?: number;
  member: UserProfileDTO;
  member_id?: number;
  join_date: string;
  status: 'active' | 'inactive' | 'removed';
  contribution_count: number;
  payout_received?: boolean;
  created_at: string;
  updated_at: string;
}

export interface KixikilaContributionDTO {
  id: number;
  membership: KixikilaMembershipDTO;
  membership_id?: number;
  amount: number;
  contribution_date: string;
  cycle_number: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method: 'transfer' | 'cash' | 'card';
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface KixikilaPayoutDTO {
  id: number;
  group: number;
  group_name: string;
  recipient: number;
  recipient_email: string;
  round: number;
  total_amount: string;
  platform_fee: string;
  net_amount: string;
  scheduled_date: string;
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
  payment_method: 'bank_transfer' | 'cash' | 'mobile_money' | null;
  notes: string | null;
  is_eligible: boolean;
  can_be_disbursed: boolean;
  created_at: string;
  updated_at: string;
}

export interface KixikilaRatingDTO {
  id: number;
  group: KixikilaGroupDTO;
  group_id?: number;
  rater: UserProfileDTO;
  rater_id?: number;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Tipos Comuns
 */

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiErrorDetail {
  [key: string]: string | string[];
}

export interface ApiError {
  detail?: string;
  [key: string]: any;
}

/**
 * Request/Response types
 */

export interface CreateServiceListingRequest {
  category_id: number;
  title: string;
  description: string;
  price: number;
  price_type: 'fixed' | 'hourly' | 'negotiable';
  location: string;
  images?: File[];
}

export interface CreateServiceOrderRequest {
  listing_id: number;
  delivery_date?: string;
  payment_method: 'card' | 'transfer' | 'cash';
  notes?: string;
}

export interface CreateKixikilaGroupRequest {
  name: string;
  description: string;
  monthly_contribution: number;
  max_members: number;
  duration_months: number;
  start_date: string;
  group_type: 'professional' | 'neighborhood' | 'family' | 'business';
  requires_verification?: boolean;
  insurance_enabled?: boolean;
  province?: string;
  municipality?: string;
}

export interface JoinKixikilaGroupRequest {
  group_id: number;
}

export interface ContributeKixikilaRequest {
  membership_id: number;
  amount: number;
  payment_method: 'transfer' | 'cash' | 'card';
}

export interface CreateReviewRequest {
  order_id: number;
  rating: number;
  comment: string;
}

export interface CreateRatingRequest {
  group_id: number;
  rating: number;
  comment?: string;
}

export interface FilterOptions {
  search?: string;
  category_id?: number;
  price_min?: number;
  price_max?: number;
  location?: string;
  status?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}
