import React, { useEffect, useState } from 'react';
import { Card, LoadingSpinner } from '../components/common';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const DonationSection: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch when user is authenticated to avoid 401 loops
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    apiService.getDonationCampaigns()
      .then(res => {
        if (Array.isArray(res)) {
          setCampaigns(res);
        } else if (Array.isArray(res.results)) {
          setCampaigns(res.results);
        } else {
          setCampaigns([]);
        }
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleDonate = async () => {
    if (!selected || !amount) return;
    setSuccess(null);
    setError(null);
    try {
      const res = await apiService.makeDonation({ campaign: selected, amount: Number(amount) });
      setSuccess(res.mensagem || 'Doação realizada com sucesso!');
      setAmount('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <LoadingSpinner text="Carregando campanhas de doação..." />;
  if (error) return <Card className="mb-4"><div className="text-red-500">{error}</div></Card>;

  return (
    <Card title="Campanhas de Doação">
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div className="mb-4">
        <select value={selected || ''} onChange={e => setSelected(Number(e.target.value))} className="border rounded px-2 py-1">
          <option value="">Selecione uma campanha</option>
          {campaigns.map(c => (
            <option key={c.id} value={c.id}>{c.title} (Meta: {c.goal_amount})</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <input type="number" min="1" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Valor da doação" className="border rounded px-2 py-1" />
      </div>
      <button onClick={handleDonate} className="bg-acredita-primary text-white px-4 py-2 rounded font-bold">Doar</button>
    </Card>
  );
};

export default DonationSection;
