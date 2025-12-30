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
   * Suspend a member in a group (owner or staff)
   */
  static async suspendMember(groupId: number, membershipId: number): Promise<{id:number; is_active:boolean}> {
    try {
      return await apiClient.post<{id:number; is_active:boolean}>(
        `${this.BASE_URL}/groups/${groupId}/suspend_member/`,
        { membership_id: membershipId }
      );
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Não foi possível suspender o membro';
      throw new Error(message);
    }
  }

  /**
   * Reactivate a suspended member in a group (owner or staff)
   */
  static async reactivateMember(groupId: number, membershipId: number): Promise<{id:number; is_active:boolean}> {
    try {
      return await apiClient.post<{id:number; is_active:boolean}>(
        `${this.BASE_URL}/groups/${groupId}/reactivate_member/`,
        { membership_id: membershipId }
      );
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Não foi possível reativar o membro';
      throw new Error(message);
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
   * Get group cycle information (current round, next beneficiary, pending contributions)
   */
  static async getGroupCycles(groupId: number): Promise<any> {
    try {
      return await apiClient.get<any>(
        `${this.BASE_URL}/groups/${groupId}/cycles/`
      );
    } catch (error) {
      console.error(`Error fetching cycles for group ${groupId}:`, error);
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
      let message = error.response?.data?.detail || 
                    error.response?.data?.error ||
                    error.response?.data?.non_field_errors?.[0] ||
                    error.response?.data?.membership_id?.[0] ||
                    error.response?.data?.amount?.[0] ||
                    error.response?.data?.payment_method?.[0] ||
                    error.message || 
                    'Erro ao criar contribuição';
      if (Array.isArray(error.response?.data) && error.response?.data[0]) {
        message = error.response.data[0];
      }
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
   * Get my reputation (computed)
   */
  static async getMyReputation(): Promise<{
    username: string;
    groups_participated: number;
    contributions_on_time: number;
    contributions_late: number;
    contributions_missed: number;
    reputation_score: number;
    trust_level: 'beginner' | 'reliable' | 'trusted' | 'champion';
  }> {
    try {
      return await apiClient.get(
        `${this.BASE_URL}/contributions/my_reputation/`
      );
    } catch (error) {
      console.error('Error fetching my reputation:', error);
      throw error;
    }
  }

  /**
   * Export group contributions as CSV (owner or staff)
   */
  static async exportGroupContributions(groupId: number): Promise<void> {
    try {
      const blob = await apiClient.get<Blob>(
        `${this.BASE_URL}/groups/${groupId}/contributions_export/`,
        { responseType: 'blob' as any }
      );
      const url = window.URL.createObjectURL(blob as any);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kixikila_group_${groupId}_contributions.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exporting contributions for group ${groupId}:`, error);
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
      // Gracefully handle 404 (endpoint not available) by returning empty
      const status = (error as any)?.response?.status;
      if (status === 404) {
        console.warn(`Ratings endpoint not found for group ${groupId}, returning empty list.`);
        return [];
      }
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

  /**
   * Get group analytics (member stats, contribution patterns, round participation)
   */
  static async getGroupAnalytics(groupId: number): Promise<any> {
    try {
      return await apiClient.get<any>(
        `${this.BASE_URL}/groups/${groupId}/analytics/`
      );
    } catch (error) {
      console.error(`Error fetching analytics for group ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Get reputation leaderboard
   */
  static async getLeaderboard(limit?: number): Promise<any> {
    try {
      const params = limit ? { limit } : {};
      return await apiClient.get<any>(
        `${this.BASE_URL}/leaderboard/reputation/`,
        { params }
      );
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }
}

export default KixikilaService;
