'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AdminHeaderProps {
  adminEmail: string
}

export default function AdminHeader({ adminEmail }: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo + Titre */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/admin" className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl">🛡️</span>
              <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
                WelcomeApp <span className="text-blue-600 dark:text-blue-400">Admin</span>
              </h1>
            </Link>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link
              href="/admin"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Vue d&apos;ensemble
            </Link>
            <Link
              href="/admin/managers"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Gestionnaires
            </Link>
            <Link
              href="/admin/analytics"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Analytics
            </Link>
          </nav>

          {/* User info Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium truncate max-w-[150px] inline-block">
                {adminEmail}
              </span>
              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                Modérateur
              </span>
            </div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
            >
              Retour
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/admin"
              className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Vue d&apos;ensemble
            </Link>
            <Link
              href="/admin/managers"
              className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gestionnaires
            </Link>
            <Link
              href="/admin/analytics"
              className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Analytics
            </Link>
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span className="font-medium block truncate">{adminEmail}</span>
                <span className="inline-block mt-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                  Modérateur
                </span>
              </div>
              <Link
                href="/dashboard"
                className="block text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Retour au dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
