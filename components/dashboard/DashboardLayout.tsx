'use client'

import { ReactNode } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardProvider } from './DashboardProvider'
import type { Client } from '@/types'

export interface DashboardLayoutProps {
  children: ReactNode
  client: Client
  allWelcomebooks: WelcomebookSummary[]
  isAdmin?: boolean
  pendingSharesCount?: number
}

export interface WelcomebookSummary {
  id: string
  name: string
  slug: string
  welcomebook_name: string | null
  totalViews: number
  totalTips: number
}

export function DashboardLayout({
  children,
  client,
  allWelcomebooks,
  isAdmin = false,
  pendingSharesCount = 0,
}: DashboardLayoutProps) {
  return (
    <DashboardProvider client={client}>
      <SidebarProvider defaultOpen={true}>
        <DashboardSidebar
          client={client}
          allWelcomebooks={allWelcomebooks}
          isAdmin={isAdmin}
          pendingSharesCount={pendingSharesCount}
        />
        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b bg-background px-4 lg:px-6">
            <SidebarTrigger className="-ml-2" />
            <div className="flex-1" />
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </DashboardProvider>
  )
}
