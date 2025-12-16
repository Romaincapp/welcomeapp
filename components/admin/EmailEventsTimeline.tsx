'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  CheckCircle,
  Eye,
  MousePointer,
  XCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { getCampaignEventsTimeline } from '@/lib/actions/admin/campaign-analytics';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EmailEvent {
  id: string;
  event_type: string;
  recipient_email: string;
  event_data: Record<string, unknown>;
  created_at: string;
  relative_time: string;
  icon_color: string;
}

interface EmailEventsTimelineProps {
  campaignId: string;
  limit?: number;
  initialEvents?: EmailEvent[];
}

/**
 * Composant Timeline des Événements Email
 *
 * Affiche l'historique chronologique des événements d'une campagne email
 * (sent, delivered, opened, clicked, bounced, complained)
 *
 * Usage:
 * <EmailEventsTimeline campaignId="uuid-campaign" limit={50} />
 * <EmailEventsTimeline campaignId="uuid-campaign" initialEvents={events} limit={50} />
 */
export function EmailEventsTimeline({ campaignId, limit = 50, initialEvents }: EmailEventsTimelineProps) {
  const [events, setEvents] = useState<EmailEvent[]>(initialEvents || []);
  const [loading, setLoading] = useState(!initialEvents);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Si on a déjà des événements initiaux, ne pas recharger
    if (initialEvents && initialEvents.length > 0) {
      setEvents(initialEvents);
      setLoading(false);
      return;
    }

    async function loadEvents() {
      setLoading(true);
      setError(null);

      const result = await getCampaignEventsTimeline(campaignId, limit);

      if (!result.success) {
        setError(result.error || 'Erreur lors du chargement des événements');
        setLoading(false);
        return;
      }

      setEvents(result.events || []);
      setLoading(false);
    }

    loadEvents();
  }, [campaignId, limit, initialEvents]);

  // Icône selon le type d'événement
  const getEventIcon = (eventType: string) => {
    const iconProps = { className: 'h-4 w-4' };

    switch (eventType) {
      case 'sent':
        return <Mail {...iconProps} />;
      case 'delivered':
        return <CheckCircle {...iconProps} />;
      case 'opened':
        return <Eye {...iconProps} />;
      case 'clicked':
        return <MousePointer {...iconProps} />;
      case 'bounced':
        return <XCircle {...iconProps} />;
      case 'complained':
        return <AlertTriangle {...iconProps} />;
      case 'delivery_delayed':
        return <Clock {...iconProps} />;
      default:
        return <Mail {...iconProps} />;
    }
  };

  // Label selon le type d'événement
  const getEventLabel = (eventType: string): string => {
    const labels: Record<string, string> = {
      sent: 'Envoyé',
      delivered: 'Délivré',
      opened: 'Ouvert',
      clicked: 'Cliqué',
      bounced: 'Rejeté',
      complained: 'Marqué comme spam',
      delivery_delayed: 'Retardé',
    };
    return labels[eventType] || eventType;
  };

  // Badge variant selon le type
  const getEventVariant = (eventType: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (eventType) {
      case 'delivered':
      case 'opened':
      case 'clicked':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'bounced':
      case 'complained':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Chargement des événements...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucun événement pour cette campagne</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Les événements apparaîtront ici après l'envoi et l'interaction avec les emails
          </p>
        </div>
      </Card>
    );
  }

  // Afficher les 10 premiers ou tous selon showAll
  const displayedEvents = showAll ? events : events.slice(0, 10);

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Timeline des Événements</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {events.length} événement{events.length > 1 ? 's' : ''} enregistré{events.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-3">
        {displayedEvents.map((event, index) => (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {/* Icône */}
            <div className={`mt-0.5 ${event.icon_color}`}>
              {getEventIcon(event.event_type)}
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={getEventVariant(event.event_type)} className="text-xs">
                  {getEventLabel(event.event_type)}
                </Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400">{event.relative_time}</span>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{event.recipient_email}</p>

              {/* Données supplémentaires selon le type */}
              {event.event_type === 'clicked' && typeof event.event_data.link === 'string' && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 truncate">
                  🔗 {event.event_data.link}
                </p>
              )}

              {event.event_type === 'bounced' && typeof event.event_data.bounce_reason === 'string' && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Raison : {event.event_data.bounce_reason}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bouton "Afficher plus" */}
      {events.length > 10 && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Afficher moins' : `Afficher tout (${events.length - 10} de plus)`}
          </Button>
        </div>
      )}
    </Card>
  );
}
