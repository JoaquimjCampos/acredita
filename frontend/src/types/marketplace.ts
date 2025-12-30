/**
 * Centralized Marketplace TypeScript Types
 * Single source of truth for marketplace entities
 */

export interface ProfessionalCategory {
  id: number;
  name: string;
  inefob_code: string;
}

export interface ServiceProvider {
  id: number;
  business_name: string;
  business_type: string;
  provider_type: 'service_provider' | 'merchant';
  description: string;
  province: string;
  municipality: string;
  neighborhood?: string;
  address?: string;
  rating: number;
  total_reviews: number;
  verified: boolean;
  professional_category?: ProfessionalCategory;
}

export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ServiceListing {
  id: number;
  title: string;
  description: string;
  base_price: number;
  listing_type: 'service' | 'product';
  price_type: 'fixed' | 'hourly' | 'negotiable';
  currency: string;
  available: boolean;
  delivery_time?: string;
  quantity_available?: number;
  sku?: string;
  tags: string[];
  images: string[];
  video_url?: string;
  views: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
  category: ServiceCategory;
  provider: ServiceProvider;
}

export interface ServiceOrder {
  id: number;
  listing: ServiceListing;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  total_amount: number;
  payment_status: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  accepted_at?: string;
  completed_at?: string;
}

export interface MarketplaceReview {
  id: number;
  order: number;
  rating: number;
  comment: string;
  response?: string;
  helpful_count: number;
  created_at: string;
}
