'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Palette,
  Lock,
  Share2,
  Trophy,
  Star,
  Zap,
  Crown,
  Target,
  Globe,
  Image as ImageIcon,
  Users,
  ChevronRight,
  PartyPopper
} from 'lucide-react'

interface ChecklistTask {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
  href?: string
  onClick?: () => void
  badge?: string
  badgeColor?: string
}

interface Badge {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  color: string
}

interface ChecklistManagerProps {
  client: {
    id: string
    slug: string
    background_image: string | null
    ad_iframe_url: string | null
  }
  stats: {
    totalTips: number
    totalMedia: number
    totalCategories: number
    hasSecureSection: boolean
    tipsWithTranslations: number
  }
  onOpenShareModal: () => void
}

export default function ChecklistManager({ client, stats, onOpenShareModal }: ChecklistManagerProps) {
  const [showBadges, setShowBadges] = useState(false)
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<Badge | null>(null)

  // Calcul dynamique des tâches et badges
  const beginnerTasks: ChecklistTask[] = [
    {
      id: 'add_first_tip',
      title: 'Ajoutez votre premier conseil',
      description: 'Utilisez le remplissage intelligent ou ajoutez manuellement un conseil',
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
      completed: stats.totalTips >= 1,
      href: `/${client.slug}`,
      badge: stats.totalTips === 0 ? 'Recommandé' : undefined,
      badgeColor: 'from-purple-500 to-indigo-600'
    },
    {
      id: 'add_5_tips',
      title: 'Ajoutez 5 conseils',
      description: 'Diversifiez votre contenu avec différents types de conseils',
      icon: <Target className="w-4 h-4 text-blue-600" />,
      completed: stats.totalTips >= 5,
      href: `/${client.slug}`
    },
    {
      id: 'customize_design',
      title: 'Personnalisez le design',
      description: 'Changez les couleurs et l\'arrière-plan pour refléter votre image',
      icon: <Palette className="w-4 h-4 text-pink-600" />,
      completed: !!client.background_image,
      href: `/${client.slug}`
    },
    {
      id: 'add_secure_section',
      title: 'Configurez la section sécurisée',
      description: 'Ajoutez WiFi, instructions d\'arrivée et informations sensibles',
      icon: <Lock className="w-4 h-4 text-green-600" />,
      completed: stats.hasSecureSection,
      href: `/${client.slug}`
    },
    {
      id: 'share_app',
      title: 'Partagez avec vos clients',
      description: 'Récupérez le lien et le QR code pour vos voyageurs',
      icon: <Share2 className="w-4 h-4 text-orange-600" />,
      completed: false, // On ne peut pas vraiment tracker ça
      onClick: onOpenShareModal
    }
  ]

  const intermediateTasks: ChecklistTask[] = [
    {
      id: 'add_10_tips',
      title: 'Atteignez 10 conseils',
      description: 'Continuez à enrichir votre guide pour offrir plus de choix',
      icon: <Star className="w-4 h-4 text-yellow-600" />,
      completed: stats.totalTips >= 10,
      href: `/${client.slug}`
    },
    {
      id: 'add_photos',
      title: 'Ajoutez des photos de qualité',
      description: 'Au moins 5 photos pour rendre votre guide visuellement attractif',
      icon: <ImageIcon className="w-4 h-4 text-blue-600" />,
      completed: stats.totalMedia >= 5,
      href: `/${client.slug}`
    },
    {
      id: 'add_categories',
      title: 'Utilisez 3 catégories différentes',
      description: 'Diversifiez votre contenu (restaurants, activités, nature, etc.)',
      icon: <Zap className="w-4 h-4 text-purple-600" />,
      completed: stats.totalCategories >= 3,
      href: `/${client.slug}`
    },
    {
      id: 'add_translations',
      title: 'Ajoutez des traductions',
      description: 'Rendez votre guide accessible à plus de voyageurs',
      icon: <Globe className="w-4 h-4 text-green-600" />,
      completed: stats.tipsWithTranslations >= 3,
      href: `/${client.slug}`
    }
  ]

  const expertTasks: ChecklistTask[] = [
    {
      id: 'add_25_tips',
      title: 'Atteignez 25 conseils',
      description: 'Devenez un expert en offrant un guide ultra-complet',
      icon: <Crown className="w-4 h-4 text-yellow-600" />,
      completed: stats.totalTips >= 25,
      href: `/${client.slug}`
    },
    {
      id: 'add_monetization',
      title: 'Monétisez votre guide',
      description: 'Ajoutez un lien publicitaire pour générer des revenus',
      icon: <Trophy className="w-4 h-4 text-green-600" />,
      completed: !!client.ad_iframe_url,
      href: `/${client.slug}`
    },
    {
      id: 'complete_translations',
      title: 'Traduisez tout votre contenu',
      description: 'Rendez votre guide multilingue pour une expérience internationale',
      icon: <Globe className="w-4 h-4 text-blue-600" />,
      completed: stats.tipsWithTranslations >= stats.totalTips && stats.totalTips > 0,
      href: `/${client.slug}`
    }
  ]

  // Système de badges
  const badges: Badge[] = [
    {
      id: 'first_step',
      title: '🎯 Premier Pas',
      description: 'Ajouté votre premier conseil',
      icon: <Sparkles className="w-6 h-6" />,
      unlocked: stats.totalTips >= 1,
      color: 'from-purple-500 to-indigo-600'
    },
    {
      id: 'designer',
      title: '🎨 Designer',
      description: 'Personnalisé votre arrière-plan',
      icon: <Palette className="w-6 h-6" />,
      unlocked: !!client.background_image,
      color: 'from-pink-500 to-rose-600'
    },
    {
      id: 'storyteller',
      title: '📚 Conteur',
      description: 'Ajouté 10 conseils',
      icon: <Star className="w-6 h-6" />,
      unlocked: stats.totalTips >= 10,
      color: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'secure',
      title: '🔒 Sécurité',
      description: 'Configuré la section sécurisée',
      icon: <Lock className="w-6 h-6" />,
      unlocked: stats.hasSecureSection,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'expert',
      title: '🏆 Expert',
      description: 'Ajouté 25 conseils',
      icon: <Crown className="w-6 h-6" />,
      unlocked: stats.totalTips >= 25,
      color: 'from-yellow-500 to-amber-600'
    },
    {
      id: 'multilingual',
      title: '🌍 Multilingue',
      description: 'Ajouté des traductions',
      icon: <Globe className="w-6 h-6" />,
      unlocked: stats.tipsWithTranslations >= 3,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'photographer',
      title: '📸 Photographe',
      description: 'Ajouté 10 photos',
      icon: <ImageIcon className="w-6 h-6" />,
      unlocked: stats.totalMedia >= 10,
      color: 'from-indigo-500 to-purple-600'
    }
  ]

  // Déterminer quelle checklist afficher
  const beginnerCompleted = beginnerTasks.filter(t => t.completed).length
  const beginnerTotal = beginnerTasks.length
  const intermediateCompleted = intermediateTasks.filter(t => t.completed).length
  const expertCompleted = expertTasks.filter(t => t.completed).length

  let currentLevel = 'beginner'
  let currentTasks = beginnerTasks
  let levelTitle = '🌱 Débutant'
  let levelDescription = 'Créez les bases de votre WelcomeApp'
  let progress = (beginnerCompleted / beginnerTotal) * 100

  if (beginnerCompleted === beginnerTotal) {
    currentLevel = 'intermediate'
    currentTasks = intermediateTasks
    levelTitle = '⚡ Intermédiaire'
    levelDescription = 'Optimisez et enrichissez votre guide'
    progress = (intermediateCompleted / intermediateTasks.length) * 100
  }

  if (beginnerCompleted === beginnerTotal && intermediateCompleted === intermediateTasks.length) {
    currentLevel = 'expert'
    currentTasks = expertTasks
    levelTitle = '👑 Expert'
    levelDescription = 'Maîtrisez toutes les fonctionnalités avancées'
    progress = (expertCompleted / expertTasks.length) * 100
  }

  const completedTasks = currentTasks.filter(t => t.completed).length
  const totalTasks = currentTasks.length
  const unlockedBadges = badges.filter(b => b.unlocked)

  // Masquer la checklist si tout est terminé
  if (currentLevel === 'expert' && expertCompleted === expertTasks.length) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-8 mb-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
          <Crown className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Félicitations, Maître WelcomeApp ! 🎉
        </h2>
        <p className="text-gray-700 text-lg mb-4">
          Vous avez débloqué toutes les fonctionnalités et maîtrisez parfaitement votre guide.
        </p>
        <div className="flex items-center justify-center gap-2 mb-6">
          {unlockedBadges.map((badge, index) => (
            <div
              key={badge.id}
              className={`p-3 bg-gradient-to-br ${badge.color} rounded-lg text-white shadow-lg transform hover:scale-110 transition`}
              title={badge.description}
            >
              {badge.icon}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-700">
          Continuez à tenir votre guide à jour et à ravir vos voyageurs !
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6 mb-8">
      {/* Header avec badges */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{levelTitle} - {completedTasks}/{totalTasks} complété{completedTasks > 1 ? 's' : ''}</h2>
              <p className="text-sm text-gray-700">{levelDescription}</p>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white drop-shadow">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>

        {/* Badges débloqués */}
        {unlockedBadges.length > 0 && (
          <button
            onClick={() => setShowBadges(!showBadges)}
            className="ml-4 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition shadow-lg"
          >
            <Trophy className="w-5 h-5" />
            <span className="font-bold">{unlockedBadges.length}</span>
          </button>
        )}
      </div>

      {/* Badges débloqués (dépliable) */}
      {showBadges && unlockedBadges.length > 0 && (
        <div className="mb-6 p-4 bg-white rounded-lg border-2 border-yellow-300">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Vos badges débloqués
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {unlockedBadges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 bg-gradient-to-br ${badge.color} rounded-lg text-white text-center shadow-lg transform hover:scale-105 transition`}
              >
                <div className="flex justify-center mb-2">{badge.icon}</div>
                <h4 className="font-bold text-sm mb-1">{badge.title}</h4>
                <p className="text-xs opacity-90">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des tâches */}
      <div className="space-y-3">
        {currentTasks.map((task) => {
          const TaskWrapper = task.href ? Link : task.onClick ? 'button' : 'div'
          const wrapperProps: any = task.href
            ? { href: task.href }
            : task.onClick
            ? { onClick: task.onClick, type: 'button' }
            : {}

          return (
            <TaskWrapper
              key={task.id}
              {...wrapperProps}
              className={`flex items-start gap-3 p-4 bg-white rounded-lg transition group border-2 ${
                task.completed
                  ? 'border-green-200 bg-green-50/50'
                  : 'border-transparent hover:border-indigo-300 hover:shadow-md'
              } ${task.onClick || task.href ? 'cursor-pointer' : ''} w-full text-left`}
            >
              {task.completed ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5 group-hover:text-indigo-600" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                  {task.icon}
                  <span className={task.completed ? 'line-through text-gray-600' : ''}>{task.title}</span>
                  {task.badge && !task.completed && (
                    <span className={`text-xs bg-gradient-to-r ${task.badgeColor} text-white px-2 py-0.5 rounded-full`}>
                      {task.badge}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-700 mt-1">{task.description}</p>
              </div>
              {!task.completed && (task.href || task.onClick) && (
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 flex-shrink-0 mt-0.5" />
              )}
            </TaskWrapper>
          )
        })}
      </div>

      {/* Message de motivation si proche de terminer */}
      {completedTasks > 0 && completedTasks < totalTasks && (
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg text-white text-center">
          <p className="text-sm font-medium">
            🔥 Plus que {totalTasks - completedTasks} tâche{totalTasks - completedTasks > 1 ? 's' : ''} pour passer au niveau suivant !
          </p>
        </div>
      )}

      {/* Celebration niveau complété */}
      {completedTasks === totalTasks && currentLevel !== 'expert' && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg text-white text-center">
          <PartyPopper className="w-8 h-8 mx-auto mb-2" />
          <p className="font-bold text-lg mb-1">Niveau {currentLevel === 'beginner' ? 'Débutant' : 'Intermédiaire'} terminé ! 🎉</p>
          <p className="text-sm">Félicitations ! Vous passez au niveau supérieur.</p>
        </div>
      )}
    </div>
  )
}
