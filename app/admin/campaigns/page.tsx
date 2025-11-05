'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getCampaigns, getRecipientCount, getSegmentStats } from '@/lib/actions/admin/campaigns';

const TEMPLATES = [
  {
    id: 'welcome',
    name: 'Bienvenue',
    description: 'Email de bienvenue pour nouveaux gestionnaires',
    emoji: '👋',
    defaultSubject: 'Bienvenue sur WelcomeApp !',
  },
  {
    id: 'inactive_reactivation',
    name: 'Réactivation',
    description: 'Relance gestionnaires inactifs',
    emoji: '🔄',
    defaultSubject: 'Ça fait un moment ! Découvrez les nouveautés',
  },
  {
    id: 'feature_announcement',
    name: 'Nouvelle fonctionnalité',
    description: 'Annonce d\'une nouvelle feature',
    emoji: '✨',
    defaultSubject: 'Nouvelle fonctionnalité disponible !',
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Newsletter mensuelle',
    emoji: '📰',
    defaultSubject: 'Newsletter WelcomeApp',
  },
  {
    id: 'tips_reminder',
    name: 'Rappel conseils',
    description: 'Rappel d\'ajouter des conseils',
    emoji: '💡',
    defaultSubject: 'Enrichissez votre WelcomeBook',
  },
];

const SEGMENTS = [
  { id: 'all', name: 'Tous les gestionnaires', emoji: '👥' },
  { id: 'Inactif', name: 'Inactifs (0 tips)', emoji: '😴' },
  { id: 'Débutant', name: 'Débutants (1-5 tips)', emoji: '🌱' },
  { id: 'Intermédiaire', name: 'Intermédiaires (6-15 tips)', emoji: '📈' },
  { id: 'Avancé', name: 'Avancés (16-30 tips)', emoji: '🚀' },
  { id: 'Expert', name: 'Experts (>30 tips)', emoji: '⭐' },
];

export default function CampaignsPage() {
  const router = useRouter();

  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');

  // UI state
  const [recipientCount, setRecipientCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // History state
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [segmentStats, setSegmentStats] = useState<Record<string, number>>({});

  // Load recipient count when segment changes
  useEffect(() => {
    async function loadRecipientCount() {
      const result = await getRecipientCount(selectedSegment);
      if (result.success) {
        setRecipientCount(result.count);
      }
    }
    loadRecipientCount();
  }, [selectedSegment]);

  // Load campaigns history and segment stats on mount
  useEffect(() => {
    async function loadData() {
      const [campaignsResult, statsResult] = await Promise.all([
        getCampaigns(),
        getSegmentStats(),
      ]);

      if (campaignsResult.success) {
        setCampaigns(campaignsResult.campaigns);
      }

      if (statsResult.success) {
        setSegmentStats(statsResult.stats);
      }
    }
    loadData();
  }, []);

  // Update subject when template changes
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSubject(template.defaultSubject);
    }
  };

  // Send test email
  const handleSendTest = async () => {
    if (!selectedTemplate || !subject) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un template et saisir un sujet' });
      return;
    }

    setIsSendingTest(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType: selectedTemplate,
          subject,
          segment: selectedSegment,
          testMode: true,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Email de test envoyé à votre adresse !' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Erreur lors de l\'envoi' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Send campaign
  const handleSendCampaign = async () => {
    if (!selectedTemplate || !subject) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un template et saisir un sujet' });
      return;
    }

    if (recipientCount === 0) {
      setMessage({ type: 'error', text: 'Aucun destinataire pour ce segment' });
      return;
    }

    const confirmed = confirm(
      `Êtes-vous sûr de vouloir envoyer cette campagne à ${recipientCount} gestionnaire(s) ?`
    );

    if (!confirmed) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType: selectedTemplate,
          subject,
          segment: selectedSegment,
          testMode: false,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `Campagne envoyée ! ${result.totalSent} email(s) envoyé(s), ${result.totalFailed} échec(s)`,
        });

        // Reload campaigns history
        const campaignsResult = await getCampaigns();
        if (campaignsResult.success) {
          setCampaigns(campaignsResult.campaigns);
        }

        // Reset form
        setSelectedTemplate('');
        setSubject('');
        setSelectedSegment('all');
      } else {
        setMessage({ type: 'error', text: result.error || 'Erreur lors de l\'envoi' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campagnes Email</h1>
            <p className="text-gray-600 mt-1">Composez et envoyez vos campagnes marketing</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin')}>
            ← Retour Admin
          </Button>
        </div>

        {/* Message feedback */}
        {message && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Composer */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Composer une campagne</h2>

          {/* Template selection */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-2 block">1. Sélectionnez un template</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateChange(template.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{template.emoji}</div>
                  <div className="font-medium text-sm mb-1">{template.name}</div>
                  <div className="text-xs text-gray-500">{template.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <Label htmlFor="subject" className="text-sm font-medium mb-2 block">
              2. Sujet de l'email
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Bienvenue sur WelcomeApp !"
              className="max-w-2xl"
            />
          </div>

          {/* Segment */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-2 block">
              3. Sélectionnez un segment ({recipientCount} destinataire(s))
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SEGMENTS.map((segment) => (
                <button
                  key={segment.id}
                  onClick={() => setSelectedSegment(segment.id)}
                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                    selectedSegment === segment.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{segment.emoji}</span>
                      <span className="font-medium text-sm">{segment.name}</span>
                    </div>
                    <Badge variant="secondary">{segmentStats[segment.id] || 0}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleSendTest}
              disabled={!selectedTemplate || !subject || isSendingTest}
            >
              {isSendingTest ? 'Envoi...' : '📧 Envoyer un test'}
            </Button>
            <Button
              onClick={handleSendCampaign}
              disabled={!selectedTemplate || !subject || recipientCount === 0 || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? 'Envoi en cours...' : `🚀 Envoyer à ${recipientCount} destinataire(s)`}
            </Button>
          </div>
        </Card>

        {/* History */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Historique des campagnes</h2>

          {campaigns.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune campagne envoyée pour le moment</p>
          ) : (
            <div className="space-y-3">
              {campaigns.slice(0, 10).map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{campaign.subject}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {TEMPLATES.find((t) => t.id === campaign.template_type)?.emoji}{' '}
                      {TEMPLATES.find((t) => t.id === campaign.template_type)?.name} •{' '}
                      {SEGMENTS.find((s) => s.id === campaign.segment)?.name} •{' '}
                      {new Date(campaign.sent_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{campaign.total_sent}</div>
                      <div className="text-xs text-gray-500">Envoyés</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-red-600">{campaign.total_failed}</div>
                      <div className="text-xs text-gray-500">Échecs</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
