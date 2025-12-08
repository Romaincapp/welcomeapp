'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Send,
  Mail,
  Sparkles,
  Palette,
  BarChart3,
  Share2,
  Shield,
  Zap,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Wand2,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { AppFeature } from '@/lib/data/app-features';

interface FeaturesAdminClientProps {
  features: AppFeature[];
  error?: string;
}

type Segment = 'all' | 'Inactif' | 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';

const CATEGORY_INFO = {
  core: { label: 'Fonctions principales', icon: Sparkles, color: 'text-purple-600' },
  customization: { label: 'Personnalisation', icon: Palette, color: 'text-pink-600' },
  analytics: { label: 'Analytics', icon: BarChart3, color: 'text-blue-600' },
  sharing: { label: 'Partage', icon: Share2, color: 'text-green-600' },
  security: { label: 'Sécurité', icon: Shield, color: 'text-orange-600' },
  productivity: { label: 'Productivité', icon: Zap, color: 'text-yellow-600' },
};

export default function FeaturesAdminClient({ features, error }: FeaturesAdminClientProps) {
  // États pour la sélection
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // États pour le modal d'envoi
  const [showSendModal, setShowSendModal] = useState(false);
  const [segment, setSegment] = useState<Segment>('all');
  const [testMode, setTestMode] = useState(true);
  const [customSubject, setCustomSubject] = useState('');
  const [customIntro, setCustomIntro] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isGeneratingIntro, setIsGeneratingIntro] = useState(false);

  // États pour l'aperçu email
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Filtrer les features
  const filteredFeatures = features.filter((feature) => {
    if (filterCategory === 'all') return true;
    return feature.category === filterCategory;
  });

  // Grouper par catégorie pour l'affichage
  const groupedFeatures = filteredFeatures.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, AppFeature[]>);

  // Toggle sélection
  const toggleFeature = (id: string) => {
    const newSelected = new Set(selectedFeatures);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedFeatures(newSelected);
  };

  // Obtenir les features sélectionnées
  const getSelectedFeaturesData = () => {
    return features.filter((f) => selectedFeatures.has(f.id));
  };

  // Générer le sujet par défaut
  const getDefaultSubject = () => {
    const selected = getSelectedFeaturesData();
    if (selected.length === 0) return '';
    if (selected.length === 1) {
      return `${selected[0].emoji} Découvrez : ${selected[0].title}`;
    }
    return `🚀 ${selected.length} fonctionnalités à découvrir sur WelcomeApp !`;
  };

  // Générer l'intro avec IA
  const handleGenerateIntro = async () => {
    if (selectedFeatures.size === 0) return;

    setIsGeneratingIntro(true);
    try {
      const selected = getSelectedFeaturesData();
      const response = await fetch('/api/admin/generate-intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: selected.map((f) => ({
            title: f.title,
            description: f.description,
            emoji: f.emoji,
          })),
          segment,
        }),
      });

      const data = await response.json();

      if (response.ok && data.intro) {
        setCustomIntro(data.intro);
      } else {
        console.error('Erreur génération intro:', data.error);
      }
    } catch (err) {
      console.error('Erreur réseau génération intro:', err);
    } finally {
      setIsGeneratingIntro(false);
    }
  };

  // Générer l'aperçu du mail
  const handleGeneratePreview = async () => {
    if (selectedFeatures.size === 0) return;

    setIsGeneratingPreview(true);
    try {
      const selected = getSelectedFeaturesData();
      const response = await fetch('/api/admin/preview-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: selected.map((f) => ({
            title: f.title,
            description: f.description,
            emoji: f.emoji,
          })),
          customIntro: customIntro || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.html) {
        setPreviewHtml(data.html);
        setShowPreview(true);
      } else {
        console.error('Erreur génération aperçu:', data.error);
      }
    } catch (err) {
      console.error('Erreur réseau génération aperçu:', err);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Envoyer la campagne
  const handleSendCampaign = async () => {
    setIsSending(true);
    setSendResult(null);

    try {
      const selected = getSelectedFeaturesData();
      const updates = selected.map((f) => ({
        title: f.title,
        description: f.description,
        emoji: f.emoji,
      }));

      const payload = {
        templateType: 'multiple_updates',
        subject: customSubject || getDefaultSubject(),
        segment,
        testMode,
        updates,
        customIntro: customIntro || undefined,
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
          message: `✅ Campagne envoyée ! ${data.totalSent} emails envoyés, ${data.totalFailed} échecs.`,
        });
        setTimeout(() => {
          setShowSendModal(false);
          setSelectedFeatures(new Set());
          setSendResult(null);
        }, 3000);
      } else {
        setSendResult({
          success: false,
          message: `❌ Erreur: ${data.error || 'Échec de l\'envoi'}`,
        });
      }
    } catch (err) {
      setSendResult({
        success: false,
        message: `❌ Erreur réseau: ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Fonctionnalités WelcomeApp
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Sélectionnez les fonctionnalités à mettre en avant dans vos mailings
          </p>
        </div>
        <Button
          onClick={() => setShowSendModal(true)}
          disabled={selectedFeatures.size === 0}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Send className="h-4 w-4 mr-2" />
          Envoyer ({selectedFeatures.size})
        </Button>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterCategory('all')}
        >
          Toutes ({features.length})
        </Button>
        {Object.entries(CATEGORY_INFO).map(([key, info]) => {
          const count = features.filter((f) => f.category === key).length;
          const Icon = info.icon;
          return (
            <Button
              key={key}
              variant={filterCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory(key)}
              className="gap-1"
            >
              <Icon className={`h-4 w-4 ${filterCategory !== key ? info.color : ''}`} />
              {info.label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Liste des features par catégorie */}
      {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => {
        const info = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO];
        const Icon = info.icon;

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${info.color}`} />
                {info.label}
              </CardTitle>
              <CardDescription>{categoryFeatures.length} fonctionnalité(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categoryFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition
                      ${selectedFeatures.has(feature.id)
                        ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-900/20 dark:border-indigo-700'
                        : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750'
                      }`}
                    onClick={() => toggleFeature(feature.id)}
                  >
                    <Checkbox
                      checked={selectedFeatures.has(feature.id)}
                      onCheckedChange={() => toggleFeature(feature.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{feature.emoji}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {feature.title}
                        </span>
                        {feature.isNew && (
                          <Badge className="bg-green-100 text-green-700 text-xs">Nouveau</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Modal d'envoi */}
      <AlertDialog open={showSendModal} onOpenChange={setShowSendModal}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Envoyer un focus fonctionnalités
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedFeatures.size} fonctionnalité(s) sélectionnée(s)
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-6 py-4">
            {/* Mode Test */}
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-700">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900 dark:text-yellow-200">Mode Test</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    {testMode ? 'Envoyé uniquement à votre email' : 'Sera envoyé à tous les destinataires'}
                  </p>
                </div>
              </div>
              <Switch checked={testMode} onCheckedChange={setTestMode} />
            </div>

            {/* Aperçu */}
            <div>
              <Label className="mb-2 block">Fonctionnalités sélectionnées</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-gray-50 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                {getSelectedFeaturesData().map((feature, index) => (
                  <div key={feature.id} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-lg">{feature.emoji}</span>
                    <span className="text-gray-900 dark:text-white">{feature.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sujet */}
            <div>
              <Label htmlFor="subject">Sujet de l'email (optionnel)</Label>
              <Input
                id="subject"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder={getDefaultSubject()}
                className="mt-1"
              />
            </div>

            {/* Intro */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="intro">Introduction personnalisée (optionnel)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateIntro}
                  disabled={isGeneratingIntro || selectedFeatures.size === 0}
                  className="gap-1 text-xs h-7"
                >
                  {isGeneratingIntro ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-3 w-3" />
                      Générer avec IA
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="intro"
                value={customIntro}
                onChange={(e) => setCustomIntro(e.target.value)}
                placeholder="Texte d'introduction..."
                rows={3}
              />
            </div>

            {/* Segment */}
            <div>
              <Label>Segment cible</Label>
              <Select value={segment} onValueChange={(v) => setSegment(v as Segment)}>
                <SelectTrigger className="mt-1">
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

            {/* Aperçu Email */}
            <div className="border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  if (!showPreview && !previewHtml) {
                    handleGeneratePreview();
                  } else {
                    setShowPreview(!showPreview);
                  }
                }}
                disabled={isGeneratingPreview || selectedFeatures.size === 0}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Aperçu de l&apos;email
                  </span>
                </div>
                {isGeneratingPreview ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                ) : showPreview ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>

              {showPreview && previewHtml && (
                <div className="border-t">
                  <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Prévisualisation (le nom sera personnalisé)
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleGeneratePreview}
                      disabled={isGeneratingPreview}
                      className="h-6 text-xs"
                    >
                      {isGeneratingPreview ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        'Rafraîchir'
                      )}
                    </Button>
                  </div>
                  <iframe
                    srcDoc={previewHtml}
                    title="Aperçu email"
                    className="w-full h-[400px] bg-white"
                    sandbox="allow-same-origin"
                  />
                </div>
              )}
            </div>

            {/* Résultat */}
            {sendResult && (
              <div
                className={`p-4 rounded-lg flex items-center gap-2 ${
                  sendResult.success
                    ? 'bg-green-50 border border-green-200 text-green-900'
                    : 'bg-red-50 border border-red-200 text-red-900'
                }`}
              >
                {sendResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
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
              disabled={isSending || selectedFeatures.size === 0}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi...
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
    </div>
  );
}
