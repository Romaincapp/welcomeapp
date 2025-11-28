'use client'

import { ReactNode } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminSidebar } from './AdminSidebar'

export interface AdminLayoutProps {
  children: ReactNode
  adminEmail: string
  pendingCreditsCount?: number
}

export function AdminLayout({
  children,
  adminEmail,
  pendingCreditsCount = 0,
}: AdminLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AdminSidebar
        adminEmail={adminEmail}
        pendingCreditsCount={pendingCreditsCount}
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
  )
}
