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
  BookOpen,
  Image as ImageIcon,
  Folder,
  Home
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ShareWelcomeBookModal from '@/components/ShareWelcomeBookModal'

interface DashboardClientProps {
  client: {
    id: string
    name: string
    slug: string
    subdomain: string | null
    email: string
    header_color: string
    footer_color: string
    background_image: string | null
    created_at: string
  }
  user: User
  stats: {
    totalTips: number
    totalMedia: number
    totalCategories: number
  }
}

export default function DashboardClient({ client, user, stats }: DashboardClientProps) {
  const [showShareModal, setShowShareModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
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
                WelcomeBook
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-800">Dashboard</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
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
            Gérez votre WelcomeBook et partagez-le avec vos clients
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href={`/${subdomain}`}
            className="bg-white p-6 rounded-xl shadow-sm border-2 border-transparent hover:border-indigo-500 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition">
                <ExternalLink className="text-indigo-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Voir mon WelcomeBook</h3>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-800 font-medium">Conseils</h3>
              <BookOpen className="text-indigo-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalTips}</p>
            <p className="text-sm text-gray-700 mt-1">Total de conseils</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-800 font-medium">Photos</h3>
              <ImageIcon className="text-green-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalMedia}</p>
            <p className="text-sm text-gray-700 mt-1">Total de médias</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-800 font-medium">Catégories</h3>
              <Folder className="text-purple-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalCategories}</p>
            <p className="text-sm text-gray-700 mt-1">Catégories utilisées</p>
          </div>
        </div>

        {/* WelcomeBook Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Informations de votre WelcomeBook
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Nom du WelcomeBook
              </label>
              <p className="text-gray-900 font-semibold">{client.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Sous-domaine
              </label>
              <p className="text-gray-900 font-mono font-semibold">
                {subdomain}.welcomebook.be
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                URL locale (dev)
              </label>
              <a
                href={`http://localhost:3001/${subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline font-mono text-sm"
              >
                localhost:3001/{subdomain}
              </a>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Créé le
              </label>
              <p className="text-gray-900">
                {new Date(client.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Guide rapide */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">🚀 Comment utiliser votre WelcomeBook ?</h2>
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
      </main>

      {/* Share Modal */}
      <ShareWelcomeBookModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        subdomain={subdomain}
        clientName={client.name}
      />
    </div>
  )
}
