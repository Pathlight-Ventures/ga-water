"use client"

import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  Clock,
  FileText,
  Bell,
  Database,
  ChevronDown,
  Upload,
  User,
  Activity,
  Building2
} from 'lucide-react'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import Link from 'next/link'
import { HelpGuide } from './help-guide'

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isPartnerToolsOpen, setIsPartnerToolsOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const partnerToolsRef = useRef<HTMLDivElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const isPartnerToolsOpenRef = useRef(false)
  const isProfileMenuOpenRef = useRef(false)
  const { user, isAuthenticated, isAdmin, isApproved, profile, signOut } = useAuth()

  // Ensure component is mounted before rendering auth-dependent UI
  useEffect(() => {
    setMounted(true)
  }, [])

  // Keep refs in sync with state
  useEffect(() => {
    isPartnerToolsOpenRef.current = isPartnerToolsOpen
  }, [isPartnerToolsOpen])

  useEffect(() => {
    isProfileMenuOpenRef.current = isProfileMenuOpen
  }, [isProfileMenuOpen])

  // Close dropdown when clicking outside - attach listener once and use refs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      // Always skip if clicking on links - let them handle navigation
      if (target.closest('a')) {
        return
      }
      
      // Check if click is inside dropdown containers using refs
      const clickedInsidePartnerTools = partnerToolsRef.current?.contains(target)
      const clickedInsideProfileMenu = profileMenuRef.current?.contains(target)
      
      // Use refs to check state without causing dependency issues
      // Only update if dropdown is actually open (avoid unnecessary updates)
      if (isPartnerToolsOpenRef.current && !clickedInsidePartnerTools) {
        setIsPartnerToolsOpen(false)
      }
      if (isProfileMenuOpenRef.current && !clickedInsideProfileMenu) {
        setIsProfileMenuOpen(false)
      }
    }

    // Attach listener once on mount
    document.addEventListener('click', handleClickOutside)
    
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, []) // Empty dependency array - attach once on mount

  // Public navigation items - always visible (memoized to prevent re-renders)
  const publicNavItems = useMemo(() => [
    { name: 'Dashboard', href: '/dashboard', icon: Activity },
    { name: 'Map', href: '/map', icon: MapPin },
    { name: 'Compliance', href: '/compliance', icon: Shield },
    { name: 'Reports', href: '/reports', icon: Database },
  ], [])

  // Partner Tools menu items - only for authenticated users (memoized to prevent re-renders)
  const partnerToolsItems = useMemo(() => [
    { name: 'Data Entry', href: '/data-entry', icon: FileText },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Data Exchange/Uploads', href: '/data-exchange', icon: Upload },
    { name: 'Forms', href: '/forms', icon: FileText },
    { name: 'Register Facility', href: '/facilities/register', icon: Building2 },
    // Add Admin Portal to partner tools if user is admin
    ...(isAdmin ? [{ name: 'Admin Portal', href: '/admin', icon: Shield }] : []),
  ], [isAdmin])

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between items-center h-16 gap-2 overflow-hidden">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0">
              <span className="inline-block w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="w-4 h-4 bg-orange-500 rounded-full block"></span>
              </span>
              <span className="font-bold text-sm sm:text-lg lg:text-xl text-gray-900 tracking-tight truncate">
                <span className="hidden min-[375px]:inline">Georgia Public Water Systems</span>
                <span className="min-[375px]:hidden">GA Water</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Public navigation items */}
            {publicNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link 
                  key={item.name}
                  href={item.href} 
                  className="flex items-center gap-2 justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}

            {/* Partner Tools Dropdown - only for authenticated users */}
            {mounted && isAuthenticated && isApproved && (
              <div className="relative" ref={partnerToolsRef}>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  onClick={() => setIsPartnerToolsOpen(!isPartnerToolsOpen)}
                >
                  Partner Tools
                  <ChevronDown className={`w-4 h-4 transition-transform ${isPartnerToolsOpen ? 'rotate-180' : ''}`} />
                </Button>
                {isPartnerToolsOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    {partnerToolsItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer"
                          onClick={(e) => {
                            // Prevent event from bubbling to click-outside handler
                            e.stopPropagation()
                            // Close dropdown immediately if open
                            if (isPartnerToolsOpen) {
                              setIsPartnerToolsOpen(false)
                            }
                          }}
                        >
                          <Icon className="w-4 h-4" />
                          {item.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <HelpGuide />
            {!mounted ? (
              // Render placeholder during SSR to match client initial render
              <div className="ml-4">
                <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600" asChild>
                  <Link href="/auth/login">Partner Login</Link>
                </Button>
              </div>
            ) : isAuthenticated && isApproved ? (
              <div className="flex items-center gap-2 ml-4">
                {/* Profile Icon Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-full p-2"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  >
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-600" />
                    </div>
                  </Button>
                  {isProfileMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50">
                      {/* Welcome Card */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="text-sm font-semibold text-gray-900">
                          Welcome {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                        </div>
                        {user?.email && (
                          <div className="text-xs text-gray-500 mt-1">{user.email}</div>
                        )}
                        {profile && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            {profile.role && (
                              <span className="capitalize">{profile.role}</span>
                            )}
                            {profile.organization && (
                              <>
                                <span>•</span>
                                <span>{profile.organization}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Notifications Link */}
                      <Link
                        href="/notifications"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer"
                        onClick={(e) => {
                          // Prevent event from bubbling to click-outside handler
                          e.stopPropagation()
                          // Close dropdown immediately if open
                          if (isProfileMenuOpen) {
                            setIsProfileMenuOpen(false)
                          }
                        }}
                      >
                        <Bell className="w-4 h-4" />
                        Notifications
                      </Link>
                      {/* Settings Link */}
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer"
                        onClick={(e) => {
                          // Prevent event from bubbling to click-outside handler
                          e.stopPropagation()
                          // Close dropdown immediately if open
                          if (isProfileMenuOpen) {
                            setIsProfileMenuOpen(false)
                          }
                        }}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      {/* Sign Out */}
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false)
                          signOut()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : isAuthenticated && !isApproved ? (
              <div className="flex items-center gap-2 ml-4">
                <div className="text-right">
                  <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
                  {profile && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {profile.role && (
                        <span className="capitalize">{profile.role}</span>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Clock className="w-3 h-3" />
                        Pending Approval
                      </span>
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
          <div className="md:hidden flex items-center gap-1.5 flex-shrink-0">
            {!mounted ? (
              <Button variant="outline" size="sm" className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600 px-2 sm:px-3" asChild>
                <Link href="/auth/login">
                  <span className="hidden sm:inline">Partner Login</span>
                  <span className="sm:hidden">Login</span>
                </Link>
              </Button>
            ) : isAuthenticated ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={signOut}
                className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600 px-2 sm:px-3"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600 px-2 sm:px-3" asChild>
                <Link href="/auth/login">
                  <span className="hidden sm:inline">Partner Login</span>
                  <span className="sm:hidden">Login</span>
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
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
            {/* Public navigation items */}
            {publicNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 w-full justify-start rounded-md text-sm font-medium px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}

            {/* Partner Tools - only for authenticated users */}
            {mounted && isAuthenticated && isApproved && (
              <>
                <div className="px-3 py-2 border-t border-gray-200 mt-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Partner Tools</div>
                  {partnerToolsItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-3 w-full justify-start rounded-md text-sm font-medium px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 cursor-pointer"
                        onClick={(e) => {
                          // Prevent event from bubbling
                          e.stopPropagation()
                          // Close mobile menu immediately if open
                          if (isMobileMenuOpen) {
                            setIsMobileMenuOpen(false)
                          }
                        }}
                      >
                        <Icon className="w-4 h-4" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </>
            )}

            {/* Profile Section for Mobile - only for authenticated and approved users */}
            {mounted && isAuthenticated && isApproved && (
              <div className="px-3 py-2 border-t border-gray-200 mt-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      Welcome {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                    </div>
                    {user?.email && (
                      <div className="text-xs text-gray-500">{user.email}</div>
                    )}
                  </div>
                </div>
                <Link
                  href="/notifications"
                  className="flex items-center gap-3 w-full justify-start rounded-md text-sm font-medium px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 cursor-pointer"
                  onClick={(e) => {
                    // Prevent event from bubbling
                    e.stopPropagation()
                    // Close mobile menu immediately if open
                    if (isMobileMenuOpen) {
                      setIsMobileMenuOpen(false)
                    }
                  }}
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 w-full justify-start rounded-md text-sm font-medium px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 cursor-pointer"
                  onClick={(e) => {
                    // Prevent event from bubbling
                    e.stopPropagation()
                    // Close mobile menu immediately if open
                    if (isMobileMenuOpen) {
                      setIsMobileMenuOpen(false)
                    }
                  }}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </div>
            )}

            <div className="px-3 py-2">
              <HelpGuide />
            </div>
            {mounted && isAuthenticated && (
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