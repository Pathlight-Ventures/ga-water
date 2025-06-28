"use client"

import { Button } from '@/components/ui/button'
import { 
  Search, 
  BarChart3, 
  MapPin, 
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  Clock
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import Link from 'next/link'
import { HelpGuide } from './help-guide'

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, isAdmin, isApproved, profile, signOut } = useAuth()

  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: Search },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Map', href: '/map', icon: MapPin },
    // Settings and Admin are conditionally added below
  ]

  // Add Settings to navigation items only if user is authenticated and approved
  if (isAuthenticated && isApproved) {
    navigationItems.push({ name: 'Settings', href: '/settings', icon: Settings })
  }

  // Add Admin to navigation items only if user is admin
  if (isAdmin) {
    navigationItems.push({ name: 'Admin', href: '/admin', icon: Shield })
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="inline-block w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                <span className="w-4 h-4 bg-orange-400 rounded-full block"></span>
              </span>
              <span className="font-bold text-xl text-gray-900 tracking-tight">Georgia Public Water Systems</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  className="flex items-center gap-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  asChild
                >
                  <Link href={item.href} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                </Button>
              )
            })}
            <HelpGuide />
            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-4">
                <div className="text-right">
                  <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
                  {profile && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {profile.role && (
                        <span className="capitalize">{profile.role}</span>
                      )}
                      {!isApproved && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Clock className="w-3 h-3" />
                            Pending Approval
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={signOut}
                  className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600 ml-4" asChild>
                <Link href="/auth/login">Partner Login</Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={signOut}
                className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            ) : (
              <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600" asChild>
                <Link href="/auth/login">Partner Login</Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  className="w-full justify-start flex items-center gap-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  asChild
                >
                  <Link href={item.href} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                </Button>
              )
            })}
            <div className="px-3 py-2">
              <HelpGuide />
            </div>
            {isAuthenticated && (
              <div className="px-3 py-2 border-t border-gray-200 mt-2">
                <p className="text-sm text-gray-600 mb-1">Welcome, {user?.email}</p>
                {profile && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    {profile.role && (
                      <span className="capitalize">{profile.role}</span>
                    )}
                    {!isApproved && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Clock className="w-3 h-3" />
                          Pending Approval
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
} 