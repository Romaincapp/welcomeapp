'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ExternalLink,
  Share2,
  Edit,
  BarChart3,
  LogOut,
  Settings,
  Sparkles,
  CheckCircle2,
  Circle,
  Palette,
  Lock,
  Copy,
  Pencil,
  Check,
  QrCode,
  Shield,
  Eye,
  MousePointer,
  Download
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Client } from '@/types'
import type { ManagerAnalyticsSummary } from '@/lib/actions/manager-analytics'
import ShareWelcomeBookModal from '@/components/ShareWelcomeBookModal'
import DangerZone from '@/components/DangerZone'
import ChecklistManager from '@/components/ChecklistManager'
import AICommentsBanner from '@/components/AICommentsBanner'
import EditSlugModal from '@/components/EditSlugModal'
import QRCodeDesignerModal from '@/components/QRCodeDesignerModal'

interface DashboardClientProps {
  client: Client
  user: User
  stats: {
    totalTips: number
    totalMedia: number
    totalCategories: number
    hasSecureSection: boolean
    analytics: ManagerAnalyticsSummary
  }
  isAdmin?: boolean
}

export default function DashboardClient({ client, user, stats, isAdmin = false }: DashboardClientProps) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [showEditSlugModal, setShowEditSlugModal] = useState(false)
  const [showQRDesignerModal, setShowQRDesignerModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleCopyUrl = () => {
    const url = `https://welcomeapp.be/${subdomain}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const subdomain = client.subdomain || client.slug

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                WelcomeApp
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-800">Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition border border-blue-200"
                  title="Mode Modérateur"
                >
                  <Shield size={18} />
                  <span className="hidden sm:inline font-medium">Mode Modérateur</span>
                </Link>
              )}
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                title="Paramètres"
              >
                <Settings size={18} />
                <span className="hidden sm:inline">Paramètres</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Déconnexion"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue, {user.email?.split('@')[0]} 👋
          </h1>
          <p className="text-gray-800">
            Gérez votre WelcomeApp et partagez-le avec vos clients
          </p>
        </div>

        {/* Banner IA pour générer les commentaires manquants */}
        <AICommentsBanner clientId={client.id} clientSlug={subdomain} />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href={`/${subdomain}`}
            className="bg-white p-6 rounded-xl shadow-sm border-2 border-transparent hover:border-indigo-500 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition">
                <ExternalLink className="text-indigo-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Voir mon WelcomeApp</h3>
                <p className="text-sm text-gray-700">Prévisualiser</p>
              </div>
            </div>
          </Link>

          <button
            onClick={() => setShowShareModal(true)}
            className="bg-white p-6 rounded-xl shadow-sm border-2 border-transparent hover:border-indigo-500 hover:shadow-md transition group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition">
                <Share2 className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Partager</h3>
                <p className="text-sm text-gray-700">Lien & QR Code</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowQRDesignerModal(true)}
            className="bg-white p-6 rounded-xl shadow-sm border-2 border-transparent hover:border-indigo-500 hover:shadow-md transition group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition">
                <QrCode className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">QR Code imprimable</h3>
                <p className="text-sm text-gray-700">Format A4 pro</p>
              </div>
            </div>
          </button>

          <Link
            href={`/${subdomain}`}
            className="bg-white p-6 rounded-xl shadow-sm border-2 border-transparent hover:border-indigo-500 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                <Edit className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Éditer</h3>
                <p className="text-sm text-gray-700">Mode édition</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Analytics Preview Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Aperçu Analytics</h2>
            <Link
              href="/dashboard/analytics"
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition group"
            >
              <span className="text-sm font-medium">Voir tout</span>
              <BarChart3 size={18} className="group-hover:translate-x-1 transition" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Lien vers Analytics */}
            <Link
              href="/dashboard/analytics"
              className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-md hover:shadow-lg transition text-white group"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={20} />
                  <h3 className="text-base font-semibold">Dashboard Analytics</h3>
                </div>
                <p className="text-indigo-100 text-xs mb-3 flex-1">
                  Visualisez l'évolution avec des graphiques
                </p>
                <div className="inline-flex items-center gap-2 bg-white/20 px-2.5 py-1 rounded-lg text-xs w-fit">
                  <Sparkles size={14} />
                  Nouvelles stats
                </div>
              </div>
            </Link>

            {/* Card 2: Quick Stats */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h4 className="text-sm font-medium text-gray-600 mb-4">Stats Rapides</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Total conseils</span>
                  <span className="text-lg font-bold text-indigo-600">{stats.totalTips}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Catégories</span>
                  <span className="text-lg font-bold text-purple-600">{stats.totalCategories}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Photos</span>
                  <span className="text-lg font-bold text-green-600">{stats.totalMedia}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Analytics Visiteurs */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h4 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-indigo-600" />
                Analytics Visiteurs
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 flex items-center gap-1.5">
                    <Eye size={14} className="text-blue-500" />
                    Vues
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {stats.analytics.views}
                    {stats.analytics.views_7d > 0 && (
                      <span className="text-xs font-normal text-green-600 ml-1">
                        +{stats.analytics.views_7d} (7j)
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 flex items-center gap-1.5">
                    <MousePointer size={14} className="text-orange-500" />
                    Clics
                  </span>
                  <span className="text-lg font-bold text-orange-600">
                    {stats.analytics.clicks}
                    {stats.analytics.engagement_rate > 0 && (
                      <span className="text-xs font-normal text-gray-500 ml-1">
                        ({stats.analytics.engagement_rate.toFixed(1)}%)
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 flex items-center gap-1.5">
                    <Share2 size={14} className="text-purple-500" />
                    Partages
                  </span>
                  <span className="text-lg font-bold text-purple-600">{stats.analytics.shares}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 flex items-center gap-1.5">
                    <Download size={14} className="text-green-500" />
                    PWA
                  </span>
                  <span className="text-lg font-bold text-green-600">{stats.analytics.pwa_installs}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Checklist dynamique et gamifiée */}
        <ChecklistManager
          client={{
            id: client.id,
            slug: subdomain,
            background_image: client.background_image,
            ad_iframe_url: null, // TODO: Ajouter ce champ dans l'interface client
            has_shared: client.has_shared
          }}
          stats={stats}
          onOpenShareModal={() => setShowShareModal(true)}
        />

        {/* WelcomeBook Info - Version améliorée */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Informations de votre WelcomeApp
          </h2>

          <div className="space-y-6">
            {/* Nom du WelcomeApp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du WelcomeApp
              </label>
              <p className="text-lg text-gray-900 font-semibold">{client.name}</p>
            </div>

            {/* URL - Section améliorée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                URL de votre WelcomeApp
              </label>

              {/* Badge URL avec actions */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200">
                <div className="flex flex-col gap-4">
                  {/* URL */}
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Lien public :</p>
                    <a
                      href={`https://welcomeapp.be/${subdomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base sm:text-lg font-mono font-bold text-indigo-600 hover:text-indigo-700 hover:underline break-all"
                    >
                      welcomeapp.be/{subdomain}
                    </a>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Bouton Copier */}
                    <button
                      onClick={handleCopyUrl}
                      className="px-2 sm:px-4 py-2 bg-white border-2 border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition flex items-center justify-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm"
                      title="Copier l'URL"
                    >
                      {copied ? (
                        <>
                          <Check size={16} className="sm:w-[18px] sm:h-[18px]" />
                          <span className="hidden sm:inline">Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy size={16} className="sm:w-[18px] sm:h-[18px]" />
                          <span className="hidden sm:inline">Copier</span>
                        </>
                      )}
                    </button>

                    {/* Bouton Modifier */}
                    <button
                      onClick={() => setShowEditSlugModal(true)}
                      className="px-2 sm:px-4 py-2 bg-white border-2 border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition flex items-center justify-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm"
                      title="Modifier l'URL"
                    >
                      <Pencil size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span className="hidden sm:inline">Modifier</span>
                    </button>

                    {/* Bouton Ouvrir */}
                    <a
                      href={`/${subdomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm"
                      title="Ouvrir dans un nouvel onglet"
                    >
                      <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span className="hidden sm:inline">Ouvrir</span>
                    </a>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-2">
                💡 Partagez cette URL avec vos clients pour qu'ils accèdent à votre guide personnalisé
              </p>
            </div>

            {/* Date de création */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Créé le
              </label>
              <p className="text-gray-900">
                {client.created_at
                  ? new Date(client.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Date inconnue'}
              </p>
            </div>
          </div>
        </div>

        {/* Guide rapide */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">🚀 Comment utiliser votre WelcomeApp ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-sm">
                  1
                </span>
                Éditer votre contenu
              </h3>
              <p className="text-indigo-100 text-sm">
                Cliquez sur "Éditer" pour activer le mode édition et ajouter vos conseils,
                photos et informations.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-sm">
                  2
                </span>
                Partager avec vos clients
              </h3>
              <p className="text-indigo-100 text-sm">
                Cliquez sur "Partager" pour obtenir le lien et le QR code à envoyer à vos
                clients par email ou SMS.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-sm">
                  3
                </span>
                Imprimer le QR code
              </h3>
              <p className="text-indigo-100 text-sm">
                Téléchargez le QR code et placez-le dans votre logement pour un accès
                facile à votre guide.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-sm">
                  4
                </span>
                Mettre à jour régulièrement
              </h3>
              <p className="text-indigo-100 text-sm">
                Revenez sur votre dashboard pour ajouter de nouveaux conseils et tenir
                votre guide à jour.
              </p>
            </div>
          </div>
        </div>

        {/* Zone Dangereuse - Séparée du guide rapide */}
        <div className="mt-8">
          <DangerZone clientId={client.id} clientSlug={client.slug} />
        </div>
      </main>

      {/* Share Modal */}
      <ShareWelcomeBookModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        subdomain={subdomain}
        clientName={client.name}
        clientId={client.id}
      />

      {/* Edit Slug Modal */}
      <EditSlugModal
        isOpen={showEditSlugModal}
        onClose={() => setShowEditSlugModal(false)}
        currentSlug={subdomain}
        clientId={client.id}
        clientName={client.name}
      />

      {/* QR Code Designer Modal */}
      {showQRDesignerModal && (
        <QRCodeDesignerModal
          isOpen={showQRDesignerModal}
          onClose={() => setShowQRDesignerModal(false)}
          client={client}
          welcomebookUrl={`https://welcomeapp.be/${subdomain}`}
        />
      )}
    </div>
  )
}
