'use client';

import { useState, useEffect } from 'react';
import { render } from '@react-email/components';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Loader2 } from 'lucide-react';
import {
  WelcomeEmail,
  InactiveReactivation,
  FeatureAnnouncement,
  Newsletter,
  TipsReminder,
} from '@/emails';

interface EmailTemplatePreviewProps {
  open: boolean;
  onClose: () => void;
  templateType: string;
  subject: string;
}

/**
 * Composant de prévisualisation des templates email
 *
 * Rend un template React Email en HTML et l'affiche dans un iframe
 * pour visualiser l'apparence exacte de l'email avant envoi
 */
export function EmailTemplatePreview({
  open,
  onClose,
  templateType,
  subject,
}: EmailTemplatePreviewProps) {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Données mockées pour le recipient
  const mockRecipient = {
    name: 'Sophie Martin',
    email: 'sophie.martin@example.com',
    slug: 'villa-bord-de-mer',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours
  };

  // Stats mockées pour les templates qui en ont besoin
  const mockStats = {
    totalManagers: 150,
    totalTips: 2500,
    totalViews: 45000,
    avgTipsPerManager: 17,
    topCategory: 'Restaurants',
  };

  // Label des templates
  const getTemplateLabel = (template: string): string => {
    const labels: Record<string, string> = {
      welcome: 'Email de Bienvenue',
      inactive_reactivation: 'Email de Réactivation',
      feature_announcement: 'Annonce de Nouveauté',
      newsletter: 'Newsletter Mensuelle',
      tips_reminder: 'Rappel de Tips',
    };
    return labels[template] || template;
  };

  useEffect(() => {
    if (!open) {
      setHtml('');
      setLoading(true);
      return;
    }

    async function renderTemplate() {
      setLoading(true);

      try {
        const managerName = mockRecipient.name;
        const managerEmail = mockRecipient.email;
        const slug = mockRecipient.slug;
        const daysSinceCreation = 7;

        let renderedHtml = '';

        // Rendre le template selon le type
        switch (templateType) {
          case 'welcome':
            renderedHtml = await render(
              WelcomeEmail({
                managerName,
                managerEmail,
                slug,
              })
            );
            break;

          case 'inactive_reactivation':
            renderedHtml = await render(
              InactiveReactivation({
                managerName,
                managerEmail,
                slug,
                daysSinceLastLogin: daysSinceCreation,
              })
            );
            break;

          case 'feature_announcement':
            renderedHtml = await render(
              FeatureAnnouncement({
                managerName,
                managerEmail,
                featureName: 'Analytics Avancées',
                featureDescription:
                  'Découvrez les nouvelles analytics pour mieux comprendre l\'engagement de vos visiteurs',
                ctaUrl: `https://welcomeapp.be/dashboard/analytics`,
                ctaText: 'Découvrir les Analytics',
              })
            );
            break;

          case 'newsletter':
            renderedHtml = await render(
              Newsletter({
                managerName,
                managerEmail,
                month: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
                platformStats: mockStats,
              })
            );
            break;

          case 'tips_reminder':
            renderedHtml = await render(
              TipsReminder({
                managerName,
                managerEmail,
                slug,
                currentTipsCount: 2,
                daysSinceCreation,
              })
            );
            break;

          default:
            renderedHtml = '<p>Template non reconnu</p>';
        }

        setHtml(renderedHtml);
      } catch (error) {
        console.error('[EMAIL PREVIEW] Error rendering template:', error);
        setHtml('<p style="color: red;">Erreur lors du rendu du template</p>');
      } finally {
        setLoading(false);
      }
    }

    renderTemplate();
  }, [open, templateType]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Aperçu du Template
              </DialogTitle>
              <DialogDescription className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{getTemplateLabel(templateType)}</Badge>
                  <span className="text-sm text-gray-600">•</span>
                  <span className="text-sm text-gray-600">Données d'exemple utilisées</span>
                </div>
                <div className="text-sm text-gray-700">
                  <strong>Sujet :</strong> {subject}
                </div>
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="ml-4 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600">Génération de l'aperçu...</p>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <iframe
                srcDoc={html}
                className="w-full border-0"
                style={{
                  height: '600px',
                  backgroundColor: 'white',
                }}
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            <p>
              Cet aperçu utilise des données fictives pour la démonstration.
            </p>
            <p className="mt-1">
              L'email réel sera personnalisé pour chaque destinataire.
            </p>
          </div>
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
