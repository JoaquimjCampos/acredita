import { useCoreDashboard } from './useCoreDashboard';

interface UserEngagement {
  primary_engagement: string;
  engagement_breakdown: Record<string, number>;
  primary_percentage: number;
}

/**
 * Hook to determine user's primary engagement module
 * Based on trust_breakdown from dashboard endpoint
 * 
 * Returns the module where user has most engagement points
 * Default fallback: 'marketplace'
 */
export const useUserEngagement = (): UserEngagement => {
  const { data: me } = useCoreDashboard(true);

  // Extract breakdown from dashboard data (from trust.breakdown array)
  const breakdown = me?.trust?.breakdown || [];
  
  // Find module with highest engagement
  let primary = 'marketplace';
  let highestCount = 0;
  let totalCount = 0;

  // Calculate total and find max
  breakdown.forEach((item) => {
    totalCount += item.count;
    
    if (item.count > highestCount) {
      highestCount = item.count;
      primary = item.event_type;
    }
  });

  // Calculate percentage
  const percentage = totalCount > 0 ? Math.round((highestCount / totalCount) * 100) : 0;

  // Build engagement breakdown object
  const engagement_breakdown: Record<string, number> = {};
  breakdown.forEach((item) => {
    engagement_breakdown[item.event_type] = item.count;
  });

  return {
    primary_engagement: primary,
    engagement_breakdown,
    primary_percentage: percentage
  };
};
