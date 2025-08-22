import { useEffect, useState } from 'react';

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
    setLoading(true);
    fetch('/api/donations/campaigns/')
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar campanhas de doação');
        return res.json();
      })
      .then(data => {
        setCampaigns(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        setCampaigns([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { campaigns, loading, error };
}
