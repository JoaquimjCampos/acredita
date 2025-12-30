/**
 * useTrustScore Hook
 * Manages user trust score data and actions
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api/client';

export interface TrustScoreBreakdown {
  points: number;
  max_points: number;
}

export interface VerificationBreakdown extends TrustScoreBreakdown {
  email_verified: boolean;
  phone_verified: boolean;
  profile_complete: boolean;
}

export interface EngagementBreakdown extends TrustScoreBreakdown {
  votes_cast: number;
  content_published: number;
  positive_feedback_received: number;
}

export interface CreatorBreakdown extends TrustScoreBreakdown {
  sales_completed: number;
  average_rating: number;
  dispute_count: number;
}

export interface AccountStatus extends TrustScoreBreakdown {
  account_age_days: number;
  last_flagged_date: string | null;
  flag_reason: string | null;
}

export interface Milestone {
  name: string;
  required_score: number;
  unlocked: boolean;
  requirements: string[];
}

export interface Recommendation {
  action: string;
  title: string;
  description: string;
  points: number;
  priority: 'high' | 'medium' | 'low';
}

export interface TrustScoreData {
  total_score: number;
  verification_breakdown: VerificationBreakdown;
  engagement_breakdown: EngagementBreakdown;
  creator_breakdown: CreatorBreakdown;
  account_status: AccountStatus;
  milestones: {
    all: Milestone[];
    next: Milestone | null;
    progress_to_next: number;
  };
  can_create_marketplace: boolean;
  can_create_kixikila: boolean;
  can_publish_blog: boolean;
  user_type: string;
  username: string;
  recommendations: Recommendation[];
}

interface UseTrustScoreReturn {
  trustScore: TrustScoreData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  verifyEmail: () => Promise<{ success: boolean; message: string }>;
  verifyPhone: () => Promise<{ success: boolean; message: string }>;
  requestEmailVerification: () => Promise<{ success: boolean; message: string }>;
  confirmEmailVerification: (code: string) => Promise<{ success: boolean; message: string }>;
  requestPhoneVerification: () => Promise<{ success: boolean; message: string }>;
  confirmPhoneVerification: (code: string) => Promise<{ success: boolean; message: string }>;
}

export const useTrustScore = (): UseTrustScoreReturn => {
    const requestPhoneVerification = async (): Promise<{ success: boolean; message: string }> => {
      try {
        const response = await apiClient.post('/accounts/trust/request_phone_verification/');
        return {
          success: true,
          message: response.data.message || 'Código enviado para seu telefone.'
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.response?.data?.error || 'Erro ao solicitar código de telefone'
        };
      }
    };

    const confirmPhoneVerification = async (code: string): Promise<{ success: boolean; message: string }> => {
      try {
        const response = await apiClient.post('/accounts/trust/confirm_phone_verification/', { code });
        await fetchTrustScore();
        return {
          success: true,
          message: response.data.message || 'Telefone verificado com sucesso!'
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.response?.data?.error || 'Código inválido ou expirado'
        };
      }
    };
  const [trustScore, setTrustScore] = useState<TrustScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrustScore = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/accounts/trust/my_trust/');
      setTrustScore(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao carregar Trust Score');
      console.error('Error fetching trust score:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrustScore();
  }, [fetchTrustScore]);


  const requestEmailVerification = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post('/accounts/trust/request_email_verification/');
      return {
        success: true,
        message: response.data.message || 'Código enviado para seu email.'
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.error || 'Erro ao solicitar código de email'
      };
    }
  };

  const confirmEmailVerification = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post('/accounts/trust/confirm_email_verification/', { code });
      await fetchTrustScore();
      return {
        success: true,
        message: response.data.message || 'Email verificado com sucesso!'
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.error || 'Código inválido ou expirado'
      };
    }
  };

  const verifyEmail = async (): Promise<{ success: boolean; message: string }> => {
    // Mantém compatibilidade, chama requestEmailVerification
    return await requestEmailVerification();
  };

  const verifyPhone = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post('/accounts/trust/verify_phone/');
      await fetchTrustScore(); // Refresh data
      return {
        success: true,
        message: response.data.message || 'Telefone verificado com sucesso!'
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.detail || 'Erro ao verificar telefone'
      };
    }
  };

  return {
    trustScore,
    loading,
    error,
    refetch: fetchTrustScore,
    verifyEmail,
    verifyPhone,
    requestEmailVerification,
    confirmEmailVerification,
    requestPhoneVerification,
    confirmPhoneVerification
  };
};
