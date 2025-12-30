import apiClient from './api/client';

export interface TrustBreakdownItem {
  event_type: string;
  points: number;
  count: number;
}

export interface MeDashboardResponse {
  user: { id: number; username: string; email: string | null };
  trust: { score: number; breakdown: TrustBreakdownItem[] };
  certifications: { total: number; avg_score: number | null };
  marketplace: {
    total_sales: number;
    revenue_estimate: number;
    rating: number | null;
    reviews: number;
  };
  kixikila: { groups: number; cycles_completed: number; total_saved_estimate: number };
  reality: { seasons_participated: number; is_winner: boolean };
}

export async function fetchMeDashboard(): Promise<MeDashboardResponse> {
  return await apiClient.get<MeDashboardResponse>('/api/v2/core/me/dashboard/', { skipErrorHandler: true });
}

export async function fetchRevenueSummary(): Promise<{ by_source: Array<{ source: string; total: number }> }> {
  return await apiClient.get('/api/v2/core/me/revenue/', { skipErrorHandler: true });
}

export interface ActivityEvent {
  event_type: string;
  points: number;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface ActivityResponse {
  recent_events: ActivityEvent[];
  total_events: number;
}

export async function fetchMeActivity(): Promise<ActivityResponse> {
  return await apiClient.get<ActivityResponse>('/api/v2/core/me/activity/', { skipErrorHandler: true });
}
