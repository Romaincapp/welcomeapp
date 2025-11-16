'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  getAutomations,
  updateAutomation,
  getAutomationStats,
  getAutomationHistory,
  triggerAutomationsCron,
} from '@/lib/actions/admin/automations';
import { Play, RefreshCw, Clock, CheckCircle, XCircle, Bot } from 'lucide-react';

const AUTOMATION_DESCRIPTIONS = {
  welcome_sequence: {
    name: 'Séquence de bienvenue',
    emoji: '👋',
    description: 'Envoi automatique d\'emails de bienvenue aux nouveaux gestionnaires',
    schedule: 'J+0, J+3, J+7 après inscription',
  },
  inactive_reactivation: {
    name: 'Relance inactifs',
    emoji: '🔄',
    description: 'Réactivation automatique des gestionnaires inactifs',
    schedule: 'Tous les 30 jours (avec cooldown de 60 jours)',
  },
  tips_reminder: {
    name: 'Rappel conseils',
    emoji: '💡',
    description: 'Rappel d\'ajouter des conseils pour les gestionnaires avec <10 tips',
    schedule: 'Tous les 7 jours',
  },
};

export default function AutomationsPage() {
  const router = useRouter();

  // State
  const [automations, setAutomations] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggeringCron, setIsTriggeringCron] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);

    const [automationsResult, statsResult, historyResult] = await Promise.all([
      getAutomations(),
      getAutomationStats(),
      getAutomationHistory(20),
    ]);

    if (automationsResult.success) {
      setAutomations(automationsResult.automations);
    }

    if (statsResult.success) {
      setStats(statsResult.stats);
    }

    if (historyResult.success) {
      setHistory(historyResult.history);
    }

    setIsLoading(false);
  }

  // Toggle automation
  async function handleToggleAutomation(automationType: string, currentlyEnabled: boolean) {
    const result = await updateAutomation({
      automationType,
      isEnabled: !currentlyEnabled,
    });

    if (result.success) {
      setMessage({
        type: 'success',
        text: `Automation ${!currentlyEnabled ? 'activée' : 'désactivée'} avec succès`,
      });

      // Reload automations
      const automationsResult = await getAutomations();
      if (automationsResult.success) {
        setAutomations(automationsResult.automations);
      }
    } else {
      setMessage({
        type: 'error',
        text: result.error || 'Erreur lors de la mise à jour',
      });
    }

    // Clear message after 3s
    setTimeout(() => setMessage(null), 3000);
  }

  // Trigger cron manually
  async function handleTriggerCron() {
    setIsTriggeringCron(true);
    setMessage(null);

    const result = await triggerAutomationsCron();

    if (result.success) {
      setMessage({
        type: 'success',
        text: `Cron exécuté avec succès ! ${result.result?.totalSent || 0} email(s) envoyé(s)`,
      });

      // Reload data
      loadData();
    } else {
      setMessage({
        type: 'error',
        text: result.error || 'Erreur lors de l\'exécution du cron',
      });
    }

    setIsTriggeringCron(false);
  }

  // Get stats for an automation type
  function getStatsFor(automationType: string) {
    return stats.find((s) => s.automation_type === automationType);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Email Automations</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Gérez vos automatisations d'emails</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={handleTriggerCron}
              disabled={isTriggeringCron}
              className="flex items-center justify-center gap-2 text-sm"
            >
              <Play className="h-4 w-4" />
              {isTriggeringCron ? 'Exécution...' : 'Tester maintenant'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/admin')}
              className="text-sm"
            >
              ← Retour Admin
            </Button>
          </div>
        </div>

        {/* Message feedback */}
        {message && (
          <Alert
            className={`mb-6 ${
              message.type === 'success'
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
            }`}
          >
            <AlertDescription
              className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Info Banner */}
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 font-medium">
                Le cron job s'exécute automatiquement 1 fois par jour à 9h00 UTC sur Vercel.
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Les emails sont envoyés uniquement si l'automation est activée (ON) et si les
                conditions sont remplies.
              </p>
            </div>
          </div>
        </Card>

        {/* Automations Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {automations.map((automation) => {
            const desc = AUTOMATION_DESCRIPTIONS[automation.automation_type as keyof typeof AUTOMATION_DESCRIPTIONS];
            const automationStats = getStatsFor(automation.automation_type);

            return (
              <Card key={automation.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{desc.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{desc.name}</h3>
                      <Badge
                        variant={automation.is_enabled ? 'default' : 'secondary'}
                        className={automation.is_enabled ? 'bg-green-500' : ''}
                      >
                        {automation.is_enabled ? 'ON' : 'OFF'}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    checked={automation.is_enabled}
                    onCheckedChange={() =>
                      handleToggleAutomation(automation.automation_type, automation.is_enabled)
                    }
                  />
                </div>

                <p className="text-sm text-gray-600 mb-3">{desc.description}</p>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <Clock className="h-3 w-3" />
                  {desc.schedule}
                </div>

                {/* Stats */}
                {automationStats && (
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {automationStats.total_sent || 0}
                      </div>
                      <div className="text-xs text-gray-500">Envoyés</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {automationStats.successful || 0}
                      </div>
                      <div className="text-xs text-gray-500">Succès</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-600">
                        {automationStats.failed || 0}
                      </div>
                      <div className="text-xs text-gray-500">Échecs</div>
                    </div>
                  </div>
                )}

                {!automationStats && (
                  <p className="text-xs text-gray-400 pt-4 border-t text-center">
                    Aucun email envoyé pour le moment
                  </p>
                )}
              </Card>
            );
          })}
        </div>

        {/* History */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Historique des envois (20 derniers)</h2>

          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun email automatique envoyé pour le moment</p>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">
                          {item.clients?.email || 'Email inconnu'}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <Badge variant="outline" className="text-xs">
                          {item.email_type}
                        </Badge>
                      </div>
                      {!item.success && item.error_message && (
                        <p className="text-xs text-red-600 mt-1 truncate">{item.error_message}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex-shrink-0 sm:ml-4">
                    {new Date(item.sent_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Configuration Details */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Configuration des automatisations</h2>
          <div className="space-y-4">
            {automations.map((automation) => {
              const desc = AUTOMATION_DESCRIPTIONS[automation.automation_type as keyof typeof AUTOMATION_DESCRIPTIONS];
              return (
                <div key={automation.id} className="border-l-4 border-indigo-500 pl-4">
                  <h3 className="font-medium text-sm mb-2">
                    {desc.emoji} {desc.name}
                  </h3>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(automation.config, null, 2)}
                  </pre>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
