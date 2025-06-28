"use client"

import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  BarChart3, 
  Map, 
  Settings, 
  User, 
  LogOut, 
  Shield,
  FlaskConical,
  Building2,
  Users,
  Database
} from 'lucide-react'

export function Navigation() {
  const { user, profile, signOut, hasPermission, hasRole } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'epd_staff': return 'default'
      case 'epa_staff': return 'secondary'
      case 'operator': return 'outline'
      case 'laboratory': return 'outline'
      default: return 'outline'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin'
      case 'epd_staff': return 'EPD Staff'
      case 'epa_staff': return 'EPA Staff'
      case 'operator': return 'Operator'
      case 'laboratory': return 'Laboratory'
      default: return 'Public'
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ST</span>
            </div>
            <span className="font-semibold text-lg text-gray-900">
              SpeedTrials 2025
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/search" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </Link>
            
            {hasPermission('view_analytics') && (
              <Link 
                href="/analytics" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </Link>
            )}
            
            <Link 
              href="/map" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Map className="w-4 h-4" />
              <span>Map</span>
            </Link>

            {/* Role-specific navigation items */}
            {hasRole('operator') && (
              <Link 
                href="/operator" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                <span>My System</span>
              </Link>
            )}

            {hasRole('laboratory') && (
              <Link 
                href="/laboratory" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FlaskConical className="w-4 h-4" />
                <span>Lab Data</span>
              </Link>
            )}

            {hasRole('epd_staff') && (
              <Link 
                href="/epd" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>EPD Tools</span>
              </Link>
            )}

            {hasRole('admin') && (
              <Link 
                href="/admin" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Database className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {profile?.full_name || user.email}
                    </span>
                    {profile?.role && (
                      <Badge variant={getRoleBadgeColor(profile.role)} className="text-xs">
                        {getRoleDisplayName(profile.role)}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.email}
                      </p>
                      {profile?.organization && (
                        <p className="text-xs text-gray-500">
                          {profile.organization}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  {hasRole('admin') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/users" className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>Manage Users</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 