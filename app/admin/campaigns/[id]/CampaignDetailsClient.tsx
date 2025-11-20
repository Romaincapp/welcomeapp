'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Mail,
  Eye,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trophy,
} from 'lucide-react';
import { EmailEventsTimeline } from '@/components/admin/EmailEventsTimeline';
import type { CampaignAnalytics, ABTestComparison, EmailEventTimeline } from '@/types/email-analytics';

interface CampaignDetailsClientProps {
  campaignId: string;
  analytics: CampaignAnalytics;
  events: EmailEventTimeline[];
  abTestComparison: ABTestComparison | null;
}

export function CampaignDetailsClient({
  campaignId,
  analytics,
  events,
  abTestComparison,
}: CampaignDetailsClientProps) {
  const [exporting, setExporting] = useState(false);

  // Formater les dates
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  // Label des templates
  const getTemplateLabel = (template: string): string => {
    const labels: Record<string, string> = {
      welcome: 'Bienvenue',
      inactive_reactivation: 'Réactivation',
      feature_announcement: 'Annonce Feature',
      newsletter: 'Newsletter',
      tips_reminder: 'Rappel Tips',
    };
    return labels[template] || template;
  };

  // Calculer les stats par destinataire
  const recipientStats = useMemo(() => {
    const statsMap = new Map<string, {
      email: string;
      sent: boolean;
      delivered: boolean;
      opened: boolean;
      clicked: boolean;
      bounced: boolean;
      complained: boolean;
      lastEvent: EmailEventTimeline | null;
      clickedLinks: string[];
    }>();

    // Parcourir tous les événements
    events.forEach((event) => {
      const email = event.recipient_email;

      if (!statsMap.has(email)) {
        statsMap.set(email, {
          email,
          sent: false,
          delivered: false,
          opened: false,
          clicked: false,
          bounced: false,
          complained: false,
          lastEvent: null,
          clickedLinks: [],
        });
      }

      const stats = statsMap.get(email)!;

      // Mettre à jour les statuts
      switch (event.event_type) {
        case 'sent':
          stats.sent = true;
          break;
        case 'delivered':
          stats.delivered = true;
          break;
        case 'opened':
          stats.opened = true;
          break;
        case 'clicked':
          stats.clicked = true;
          if (typeof event.event_data.link === 'string' && !stats.clickedLinks.includes(event.event_data.link)) {
            stats.clickedLinks.push(event.event_data.link);
          }
          break;
        case 'bounced':
          stats.bounced = true;
          break;
        case 'complained':
          stats.complained = true;
          break;
      }

      // Mettre à jour le dernier événement (le plus récent)
      if (!stats.lastEvent || new Date(event.created_at) > new Date(stats.lastEvent.created_at)) {
        stats.lastEvent = event;
      }
    });

    return Array.from(statsMap.values()).sort((a, b) => {
      // Trier par date du dernier événement (plus récent en premier)
      if (!a.lastEvent) return 1;
      if (!b.lastEvent) return -1;
      return new Date(b.lastEvent.created_at).getTime() - new Date(a.lastEvent.created_at).getTime();
    });
  }, [events]);

  // Export CSV
  const handleExportCSV = () => {
    setExporting(true);

    try {
      // Créer les données CSV
      const headers = ['Email', 'Envoyé', 'Délivré', 'Ouvert', 'Cliqué', 'Rejeté', 'Spam', 'Liens cliqués', 'Dernier événement'];
      const rows = recipientStats.map((stats) => [
        stats.email,
        stats.sent ? 'Oui' : 'Non',
        stats.delivered ? 'Oui' : 'Non',
        stats.opened ? 'Oui' : 'Non',
        stats.clicked ? 'Oui' : 'Non',
        stats.bounced ? 'Oui' : 'Non',
        stats.complained ? 'Oui' : 'Non',
        stats.clickedLinks.join(' | '),
        stats.lastEvent?.relative_time || '',
      ]);

      // Créer le CSV
      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      // Télécharger
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `campagne-${campaignId}-${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur export CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  // Statut d'un destinataire (badge)
  const getRecipientStatusBadge = (stats: typeof recipientStats[0]) => {
    if (stats.complained) {
      return <Badge variant="destructive" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Spam</Badge>;
    }
    if (stats.bounced) {
      return <Badge variant="destructive" className="text-xs"><XCircle className="h-3 w-3 mr-1" />Rejeté</Badge>;
    }
    if (stats.clicked) {
      return <Badge variant="default" className="text-xs bg-green-600"><MousePointerClick className="h-3 w-3 mr-1" />Cliqué</Badge>;
    }
    if (stats.opened) {
      return <Badge variant="default" className="text-xs bg-blue-600"><Eye className="h-3 w-3 mr-1" />Ouvert</Badge>;
    }
    if (stats.delivered) {
      return <Badge variant="secondary" className="text-xs"><CheckCircle className="h-3 w-3 mr-1" />Délivré</Badge>;
    }
    if (stats.sent) {
      return <Badge variant="outline" className="text-xs"><Mail className="h-3 w-3 mr-1" />Envoyé</Badge>;
    }
    return <Badge variant="outline" className="text-xs">Inconnu</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/campaigns">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{analytics.subject}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(analytics.sent_at)}
                </span>
                <Badge variant="secondary">{getTemplateLabel(analytics.template_type)}</Badge>
                <Badge variant="outline">{analytics.segment === 'all' ? 'Tous' : analytics.segment}</Badge>
                {analytics.ab_test_enabled && (
                  <Badge variant="default" className="bg-purple-600">
                    A/B Test
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button onClick={handleExportCSV} disabled={exporting || recipientStats.length === 0} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Export...' : 'Export CSV'}
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Envoyés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">{analytics.total_sent}</div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              {analytics.total_failed > 0 && (
                <p className="text-xs text-red-600 mt-2">{analytics.total_failed} échecs</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Taux de livraison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">{analytics.delivery_rate.toFixed(1)}%</div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">{analytics.total_delivered} délivrés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Taux d'ouverture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">{analytics.open_rate.toFixed(1)}%</div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                {analytics.open_rate >= 20 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">Excellent</span>
                  </>
                ) : analytics.open_rate >= 15 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-orange-600" />
                    <span className="text-xs text-orange-600">Moyen</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-600" />
                    <span className="text-xs text-red-600">Faible</span>
                  </>
                )}
                <span className="text-xs text-gray-500 ml-1">({analytics.total_opened} ouverts)</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Taux de clic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">{analytics.click_rate.toFixed(1)}%</div>
                <MousePointerClick className="h-8 w-8 text-orange-500" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                {analytics.click_rate >= 3 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">Excellent</span>
                  </>
                ) : analytics.click_rate >= 1.5 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-orange-600" />
                    <span className="text-xs text-orange-600">Moyen</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-600" />
                    <span className="text-xs text-red-600">Faible</span>
                  </>
                )}
                <span className="text-xs text-gray-500 ml-1">({analytics.total_clicked} clics)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparaison A/B Test */}
        {abTestComparison && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                Résultats du Test A/B
              </CardTitle>
              <CardDescription>Comparaison des performances entre les deux variantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Variante A */}
                <div className={`p-4 rounded-lg border-2 ${abTestComparison.winner === 'A' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Variante A</h3>
                    {abTestComparison.winner === 'A' && (
                      <Badge variant="default" className="bg-green-600">
                        <Trophy className="h-3 w-3 mr-1" />
                        Gagnant
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-4 italic">"{abTestComparison.subject_a}"</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Envoyés:</span>
                      <span className="font-semibold">{abTestComparison.variant_a_sent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taux d'ouverture:</span>
                      <span className="font-semibold text-blue-600">{abTestComparison.variant_a_open_rate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taux de clic:</span>
                      <span className="font-semibold text-orange-600">{abTestComparison.variant_a_click_rate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Variante B */}
                <div className={`p-4 rounded-lg border-2 ${abTestComparison.winner === 'B' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Variante B</h3>
                    {abTestComparison.winner === 'B' && (
                      <Badge variant="default" className="bg-green-600">
                        <Trophy className="h-3 w-3 mr-1" />
                        Gagnant
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-4 italic">"{abTestComparison.subject_b}"</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Envoyés:</span>
                      <span className="font-semibold">{abTestComparison.variant_b_sent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taux d'ouverture:</span>
                      <span className="font-semibold text-blue-600">{abTestComparison.variant_b_open_rate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taux de clic:</span>
                      <span className="font-semibold text-orange-600">{abTestComparison.variant_b_click_rate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline des événements */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline des Événements</h2>
          <EmailEventsTimeline campaignId={campaignId} limit={100} />
        </div>

        {/* Table des destinataires */}
        <Card>
          <CardHeader>
            <CardTitle>Destinataires ({recipientStats.length})</CardTitle>
            <CardDescription>Détail des statuts par destinataire</CardDescription>
          </CardHeader>
          <CardContent>
            {recipientStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucune donnée de destinataire disponible</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Liens cliqués</TableHead>
                      <TableHead>Dernier événement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipientStats.slice(0, 50).map((stats) => (
                      <TableRow key={stats.email}>
                        <TableCell className="font-medium">{stats.email}</TableCell>
                        <TableCell>{getRecipientStatusBadge(stats)}</TableCell>
                        <TableCell>
                          {stats.clickedLinks.length > 0 ? (
                            <div className="space-y-1">
                              {stats.clickedLinks.map((link, idx) => (
                                <div key={idx} className="text-xs text-blue-600 truncate max-w-xs" title={link}>
                                  🔗 {link}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {stats.lastEvent?.relative_time || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {recipientStats.length > 50 && (
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Affichage des 50 premiers destinataires sur {recipientStats.length} total.
                    <br />
                    Exportez le CSV pour voir la liste complète.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
