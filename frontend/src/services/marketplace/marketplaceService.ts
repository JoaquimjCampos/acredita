/**
 * MarketplaceService
 * Gerencia todas as operações relacionadas com Marketplace
 */

import { apiClient } from '../api/client';
import {
  ServiceCategoryDTO,
  ServiceListingDTO,
  ServiceOrderDTO,
  MarketplaceReviewDTO,
  ServiceProviderDTO,
  PaginatedResponse,
  CreateServiceListingRequest,
  CreateServiceOrderRequest,
  CreateReviewRequest,
  FilterOptions,
} from '../../types/api';

export class MarketplaceService {
  private static readonly BASE_URL = '/marketplace';

  /**
   * Get all service categories
   */
  static async getCategories(): Promise<ServiceCategoryDTO[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<ServiceCategoryDTO>>(
        `${this.BASE_URL}/categories/`
      );
      return response.results;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get service listings with filters
   */
  static async getListings(filters?: FilterOptions): Promise<PaginatedResponse<ServiceListingDTO>> {
    try {
      const params = {
        search: filters?.search,
        category: filters?.category_id,
        price_min: filters?.price_min,
        price_max: filters?.price_max,
        location: filters?.location,
        status: filters?.status || 'active',
        ordering: filters?.ordering,
        page: filters?.page || 1,
        page_size: filters?.page_size || 20,
      };

      // Remove undefined params
        Object.keys(params).forEach((key) => {
          if (params[key as keyof typeof params] === undefined) {
            delete params[key as keyof typeof params];
          }
        });

      return await apiClient.get<PaginatedResponse<ServiceListingDTO>>(
        `${this.BASE_URL}/listings/`,
        { params }
      );
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw error;
    }
  }

  /**
   * Get single listing details
   */
  static async getListing(listingId: number): Promise<ServiceListingDTO> {
    try {
      return await apiClient.get<ServiceListingDTO>(
        `${this.BASE_URL}/listings/${listingId}/`
      );
    } catch (error) {
      console.error(`Error fetching listing ${listingId}:`, error);
      throw error;
    }
  }

  /**
   * Create new service listing
   */
  static async createListing(
    data: CreateServiceListingRequest
  ): Promise<ServiceListingDTO> {
    try {
      const formData = new FormData();
      formData.append('category_id', data.category_id.toString());
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('price_type', data.price_type);
      formData.append('location', data.location);

      if (data.images) {
        data.images.forEach((image, index) => {
          formData.append(`images`, image);
        });
      }

      return await apiClient.post<ServiceListingDTO>(
        `${this.BASE_URL}/listings/`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  }

  /**
   * Update listing
   */
  static async updateListing(
    listingId: number,
    data: Partial<CreateServiceListingRequest>
  ): Promise<ServiceListingDTO> {
    try {
      return await apiClient.put<ServiceListingDTO>(
        `${this.BASE_URL}/listings/${listingId}/`,
        data
      );
    } catch (error) {
      console.error(`Error updating listing ${listingId}:`, error);
      throw error;
    }
  }

  /**
   * Delete listing
   */
  static async deleteListing(listingId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_URL}/listings/${listingId}/`);
    } catch (error) {
      console.error(`Error deleting listing ${listingId}:`, error);
      throw error;
    }
  }

  /**
   * Mark listing as featured (admin only)
   */
  static async markFeatured(listingId: number): Promise<ServiceListingDTO> {
    try {
      return await apiClient.post<ServiceListingDTO>(
        `${this.BASE_URL}/listings/${listingId}/mark_featured/`
      );
    } catch (error) {
      console.error(`Error marking listing ${listingId} as featured:`, error);
      throw error;
    }
  }

  /**
   * Get provider's listings
   */
  static async getMyListings(): Promise<ServiceListingDTO[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<ServiceListingDTO>>(
        `${this.BASE_URL}/listings/my_listings/`
      );
      return response.results;
    } catch (error) {
      console.error('Error fetching my listings:', error);
      throw error;
    }
  }

  /**
   * Create service order
   */
  static async createOrder(
    data: CreateServiceOrderRequest
  ): Promise<ServiceOrderDTO> {
    try {
      return await apiClient.post<ServiceOrderDTO>(
        `${this.BASE_URL}/orders/`,
        data
      );
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get user's orders
   */
  static async getMyOrders(): Promise<ServiceOrderDTO[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<ServiceOrderDTO>>(
        `${this.BASE_URL}/orders/my_orders/`
      );
      return response.results;
    } catch (error) {
      console.error('Error fetching my orders:', error);
      throw error;
    }
  }

  /**
   * Get single order details
   */
  static async getOrder(orderId: number): Promise<ServiceOrderDTO> {
    try {
      return await apiClient.get<ServiceOrderDTO>(
        `${this.BASE_URL}/orders/${orderId}/`
      );
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    orderId: number,
    status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  ): Promise<ServiceOrderDTO> {
    try {
      return await apiClient.patch<ServiceOrderDTO>(
        `${this.BASE_URL}/orders/${orderId}/`,
        { status }
      );
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Create review for completed order
   */
  static async createReview(
    data: CreateReviewRequest
  ): Promise<MarketplaceReviewDTO> {
    try {
      return await apiClient.post<MarketplaceReviewDTO>(
        `${this.BASE_URL}/reviews/`,
        data
      );
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  /**
   * Get reviews for listing
   */
  static async getListingReviews(listingId: number): Promise<MarketplaceReviewDTO[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<MarketplaceReviewDTO>>(
        `${this.BASE_URL}/listings/${listingId}/reviews/`
      );
      return response.results;
    } catch (error) {
      console.error(`Error fetching reviews for listing ${listingId}:`, error);
      throw error;
    }
  }

  /**
   * Get provider profile
   */
  static async getProvider(providerId: number): Promise<ServiceProviderDTO> {
    try {
      return await apiClient.get<ServiceProviderDTO>(
        `${this.BASE_URL}/providers/${providerId}/`
      );
    } catch (error) {
      console.error(`Error fetching provider ${providerId}:`, error);
      throw error;
    }
  }

  /**
   * Get marketplace stats
   */
  static async getStats(): Promise<{
    total_listings: number;
    total_orders: number;
    average_rating: number;
    total_providers: number;
  }> {
    try {
      return await apiClient.get(`${this.BASE_URL}/stats/`);
    } catch (error) {
      console.error('Error fetching marketplace stats:', error);
      throw error;
    }
  }
}

export default MarketplaceService;
