"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/contexts/AuthContext'
import { userManagementRepo, type UserProfile, type PendingApproval, type UserRole, type UserStatus } from '@/lib/repository/user-management'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search,
  RefreshCw,
  User
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])
  const [userStats, setUserStats] = useState<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byRole: Record<string, number>;
  } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/settings')
    }
  }, [isAdmin, loading, router])

  useEffect(() => {
    if (isAdmin) {
      loadData()
    }
  }, [isAdmin])

  const loadData = async () => {
    try {
      const [approvals, users, stats] = await Promise.all([
        userManagementRepo.getPendingApprovals(),
        userManagementRepo.getAllUsers(),
        userManagementRepo.getUserStats()
      ])
      
      setPendingApprovals(approvals)
      setAllUsers(users)
      setUserStats(stats)
    } catch (error) {
      console.error('Error loading admin data:', error)
    }
  }

  const handleApprove = async (userId: string) => {
    try {
      if (!user) return
      
      await userManagementRepo.approveUser(userId, user.id)
      await loadData() // Refresh data
    } catch (error) {
      console.error('Error approving user:', error)
    }
  }

  const handleReject = async (userId: string) => {
    try {
      if (!user || !rejectionReason.trim()) return
      
      await userManagementRepo.rejectUser(userId, user.id, rejectionReason)
      setShowRejectModal(false)
      setRejectionReason('')
      setSelectedUser(null)
      await loadData() // Refresh data
    } catch (error) {
      console.error('Error rejecting user:', error)
    }
  }

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = !searchTerm || 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.organization.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || user.status === statusFilter
    const matchesRole = !roleFilter || user.role === roleFilter
    
    return matchesSearch && matchesStatus && matchesRole
  })

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'pending_approval':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'suspended':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Suspended</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRoleBadge = (role: UserRole) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      researcher: 'bg-blue-100 text-blue-800',
      regulator: 'bg-green-100 text-green-800',
      consultant: 'bg-orange-100 text-orange-800',
      public: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <Badge variant="secondary" className={colors[role]}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    )
  }

  if (loading || !isAdmin) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage user accounts and approvals
          </p>
        </div>

        {/* Stats Cards */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                    <p className="text-2xl font-bold text-yellow-600">{userStats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{userStats.approved}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{userStats.rejected}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pending Approvals */}
        {pendingApprovals.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Approvals ({pendingApprovals.length})
              </CardTitle>
              <CardDescription>
                Users awaiting approval to access the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{approval.full_name}</h4>
                        <p className="text-sm text-gray-600">{approval.email}</p>
                        <p className="text-sm text-gray-500">{approval.organization}</p>
                        <div className="flex gap-2 mt-1">
                          {getRoleBadge(approval.role)}
                          <span className="text-xs text-gray-500">
                            {new Date(approval.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(approval.user_id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedUser({
                            id: approval.id,
                            user_id: approval.user_id,
                            email: approval.email,
                            full_name: approval.full_name,
                            organization: approval.organization,
                            role: approval.role,
                            status: 'pending_approval',
                            created_at: approval.created_at,
                            updated_at: approval.created_at
                          })
                          setShowRejectModal(true)
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Users
            </CardTitle>
            <CardDescription>
              Manage all user accounts in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, or organization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={(value: UserStatus | '') => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="pending_approval">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="role-filter">Role</Label>
                <Select value={roleFilter} onValueChange={(value: UserRole | '') => setRoleFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="researcher">Researcher</SelectItem>
                    <SelectItem value="regulator">Regulator</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={loadData} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Users Table */}
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{user.full_name}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">{user.organization}</p>
                      <div className="flex gap-2 mt-1">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                        {user.approved_at && (
                          <span className="text-xs text-gray-500">
                            Approved: {new Date(user.approved_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user.status === 'pending_approval' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleApprove(user.user_id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user)
                            setShowRejectModal(true)
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reject Modal */}
        {showRejectModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Reject User</CardTitle>
                <CardDescription>
                  Are you sure you want to reject {selectedUser.full_name}?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="rejection-reason">Rejection Reason</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Please provide a reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleReject(selectedUser.user_id)}
                    disabled={!rejectionReason.trim()}
                    variant="destructive"
                  >
                    Reject User
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowRejectModal(false)
                      setRejectionReason('')
                      setSelectedUser(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
} 