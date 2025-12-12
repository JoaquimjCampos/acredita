/**
 * Payout Service Extension
 * Métodos para gerenciar payouts do Kixikila
 */

import { apiClient } from '../api/client';
import { KixikilaPayoutDTO, PaginatedResponse } from '../../types/api';

export class PayoutService {
  private static readonly BASE_URL = '/api/v2/kixikila';

  /**
   * Get user's payouts
   */
  static async getPayouts(filters?: {
    status?: string;
    group?: number;
  }): Promise<KixikilaPayoutDTO[]> {
    try {
      const params = {
        status: filters?.status,
        group: filters?.group,
      };

      Object.keys(params).forEach((key) => {
        if (params[key as keyof typeof params] === undefined) {
          delete params[key as keyof typeof params];
        }
      });

      const response = await apiClient.get<PaginatedResponse<KixikilaPayoutDTO>>(
        `${this.BASE_URL}/payouts/`,
        { params }
      );
      return response.results;
    } catch (error) {
      console.error('Error fetching payouts:', error);
      throw error;
    }
  }

  /**
   * Get specific payout
   */
  static async getPayout(payoutId: number): Promise<KixikilaPayoutDTO> {
    try {
      return await apiClient.get<KixikilaPayoutDTO>(
        `${this.BASE_URL}/payouts/${payoutId}/`
      );
    } catch (error) {
      console.error(`Error fetching payout ${payoutId}:`, error);
      throw error;
    }
  }

  /**
   * Create payout for a specific round (admin only)
   */
  static async createPayoutForRound(data: {
    group_id: number;
    round: number;
    recipient_id: number;
    payment_method?: string;
  }): Promise<KixikilaPayoutDTO> {
    try {
      return await apiClient.post<KixikilaPayoutDTO>(
        `${this.BASE_URL}/payouts/create_for_round/`,
        data
      );
    } catch (error) {
      console.error('Error creating payout:', error);
      throw error;
    }
  }

  /**
   * Mark payout as processing (admin only)
   */
  static async processPayout(payoutId: number): Promise<KixikilaPayoutDTO> {
    try {
      return await apiClient.post<KixikilaPayoutDTO>(
        `${this.BASE_URL}/payouts/${payoutId}/process/`
      );
    } catch (error) {
      console.error(`Error processing payout ${payoutId}:`, error);
      throw error;
    }
  }

  /**
   * Mark payout as completed (admin only)
   */
  static async completePayout(
    payoutId: number,
    payment_method: string
  ): Promise<KixikilaPayoutDTO> {
    try {
      return await apiClient.post<KixikilaPayoutDTO>(
        `${this.BASE_URL}/payouts/${payoutId}/complete/`,
        { payment_method }
      );
    } catch (error) {
      console.error(`Error completing payout ${payoutId}:`, error);
      throw error;
    }
  }

  /**
   * Mark payout as failed (admin only)
   */
  static async failPayout(
    payoutId: number,
    reason: string
  ): Promise<KixikilaPayoutDTO> {
    try {
      return await apiClient.post<KixikilaPayoutDTO>(
        `${this.BASE_URL}/payouts/${payoutId}/fail/`,
        { reason }
      );
    } catch (error) {
      console.error(`Error failing payout ${payoutId}:`, error);
      throw error;
    }
  }
}

export default PayoutService;
