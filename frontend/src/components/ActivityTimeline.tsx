import React, { useEffect, useState } from 'react';
import { Activity, Award, ShoppingCart, Users, Clock, Zap } from 'lucide-react';
import { fetchMeActivity } from '../services/core';
import { Card } from './common';

interface ActivityEvent {
  event_type: string;
  points: number;
  created_at: string;
  metadata?: Record<string, any>;
}

interface ActivityResponse {
  recent_events: ActivityEvent[];
  total_events: number;
}

/**
 * ActivityTimeline Component
 * Displays recent user activity from TrustEvents
 * Cached server-side for 5 minutes
 */
const ActivityTimeline: React.FC = () => {
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setLoading(true);
        const data = await fetchMeActivity();
        setActivity(data);
      } catch (err) {
        console.error('Failed to fetch activity:', err);
        setError('Não foi possível carregar o histórico');
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, []);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'kixikila_member':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'marketplace_sale':
        return <ShoppingCart className="w-5 h-5 text-blue-500" />;
      case 'cert_enrollment':
        return <Award className="w-5 h-5 text-purple-500" />;
      case 'season_joined':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getEventLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      kixikila_member: 'Aderiu ao Kixikila',
      marketplace_sale: 'Venda no Marketplace',
      cert_enrollment: 'Certificação iniciada',
      season_joined: 'Juntou-se a uma temporada',
    };
    return labels[eventType] || eventType;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-PT');
  };

  if (loading) {
    return (
      <Card className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-400 animate-spin" />
          <p className="text-gray-500">A carregar histórico...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 rounded-lg shadow border border-red-200">
        <p className="text-red-600 text-sm">{error}</p>
      </Card>
    );
  }

  if (!activity || activity.recent_events.length === 0) {
    return (
      <Card className="p-6 bg-gray-50 rounded-lg shadow">
        <p className="text-gray-500 text-center">Nenhuma atividade ainda</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-acredita-primary" />
          Atividade Recente
        </h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {activity.recent_events.length} eventos
        </span>
      </div>

      <div className="space-y-4">
        {activity.recent_events.slice(0, 10).map((event, index) => (
          <div
            key={index}
            className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              {getEventIcon(event.event_type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-gray-900">
                  {getEventLabel(event.event_type)}
                </p>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDate(event.created_at)}
                </span>
              </div>
              
              {/* Points Badge */}
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                  <Zap className="w-3 h-3" />
                  +{event.points} pontos
                </span>
              </div>

              {/* Metadata (if any) */}
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {event.metadata.description || JSON.stringify(event.metadata)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {activity.recent_events.length > 10 && (
        <div className="mt-4 text-center">
          <a
            href="#"
            className="text-sm font-medium text-acredita-primary hover:text-acredita-dark"
          >
            Ver todas ({activity.total_events})
          </a>
        </div>
      )}
    </Card>
  );
};

export default ActivityTimeline;
