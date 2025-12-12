/**
 * KixikilaService
 * Gerencia todas as operações relacionadas com Kixikila (Rotating Savings)
 */

import { apiClient } from '../api/client';
import {
  KixikilaGroupDTO,
  KixikilaMembershipDTO,
  KixikilaContributionDTO,
  KixikilaPayoutDTO,
  KixikilaRatingDTO,
  PaginatedResponse,
  CreateKixikilaGroupRequest,
  ContributeKixikilaRequest,
  CreateRatingRequest,
} from '../../types/api';

export class KixikilaService {
  private static readonly BASE_URL = '/api/v2/kixikila';

  /**
   * Get all groups (forming, active, etc - excluding completed/suspended)
   */
  static async getGroups(filters?: {
    search?: string;
    status?: string;
    group_type?: string;
    page?: number;
  }): Promise<PaginatedResponse<KixikilaGroupDTO>> {
    try {
      const params = {
        search: filters?.search,
        status: filters?.status, // No default - show all statuses
        group_type: filters?.group_type,
        page: filters?.page || 1,
      };

      // Remove undefined params
        Object.keys(params).forEach((key) => {
          if (params[key as keyof typeof params] === undefined) {
            delete params[key as keyof typeof params];
          }
        });

      return await apiClient.get<PaginatedResponse<KixikilaGroupDTO>>(
        `${this.BASE_URL}/groups/`,
        { params }
      );
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }

  /**
   * Get single group details
   */
  static async getGroup(groupId: number): Promise<KixikilaGroupDTO> {
    try {
      return await apiClient.get<KixikilaGroupDTO>(
        `${this.BASE_URL}/groups/${groupId}/`
      );
    } catch (error) {
      console.error(`Error fetching group ${groupId}:`, error);
      throw error;
    }
  }

  // getGroupStats declared later to avoid duplication with legacy section

  /**
   * Check if user is member of a group
   */
  static async checkMembership(groupId: number): Promise<{ is_member: boolean; membership?: any }> {
    try {
      return await apiClient.get<{ is_member: boolean; membership?: any }>(
        `${this.BASE_URL}/groups/${groupId}/membership/`
      );
    } catch (error) {
      console.error(`Error checking membership for group ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Create new group
   */
  static async createGroup(
    data: CreateKixikilaGroupRequest
  ): Promise<KixikilaGroupDTO> {
    try {
      return await apiClient.post<KixikilaGroupDTO>(
        `${this.BASE_URL}/groups/`,
        data
      );
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  /**
   * Update group details
   */
  static async updateGroup(
    groupId: number,
    data: Partial<CreateKixikilaGroupRequest>
  ): Promise<KixikilaGroupDTO> {
    try {
      return await apiClient.put<KixikilaGroupDTO>(
        `${this.BASE_URL}/groups/${groupId}/`,
        data
      );
    } catch (error) {
      console.error(`Error updating group ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's groups
   */
  static async getMyGroups(): Promise<KixikilaGroupDTO[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<KixikilaGroupDTO>>(
        `${this.BASE_URL}/groups/my_groups/`
      );
      return response.results;
    } catch (error) {
      console.error('Error fetching my groups:', error);
      throw error;
    }
  }

  /**
   * Join group
   */
  static async joinGroup(groupId: number): Promise<KixikilaMembershipDTO> {
    try {
      return await apiClient.post<KixikilaMembershipDTO>(
        `${this.BASE_URL}/groups/${groupId}/join/`,
        {}
      );
    } catch (error: any) {
      // Extract error message from response
      const message = error.response?.data?.detail || 
                     error.response?.data?.error || 
                     error.message || 
                     'Erro ao entrar no grupo';
      console.error(`Error joining group ${groupId}:`, message);
      throw new Error(message);
    }
  }

  /**
   * Get group members
   */
  static async getGroupMembers(
    groupId: number,
    page?: number
  ): Promise<PaginatedResponse<KixikilaMembershipDTO>> {
    try {
      return await apiClient.get<PaginatedResponse<KixikilaMembershipDTO>>(
        `${this.BASE_URL}/groups/${groupId}/members/`,
        { params: { page } }
      );
    } catch (error) {
      console.error(`Error fetching members for group ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Get group stats
   */
  static async getGroupStats(groupId: number): Promise<{cash:number; active:number; next:number; participation_rate?:number}> {
    try {
      return await apiClient.get<{cash:number; active:number; next:number; participation_rate?:number}>(
        `${this.BASE_URL}/groups/${groupId}/stats/`
      );
    } catch (error) {
      console.error(`Error fetching stats for group ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Create contribution
   */
  static async createContribution(
    data: ContributeKixikilaRequest
  ): Promise<KixikilaContributionDTO> {
    try {
      console.log('Creating contribution with payload:', data);
      const response = await apiClient.post<KixikilaContributionDTO>(
        `${this.BASE_URL}/contributions/`,
        data
      );
      console.log('Contribution created successfully:', response);
      return response;
    } catch (error: any) {
      console.error('Raw error response:', error.response?.data);
      const message = error.response?.data?.detail || 
                     error.response?.data?.error ||
                     error.response?.data?.non_field_errors?.[0] ||
                     error.response?.data?.membership_id?.[0] ||
                     error.response?.data?.amount?.[0] ||
                     error.response?.data?.payment_method?.[0] ||
                     error.message || 
                     'Erro ao criar contribuição';
      console.error('Error creating contribution:', message);
      throw new Error(message);
    }
  }

  /**
   * Confirm a contribution (pending -> confirmed)
   */
  static async confirmContribution(contributionId: number): Promise<{id:number; status:'confirmed'}> {
    try {
      return await apiClient.post<{id:number; status:'confirmed'}>(
        `${this.BASE_URL}/contributions/${contributionId}/confirm/`
      );
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Erro ao confirmar contribuição';
      throw new Error(message);
    }
  }

  /**
   * Get user's contributions
   */
  static async getMyContributions(): Promise<KixikilaContributionDTO[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<KixikilaContributionDTO>>(
        `${this.BASE_URL}/contributions/my_contributions/`
      );
      return response.results;
    } catch (error) {
      console.error('Error fetching my contributions:', error);
      throw error;
    }
  }

  /**
   * Get group contributions
   */
  static async getGroupContributions(
    groupId: number,
    page?: number
  ): Promise<PaginatedResponse<KixikilaContributionDTO>> {
    try {
      return await apiClient.get<PaginatedResponse<KixikilaContributionDTO>>(
        `${this.BASE_URL}/groups/${groupId}/contributions/`,
        { params: { page } }
      );
    } catch (error) {
      console.error(`Error fetching contributions for group ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's payouts
   */
  static async getMyPayouts(): Promise<KixikilaPayoutDTO[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<KixikilaPayoutDTO>>(
        `${this.BASE_URL}/payouts/my_payouts/`
      );
      return response.results;
    } catch (error) {
      console.error('Error fetching my payouts:', error);
      throw error;
    }
  }

  /**
   * Get group payouts
   */
  static async getGroupPayouts(
    groupId: number,
    page?: number
  ): Promise<PaginatedResponse<KixikilaPayoutDTO>> {
    try {
      return await apiClient.get<PaginatedResponse<KixikilaPayoutDTO>>(
        `${this.BASE_URL}/groups/${groupId}/payouts/`,
        { params: { page } }
      );
    } catch (error) {
      console.error(`Error fetching payouts for group ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Create rating for group
   */
  static async createRating(
    data: CreateRatingRequest
  ): Promise<KixikilaRatingDTO> {
    try {
      return await apiClient.post<KixikilaRatingDTO>(
        `${this.BASE_URL}/ratings/`,
        data
      );
    } catch (error) {
      console.error('Error creating rating:', error);
      throw error;
    }
  }

  /**
   * Get group ratings
   */
  static async getGroupRatings(
    groupId: number
  ): Promise<KixikilaRatingDTO[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<KixikilaRatingDTO>>(
        `${this.BASE_URL}/groups/${groupId}/ratings/`
      );
      return response.results;
    } catch (error) {
      console.error(`Error fetching ratings for group ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Get kixikila stats (dashboard)
   */
  static async getStats(): Promise<{
    total_groups: number;
    total_members: number;
    total_contributions: number;
    total_payouts: number;
  }> {
    try {
      return await apiClient.get(`${this.BASE_URL}/stats/`);
    } catch (error) {
      console.error('Error fetching kixikila stats:', error);
      throw error;
    }
  }
}

export default KixikilaService;
