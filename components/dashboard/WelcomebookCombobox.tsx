'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronsUpDown, Check, Plus, Home, Eye, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'
import type { WelcomebookSummary } from './DashboardLayout'

interface WelcomebookComboboxProps {
  currentWelcomebook: WelcomebookSummary
  allWelcomebooks: WelcomebookSummary[]
}

export function WelcomebookCombobox({
  currentWelcomebook,
  allWelcomebooks,
}: WelcomebookComboboxProps) {
  const router = useRouter()
  const { isMobile, state } = useSidebar()
  const [open, setOpen] = useState(false)

  const handleSelect = (welcomebook: WelcomebookSummary) => {
    // Set cookie for selected welcomebook
    document.cookie = `selectedWelcomebookId=${welcomebook.id}; path=/; max-age=${60 * 60 * 24 * 365}`
    setOpen(false)
    router.refresh()
  }

  const handleCreateNew = () => {
    setOpen(false)
    router.push('/dashboard/create')
  }

  const displayName = currentWelcomebook.welcomebook_name || currentWelcomebook.name

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Home className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {currentWelcomebook.totalViews} vues · {currentWelcomebook.totalTips} tips
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="start"
            sideOffset={4}
          >
            {allWelcomebooks.map((welcomebook) => {
              const name = welcomebook.welcomebook_name || welcomebook.name
              const isActive = welcomebook.id === currentWelcomebook.id

              return (
                <DropdownMenuItem
                  key={welcomebook.id}
                  onClick={() => handleSelect(welcomebook)}
                  className="gap-2 p-2 cursor-pointer"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border bg-background">
                    <Home className="size-4 shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{name}</span>
                      {isActive && <Check className="size-4 text-indigo-600 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="size-3" />
                        {welcomebook.totalViews}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="size-3" />
                        {welcomebook.totalTips}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleCreateNew}
              className="gap-2 p-2 cursor-pointer"
            >
              <div className="flex size-6 items-center justify-center rounded-md border border-dashed bg-background">
                <Plus className="size-4" />
              </div>
              <span className="font-medium text-muted-foreground">Créer un nouveau welcomebook</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
