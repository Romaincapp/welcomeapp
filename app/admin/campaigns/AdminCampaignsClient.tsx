'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Mail,
  Send,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  MousePointerClick,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  FileText,
} from 'lucide-react';
import type { CampaignAnalytics } from '@/lib/actions/admin/campaign-analytics';
import { EmailTemplatePreview } from '@/components/admin/EmailTemplatePreview';

interface AdminCampaignsClientProps {
  campaigns: CampaignAnalytics[];
}

type TemplateType = 'welcome' | 'inactive_reactivation' | 'feature_announcement' | 'newsletter' | 'tips_reminder';
type Segment = 'all' | 'Inactif' | 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';

export default function AdminCampaignsClient({ campaigns }: AdminCampaignsClientProps) {
  // État formulaire nouvelle campagne
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [templateType, setTemplateType] = useState<TemplateType>('newsletter');
  const [subject, setSubject] = useState('');
  const [segment, setSegment] = useState<Segment>('all');
  const [testMode, setTestMode] = useState(true);
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [abTestSubjectA, setAbTestSubjectA] = useState('');
  const [abTestSubjectB, setAbTestSubjectB] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // État preview template
  const [showPreview, setShowPreview] = useState(false);

  // Filtres
  const [filterTemplate, setFilterTemplate] = useState<string>('all');
  const [filterSegment, setFilterSegment] = useState<string>('all');

  // Filtrer les campagnes
  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filterTemplate !== 'all' && campaign.template_type !== filterTemplate) return false;
    if (filterSegment !== 'all' && campaign.segment !== filterSegment) return false;
    return true;
  });

  // Calculer les stats globales
  const totalSent = campaigns.reduce((acc, c) => acc + (c.total_sent || 0), 0);
  const avgOpenRate =
    campaigns.reduce((acc, c) => acc + (c.open_rate || 0), 0) / campaigns.length || 0;
  const avgClickRate =
    campaigns.reduce((acc, c) => acc + (c.click_rate || 0), 0) / campaigns.length || 0;

  // Envoyer une campagne
  const handleSendCampaign = async () => {
    setIsSending(true);
    setSendResult(null);

    try {
      const payload = {
        templateType,
        subject: abTestEnabled ? abTestSubjectA : subject,
        segment,
        testMode,
        abTestEnabled,
        ...(abTestEnabled && {
          abTestSubjectA,
          abTestSubjectB,
        }),
      };

      const response = await fetch('/api/admin/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSendResult({
          success: true,
          message: `✅ Campagne envoyée avec succès ! ${data.totalSent} emails envoyés, ${data.totalFailed} échecs.`,
        });
        // Reset form
        setSubject('');
        setAbTestSubjectA('');
        setAbTestSubjectB('');
        setAbTestEnabled(false);
        // Refresh page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setSendResult({
          success: false,
          message: `❌ Erreur: ${data.error || 'Échec de l\'envoi'}`,
        });
      }
    } catch (error) {
      setSendResult({
        success: false,
        message: `❌ Erreur réseau: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Campagnes Email</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Gérez et analysez vos campagnes email marketing
          </p>
        </div>
        <Button
          onClick={() => setShowNewCampaign(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Send className="h-4 w-4 mr-2" />
          Nouvelle Campagne
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Envoyés</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{campaigns.length} campagnes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'Ouverture Moyen</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgOpenRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {avgOpenRate > 20 ? (
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Excellent
                </span>
              ) : (
                <span className="text-orange-600 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  À améliorer
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Clics Moyen</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgClickRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {avgClickRate > 5 ? (
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Très bien
                </span>
              ) : (
                <span className="text-orange-600 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  Peut mieux faire
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label>Type de template</Label>
            <Select value={filterTemplate} onValueChange={setFilterTemplate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="welcome">Bienvenue</SelectItem>
                <SelectItem value="inactive_reactivation">Réactivation</SelectItem>
                <SelectItem value="feature_announcement">Annonce</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
                <SelectItem value="tips_reminder">Rappel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label>Segment</Label>
            <Select value={filterSegment} onValueChange={setFilterSegment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="Inactif">Inactif</SelectItem>
                <SelectItem value="Débutant">Débutant</SelectItem>
                <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                <SelectItem value="Avancé">Avancé</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des campagnes */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des campagnes</CardTitle>
          <CardDescription>{filteredCampaigns.length} campagne(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCampaigns.length > 0 ? (
            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => (
                <div
                  key={campaign.campaign_id}
                  className="flex flex-col gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{campaign.subject}</h3>
                        {campaign.ab_test_enabled && (
                          <Badge variant="outline" className="text-xs">
                            A/B Test
                          </Badge>
                        )}
                        {campaign.ab_test_winner && (
                          <Badge className="text-xs bg-green-100 text-green-700">
                            Gagnant: {campaign.ab_test_winner}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(campaign.sent_at).toLocaleDateString('fr-FR')}
                        </span>
                        <span>•</span>
                        <span>{campaign.template_type}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {campaign.segment}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Envoyés</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{campaign.total_sent || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Délivrés</p>
                      <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                        {campaign.total_delivered || 0}
                        {campaign.delivery_rate && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            ({campaign.delivery_rate.toFixed(0)}%)
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Ouverts</p>
                      <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                        {campaign.total_opened || 0}
                        {campaign.open_rate && (
                          <span
                            className={`text-xs ${
                              campaign.open_rate > 20 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                            }`}
                          >
                            ({campaign.open_rate.toFixed(0)}%)
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Clics</p>
                      <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                        {campaign.total_clicked || 0}
                        {campaign.click_rate && (
                          <span
                            className={`text-xs ${
                              campaign.click_rate > 5 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                            }`}
                          >
                            ({campaign.click_rate.toFixed(0)}%)
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Statut</p>
                      <div className="flex items-center gap-1">
                        {campaign.total_bounced || campaign.total_complained ? (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-xs text-red-600">
                              {(campaign.total_bounced || 0) + (campaign.total_complained || 0)}{' '}
                              erreurs
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-green-600">OK</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bouton Voir détails */}
                  <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Link href={`/admin/campaigns/${campaign.campaign_id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-medium">Aucune campagne trouvée</p>
              <p className="text-sm">Envoyez votre première campagne pour commencer</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Nouvelle Campagne */}
      <AlertDialog open={showNewCampaign} onOpenChange={setShowNewCampaign}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Nouvelle Campagne Email</AlertDialogTitle>
            <AlertDialogDescription>
              Créez et envoyez une campagne email à vos gestionnaires
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-6 py-4">
            {/* Mode Test */}
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Mode Test</p>
                  <p className="text-sm text-yellow-700">
                    {testMode
                      ? 'Uniquement envoyé à votre email'
                      : 'Sera envoyé à tous les destinataires'}
                  </p>
                </div>
              </div>
              <Switch checked={testMode} onCheckedChange={setTestMode} />
            </div>

            {/* Template Type */}
            <div>
              <Label>Type de campagne</Label>
              <Select value={templateType} onValueChange={(v) => setTemplateType(v as TemplateType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Bienvenue</SelectItem>
                  <SelectItem value="inactive_reactivation">Réactivation inactifs</SelectItem>
                  <SelectItem value="feature_announcement">Annonce de fonctionnalité</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="tips_reminder">Rappel d'ajout de conseils</SelectItem>
                </SelectContent>
              </Select>

              {/* Bouton Aperçu */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
                disabled={!subject && !abTestSubjectA}
                className="mt-2 w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                Aperçu du template
              </Button>
            </div>

            {/* Segment */}
            <div>
              <Label>Segment cible</Label>
              <Select value={segment} onValueChange={(v) => setSegment(v as Segment)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les gestionnaires</SelectItem>
                  <SelectItem value="Inactif">Inactif (0 tips)</SelectItem>
                  <SelectItem value="Débutant">Débutant (1-3 tips)</SelectItem>
                  <SelectItem value="Intermédiaire">Intermédiaire (4-7 tips)</SelectItem>
                  <SelectItem value="Avancé">Avancé (8-15 tips)</SelectItem>
                  <SelectItem value="Expert">Expert (16+ tips)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* A/B Test Toggle */}
            <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div>
                <p className="font-medium text-purple-900">A/B Testing</p>
                <p className="text-sm text-purple-700">
                  Tester 2 sujets différents (split 50/50)
                </p>
              </div>
              <Switch checked={abTestEnabled} onCheckedChange={setAbTestEnabled} />
            </div>

            {/* Sujet(s) */}
            {abTestEnabled ? (
              <div className="space-y-4">
                <div>
                  <Label>Sujet Variante A</Label>
                  <Input
                    value={abTestSubjectA}
                    onChange={(e) => setAbTestSubjectA(e.target.value)}
                    placeholder="Ex: 🎉 Nouvelle fonctionnalité disponible !"
                  />
                </div>
                <div>
                  <Label>Sujet Variante B</Label>
                  <Input
                    value={abTestSubjectB}
                    onChange={(e) => setAbTestSubjectB(e.target.value)}
                    placeholder="Ex: Découvrez notre dernière innovation"
                  />
                </div>
              </div>
            ) : (
              <div>
                <Label>Sujet de l'email</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Newsletter WelcomeApp - Novembre 2025"
                />
              </div>
            )}

            {/* Résultat envoi */}
            {sendResult && (
              <div
                className={`p-4 rounded-lg ${
                  sendResult.success
                    ? 'bg-green-50 border border-green-200 text-green-900'
                    : 'bg-red-50 border border-red-200 text-red-900'
                }`}
              >
                {sendResult.message}
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleSendCampaign();
              }}
              disabled={
                isSending ||
                (abTestEnabled ? !abTestSubjectA || !abTestSubjectB : !subject)
              }
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Aperçu Template */}
      <EmailTemplatePreview
        open={showPreview}
        onClose={() => setShowPreview(false)}
        templateType={templateType}
        subject={abTestEnabled && abTestSubjectA ? abTestSubjectA : subject || 'Aperçu du template'}
      />
    </div>
  );
}
