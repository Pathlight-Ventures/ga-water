"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield,
  User,
  Building2,
  CheckCircle,
  XCircle,
  Lock
} from 'lucide-react'

interface Role {
  id: string
  name: string
  type: 'agency' | 'water_facility'
  description: string
  permissions: string[]
  userCount: number
}

interface Permission {
  id: string
  name: string
  category: string
  description: string
}

const agencyRoles: Role[] = [
  {
    id: 'manager',
    name: 'Manager',
    type: 'agency',
    description: 'Full system access and management capabilities',
    permissions: [
      'view_dashboard',
      'view_all_reports',
      'manage_users',
      'manage_facilities',
      'configure_mcls',
      'view_audit_trail',
      'export_data',
      'manage_notifications'
    ],
    userCount: 1
  },
  {
    id: 'inspector',
    name: 'Inspector',
    type: 'agency',
    description: 'Inspection and compliance monitoring access',
    permissions: [
      'view_dashboard',
      'view_assigned_reports',
      'create_violations',
      'view_compliance',
      'send_notifications',
      'view_documents',
      'approve_reports'
    ],
    userCount: 3
  },
  {
    id: 'engineer',
    name: 'Engineer',
    type: 'agency',
    description: 'Read-only access for review and analysis',
    permissions: [
      'view_dashboard',
      'view_all_reports',
      'view_compliance',
      'view_documents',
      'view_analytics'
    ],
    userCount: 9
  },
  {
    id: 'system_admin',
    name: 'System Administrator',
    type: 'agency',
    description: 'System configuration and user management',
    permissions: [
      'view_dashboard',
      'manage_users',
      'manage_roles',
      'configure_system',
      'view_audit_trail',
      'manage_backups',
      'view_logs'
    ],
    userCount: 1
  }
]

const waterFacilityRoles: Role[] = [
  {
    id: 'operator',
    name: 'Operator',
    type: 'water_facility',
    description: 'Daily operational data entry and reporting',
    permissions: [
      'view_own_reports',
      'enter_daily_data',
      'enter_monthly_data',
      'view_own_compliance',
      'upload_documents',
      'view_notifications'
    ],
    userCount: 106
  },
  {
    id: 'operator_in_charge',
    name: 'Operator in Responsible Charge (ORC)',
    type: 'water_facility',
    description: 'Full facility access including report submission and approval',
    permissions: [
      'view_own_reports',
      'enter_daily_data',
      'enter_monthly_data',
      'submit_reports',
      'approve_reports',
      'view_own_compliance',
      'upload_documents',
      'view_notifications',
      'manage_facility_users'
    ],
    userCount: 106
  }
]

const allPermissions: Permission[] = [
  { id: 'view_dashboard', name: 'View Dashboard', category: 'General', description: 'Access to agency dashboard' },
  { id: 'view_all_reports', name: 'View All Reports', category: 'Reports', description: 'View reports from all systems' },
  { id: 'view_assigned_reports', name: 'View Assigned Reports', category: 'Reports', description: 'View only assigned reports' },
  { id: 'view_own_reports', name: 'View Own Reports', category: 'Reports', description: 'View reports for own facility' },
  { id: 'enter_daily_data', name: 'Enter Daily Data', category: 'Data Entry', description: 'Enter daily operational data' },
  { id: 'enter_monthly_data', name: 'Enter Monthly Data', category: 'Data Entry', description: 'Enter monthly operational data' },
  { id: 'submit_reports', name: 'Submit Reports', category: 'Reports', description: 'Submit reports for review' },
  { id: 'approve_reports', name: 'Approve Reports', category: 'Reports', description: 'Approve submitted reports' },
  { id: 'manage_users', name: 'Manage Users', category: 'Administration', description: 'Add, edit, and remove users' },
  { id: 'manage_facilities', name: 'Manage Facilities', category: 'Administration', description: 'Manage facility information' },
  { id: 'manage_roles', name: 'Manage Roles', category: 'Administration', description: 'Configure roles and permissions' },
  { id: 'configure_mcls', name: 'Configure MCLs', category: 'Compliance', description: 'Set maximum contaminant levels' },
  { id: 'view_compliance', name: 'View Compliance', category: 'Compliance', description: 'View compliance status' },
  { id: 'view_own_compliance', name: 'View Own Compliance', category: 'Compliance', description: 'View compliance for own facility' },
  { id: 'create_violations', name: 'Create Violations', category: 'Compliance', description: 'Create violation records' },
  { id: 'view_audit_trail', name: 'View Audit Trail', category: 'Administration', description: 'Access audit trail logs' },
  { id: 'export_data', name: 'Export Data', category: 'Data', description: 'Export data to external systems' },
  { id: 'manage_notifications', name: 'Manage Notifications', category: 'Communication', description: 'Send and manage notifications' },
  { id: 'view_notifications', name: 'View Notifications', category: 'Communication', description: 'View notifications' },
  { id: 'view_documents', name: 'View Documents', category: 'Documents', description: 'View uploaded documents' },
  { id: 'upload_documents', name: 'Upload Documents', category: 'Documents', description: 'Upload facility documents' },
  { id: 'view_analytics', name: 'View Analytics', category: 'Analytics', description: 'Access analytics and reports' },
  { id: 'configure_system', name: 'Configure System', category: 'Administration', description: 'System configuration access' },
  { id: 'manage_backups', name: 'Manage Backups', category: 'Administration', description: 'Backup management' },
  { id: 'view_logs', name: 'View Logs', category: 'Administration', description: 'View system logs' },
  { id: 'manage_facility_users', name: 'Manage Facility Users', category: 'Administration', description: 'Manage users for own facility' }
]

export default function RolesPage() {
  const [selectedRoleType, setSelectedRoleType] = useState<'agency' | 'water_facility'>('agency')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false)

  const currentRoles = selectedRoleType === 'agency' ? agencyRoles : waterFacilityRoles
  const allRoles = agencyRoles.concat(waterFacilityRoles)

  const permissionMatrix = () => {
    const matrix: Record<string, Record<string, boolean>> = {}
    const allRoles = agencyRoles.concat(waterFacilityRoles)
    
    allRoles.forEach(role => {
      allPermissions.forEach(permission => {
        if (!matrix[permission.id]) {
          matrix[permission.id] = {}
        }
        matrix[permission.id][role.id] = role.permissions.includes(permission.id)
      })
    })
    
    return matrix
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Role-Based Security</h1>
          <p className="text-gray-600">
            Manage security roles and permissions for agency and water facility users
          </p>
        </div>

        {/* Role Type Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 border-b">
            <button
              onClick={() => {
                setSelectedRoleType('agency')
                setSelectedRole(null)
              }}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                selectedRoleType === 'agency'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Agency Roles (14 users)
            </button>
            <button
              onClick={() => {
                setSelectedRoleType('water_facility')
                setSelectedRole(null)
              }}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                selectedRoleType === 'water_facility'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-4 h-4 inline mr-2" />
              Water Facility Roles (212 users)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedRoleType === 'agency' ? 'Agency Roles' : 'Water Facility Roles'}
                </CardTitle>
                <CardDescription>
                  {selectedRoleType === 'agency' 
                    ? '14 agency users with different access levels'
                    : '212 water system users (2 per facility)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentRoles.map(role => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedRole?.id === role.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{role.name}</h4>
                        <Badge variant="secondary">{role.userCount}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{role.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Lock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {role.permissions.length} permissions
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Role Details */}
          <div className="lg:col-span-2">
            {selectedRole ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedRole.name}</CardTitle>
                      <CardDescription>{selectedRole.description}</CardDescription>
                    </div>
                    <Badge className={
                      selectedRole.type === 'agency' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }>
                      {selectedRole.type === 'agency' ? 'Agency' : 'Water Facility'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-4">Permissions</h4>
                      <div className="space-y-3">
                        {Object.entries(
                          selectedRole.permissions.reduce((acc, permId) => {
                            const permission = allPermissions.find(p => p.id === permId)
                            if (permission) {
                              const category = permission.category
                              if (!acc[category]) acc[category] = []
                              acc[category].push(permission)
                            }
                            return acc
                          }, {} as Record<string, Permission[]>)
                        ).map(([category, permissions]) => (
                          <div key={category}>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">{category}</h5>
                            <div className="space-y-2">
                              {permissions.map(permission => (
                                <div
                                  key={permission.id}
                                  className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{permission.name}</p>
                                    <p className="text-xs text-gray-500">{permission.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Users with this role</p>
                          <p className="text-2xl font-bold">{selectedRole.userCount}</p>
                        </div>
                        <Button variant="outline">
                          <User className="w-4 h-4 mr-2" />
                          View Users
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Select a role to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Permission Matrix */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Permission Matrix</CardTitle>
                <CardDescription>
                  Complete view of all permissions across all roles
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPermissionMatrix(!showPermissionMatrix)}
              >
                {showPermissionMatrix ? 'Hide' : 'Show'} Matrix
              </Button>
            </div>
          </CardHeader>
          {showPermissionMatrix && (
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Permission</th>
                      {allRoles.map(role => (
                        <th key={role.id} className="text-center p-2 min-w-[100px]">
                          {role.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(
                      allPermissions.reduce((acc, perm) => {
                        const category = perm.category
                        if (!acc[category]) acc[category] = []
                        acc[category].push(perm)
                        return acc
                      }, {} as Record<string, Permission[]>)
                    ).map(([category, permissions]) => (
                      <React.Fragment key={category}>
                        <tr className="bg-gray-50">
                          <td colSpan={allRoles.length + 1} className="p-2 font-semibold">
                            {category}
                          </td>
                        </tr>
                        {permissions.map(permission => {
                          const matrix = permissionMatrix()
                          return (
                            <tr key={permission.id} className="border-b hover:bg-gray-50">
                              <td className="p-2">
                                <div>
                                  <p className="font-medium">{permission.name}</p>
                                  <p className="text-xs text-gray-500">{permission.description}</p>
                                </div>
                              </td>
                              {allRoles.map(role => (
                                <td key={role.id} className="text-center p-2">
                                  {matrix[permission.id]?.[role.id] ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                                  ) : (
                                    <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                                  )}
                                </td>
                              ))}
                            </tr>
                          )
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </main>
  )
}

