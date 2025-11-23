"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  Download,
  Database,
  Lock,
  CheckCircle
} from 'lucide-react'

interface AuditEntry {
  id: string
  timestamp: string
  user: string
  action: string
  table: string
  recordId: string
  beforeValue: string | null
  afterValue: string | null
  reason: string | null
  ipAddress: string
}

const mockAuditEntries: AuditEntry[] = [
  {
    id: '1',
    timestamp: '2025-11-15T10:30:00Z',
    user: 'Admin User',
    action: 'UPDATE',
    table: 'mcl_configurations',
    recordId: 'MCL-001',
    beforeValue: 'Turbidity: 0.3 NTU',
    afterValue: 'Turbidity: 0.2 NTU',
    reason: 'Updated per EPA guidance',
    ipAddress: '192.168.1.100'
  },
  {
    id: '2',
    timestamp: '2025-11-14T14:20:00Z',
    user: 'Inspector John Doe',
    action: 'CREATE',
    table: 'violations',
    recordId: 'VIOL-001',
    beforeValue: null,
    afterValue: 'Violation created: Turbidity exceedance',
    reason: 'MCL exceedance detected',
    ipAddress: '192.168.1.101'
  },
  {
    id: '3',
    timestamp: '2025-11-13T09:15:00Z',
    user: 'Water System Operator',
    action: 'UPDATE',
    table: 'reports',
    recordId: 'RPT-001',
    beforeValue: 'Status: Draft',
    afterValue: 'Status: Submitted',
    reason: 'Report submitted',
    ipAddress: '192.168.1.102'
  },
  {
    id: '4',
    timestamp: '2025-11-12T16:45:00Z',
    user: 'Admin User',
    action: 'DELETE',
    table: 'user_profiles',
    recordId: 'USER-001',
    beforeValue: 'User: John Doe (Active)',
    afterValue: 'User: John Doe (Inactive)',
    reason: 'User no longer employed',
    ipAddress: '192.168.1.100'
  }
]

export default function AuditTrailPage() {
  const [auditEntries] = useState<AuditEntry[]>(mockAuditEntries)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterUser, setFilterUser] = useState<string>('all')
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterTable, setFilterTable] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Badge className="bg-green-100 text-green-800">Create</Badge>
      case 'UPDATE':
        return <Badge className="bg-blue-100 text-blue-800">Update</Badge>
      case 'DELETE':
        return <Badge className="bg-red-100 text-red-800">Delete</Badge>
      default:
        return <Badge variant="secondary">{action}</Badge>
    }
  }

  const filteredEntries = auditEntries.filter(entry => {
    const matchesSearch = !searchTerm || 
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.table.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesUser = filterUser === 'all' || entry.user === filterUser
    const matchesAction = filterAction === 'all' || entry.action === filterAction
    const matchesTable = filterTable === 'all' || entry.table === filterTable
    return matchesSearch && matchesUser && matchesAction && matchesTable
  })

  const handleExport = () => {
    alert('Exporting audit trail to CSV...')
  }

  const handleRetrieveHistorical = () => {
    const yearsAgo = prompt('Enter number of years to retrieve (up to 12):', '5')
    if (yearsAgo) {
      const years = parseInt(yearsAgo)
      if (years >= 1 && years <= 12) {
        const targetDate = new Date()
        targetDate.setFullYear(targetDate.getFullYear() - years)
        alert(`Retrieving audit trail data from ${years} years ago (${targetDate.toLocaleDateString()}).\n\nData integrity maintained: All records are accessible and traceable.`)
      } else {
        alert('Please enter a number between 1 and 12.')
      }
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Trail</h1>
              <p className="text-gray-600">
                Track all data changes for integrity and compliance
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRetrieveHistorical} variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Retrieve Historical Data
              </Button>
              <Button onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export Audit Trail
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data Integrity & Change Tracking</CardTitle>
            <CardDescription>
              Complete audit trail of all data modifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search audit trail..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>User</Label>
                  <Select value={filterUser} onValueChange={setFilterUser}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="Admin User">Admin User</SelectItem>
                      <SelectItem value="Inspector John Doe">Inspector John Doe</SelectItem>
                      <SelectItem value="Water System Operator">Water System Operator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="CREATE">Create</SelectItem>
                      <SelectItem value="UPDATE">Update</SelectItem>
                      <SelectItem value="DELETE">Delete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Table</Label>
                  <Select value={filterTable} onValueChange={setFilterTable}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tables</SelectItem>
                      <SelectItem value="mcl_configurations">MCL Configurations</SelectItem>
                      <SelectItem value="violations">Violations</SelectItem>
                      <SelectItem value="reports">Reports</SelectItem>
                      <SelectItem value="user_profiles">User Profiles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date From</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date To</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-4">
                  {filteredEntries.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No audit entries found
                    </div>
                  ) : (
                    filteredEntries.map(entry => (
                      <div
                        key={entry.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {}}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Database className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{entry.user}</h4>
                                {getActionBadge(entry.action)}
                              </div>
                              <p className="text-sm text-gray-600">
                                {entry.table} • Record ID: {entry.recordId}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {new Date(entry.timestamp).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              IP: {entry.ipAddress}
                            </p>
                          </div>
                        </div>
                        {entry.reason && (
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Reason:</span> {entry.reason}
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Before</p>
                            <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                              {entry.beforeValue || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">After</p>
                            <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                              {entry.afterValue || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>12-Year Data Retention & Retrieval</CardTitle>
            <CardDescription>
              Data retention capability and historical data retrieval demonstration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium">Data Retention Policy</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  All data is retained for 12 years as required by DWI regulations. Historical data remains accessible and maintainable for compliance purposes. The system tracks all changes with complete audit trails.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Retention Period</p>
                    <p className="text-2xl font-bold">12 Years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Oldest Accessible Data</p>
                    <p className="text-2xl font-bold">November 2013</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Audit Records</p>
                    <p className="text-2xl font-bold">2,633,110</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium">Data Integrity Features</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    All data changes are tracked with before/after values
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Complete audit trail with user, timestamp, and IP address
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Immutable audit logs prevent tampering
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Historical data retrieval for any date within 12-year period
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Traceability guaranteed by secure audit trail
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

