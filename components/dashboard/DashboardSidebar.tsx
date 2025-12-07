'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  Eye,
  Pencil,
  Share2,
  QrCode,
  Coins,
  History,
  Clock,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  Gauge,
  CreditCard,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { WelcomebookCombobox } from './WelcomebookCombobox'
import { useDashboard } from './DashboardProvider'
import type { Client } from '@/types'
import type { WelcomebookSummary } from './DashboardLayout'

interface DashboardSidebarProps {
  client: Client
  allWelcomebooks: WelcomebookSummary[]
  isAdmin?: boolean
  pendingSharesCount?: number
}

export function DashboardSidebar({
  client,
  allWelcomebooks,
  isAdmin = false,
  pendingSharesCount = 0,
}: DashboardSidebarProps) {
  const { openShareModal } = useDashboard()
  const router = useRouter()
  const supabase = createClient()
  const subdomain = client.subdomain || client.slug

  // Find current welcomebook in allWelcomebooks to get stats
  const currentWelcomebook = allWelcomebooks.find(w => w.id === client.id) || {
    id: client.id,
    name: client.name,
    slug: client.slug,
    welcomebook_name: client.welcomebook_name || null,
    totalViews: 0,
    totalTips: 0,
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <WelcomebookCombobox
          currentWelcomebook={currentWelcomebook}
          allWelcomebooks={allWelcomebooks}
        />
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Accueil">
                  <Link href="/dashboard">
                    <Home />
                    <span>Accueil</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Mon App */}
        <SidebarGroup>
          <SidebarGroupLabel>Mon App</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Voir">
                  <Link href={`/${subdomain}`} target="_blank">
                    <Eye />
                    <span>Voir</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Éditer">
                  <Link href={`/${subdomain}`}>
                    <Pencil />
                    <span>Éditer</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Partager"
                  onClick={openShareModal}
                >
                  <Share2 />
                  <span>Partager</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="QR Code">
                  <Link href="/dashboard/qr-designer">
                    <QrCode />
                    <span>QR Code</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Crédits */}
        <SidebarGroup>
          <SidebarGroupLabel>Crédits</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Mon solde">
                  <Link href="/dashboard/credits">
                    <Gauge />
                    <span>Mon solde</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Gagner des crédits">
                  <Link href="/dashboard/credits/earn">
                    <Coins />
                    <span>Gagner</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Acheter des crédits">
                  <Link href="/dashboard/billing">
                    <CreditCard />
                    <span>Acheter</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Historique">
                  <Link href="/dashboard/credits/history">
                    <History />
                    <span>Historique</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="En attente">
                  <Link href="/dashboard/credits/pending">
                    <Clock />
                    <span>En attente</span>
                  </Link>
                </SidebarMenuButton>
                {pendingSharesCount > 0 && (
                  <SidebarMenuBadge className="bg-amber-500 text-white">
                    {pendingSharesCount}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Autres */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Analytics">
                  <Link href="/dashboard/analytics">
                    <BarChart3 />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Paramètres">
                  <Link href="/dashboard/settings">
                    <Settings />
                    <span>Paramètres</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Mode Modérateur">
                <Link href="/admin">
                  <Shield />
                  <span>Mode Modérateur</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Déconnexion"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
            >
              <LogOut />
              <span>Déconnexion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
