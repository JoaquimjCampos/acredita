import { useEffect, useState } from 'react';
import { mcpFetch } from '../mcpClient';

export interface DonationCampaign {
  id: number;
  title: string;
  description: string;
  goal_amount: number;
  raised_amount: number;
  start_date: string;
  end_date: string;
  image?: string;
  video_url?: string;
  min_donation: number;
  max_donation?: number;
  status: string;
  progress_percentage?: number;
}

export function useDonationCampaigns() {
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setLoading(true);
        setError(null);
        const { data } = await mcpFetch('/api/donations/campaigns/');
        if (Array.isArray(data)) {
          setCampaigns(data);
        } else if (data && Array.isArray(data.results)) {
          setCampaigns(data.results);
        } else {
          setCampaigns([]);
        }
      } catch (err: any) {
        setError('Erro ao carregar campanhas de doação');
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  return { campaigns, loading, error };
}
