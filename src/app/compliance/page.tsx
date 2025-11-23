"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Edit
} from 'lucide-react'

interface MCL {
  id: string
  parameter: string
  value: number
  unit: string
  effectiveDate: string
  reference: string
}

interface Exceedance {
  id: string
  systemName: string
  parameter: string
  measuredValue: number
  mclValue: number
  unit: string
  date: string
  status: 'new' | 'acknowledged' | 'resolved'
}

interface NonSubmission {
  id: string
  systemName: string
  month: string
  daysOverdue: number
  status: 'grace_period' | 'late' | 'beyond_limit'
}

const mockMCLs: MCL[] = [
  {
    id: '1',
    parameter: 'Turbidity',
    value: 0.3,
    unit: 'NTU',
    effectiveDate: '2025-01-01',
    reference: 'EPA Standard'
  },
  {
    id: '2',
    parameter: 'Chlorine Residual',
    value: 0.2,
    unit: 'mg/L',
    effectiveDate: '2025-01-01',
    reference: 'EPA Standard'
  },
  {
    id: '3',
    parameter: 'Lead',
    value: 0.015,
    unit: 'mg/L',
    effectiveDate: '2025-01-01',
    reference: 'EPA Standard'
  }
]

const mockExceedances: Exceedance[] = [
  {
    id: '1',
    systemName: 'Atlanta Water Plant #1',
    parameter: 'Turbidity',
    measuredValue: 0.45,
    mclValue: 0.3,
    unit: 'NTU',
    date: '2025-11-15',
    status: 'new'
  },
  {
    id: '2',
    systemName: 'Water System #2',
    parameter: 'Lead',
    measuredValue: 0.018,
    mclValue: 0.015,
    unit: 'mg/L',
    date: '2025-11-10',
    status: 'acknowledged'
  }
]

const mockNonSubmissions: NonSubmission[] = [
  {
    id: '1',
    systemName: 'System A',
    month: 'November 2025',
    daysOverdue: 5,
    status: 'grace_period'
  },
  {
    id: '2',
    systemName: 'System B',
    month: 'November 2025',
    daysOverdue: 12,
    status: 'late'
  },
  {
    id: '3',
    systemName: 'System C',
    month: 'November 2025',
    daysOverdue: 18,
    status: 'late'
  }
]

export default function CompliancePage() {
  const [mcls, setMCLs] = useState<MCL[]>(mockMCLs)
  const [exceedances] = useState<Exceedance[]>(mockExceedances)
  const [nonSubmissions] = useState<NonSubmission[]>(mockNonSubmissions)
  const [showMCLForm, setShowMCLForm] = useState(false)
  const [newMCL, setNewMCL] = useState({
    parameter: '',
    value: '',
    unit: '',
    effectiveDate: '',
    reference: ''
  })
  const [deadlineConfig, setDeadlineConfig] = useState({
    reportType: 'monthly',
    submissionDeadline: '10',
    gracePeriod: '5',
    lateLimit: '30'
  })
  const [selectedMonth, setSelectedMonth] = useState('2025-11')

  const handleAddMCL = () => {
    if (!newMCL.parameter || !newMCL.value || !newMCL.unit) {
      alert('Please fill in all required fields')
      return
    }

    const mcl: MCL = {
      id: Date.now().toString(),
      parameter: newMCL.parameter,
      value: parseFloat(newMCL.value),
      unit: newMCL.unit,
      effectiveDate: newMCL.effectiveDate || new Date().toISOString().split('T')[0],
      reference: newMCL.reference || 'EPA Standard'
    }

    setMCLs([...mcls, mcl])
    setNewMCL({ parameter: '', value: '', unit: '', effectiveDate: '', reference: '' })
    setShowMCLForm(false)
  }

  const handleSaveDeadline = () => {
    alert('Deadline configuration saved!')
  }

  const getExceedancePercentage = (measured: number, mcl: number) => {
    return ((measured - mcl) / mcl * 100).toFixed(1)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-red-100 text-red-800">New</Badge>
      case 'acknowledged':
        return <Badge className="bg-yellow-100 text-yellow-800">Acknowledged</Badge>
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      default:
        return null
    }
  }

  const getNonSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case 'grace_period':
        return <Badge className="bg-yellow-100 text-yellow-800">Grace Period</Badge>
      case 'late':
        return <Badge className="bg-orange-100 text-orange-800">Late</Badge>
      case 'beyond_limit':
        return <Badge className="bg-red-100 text-red-800">Beyond Limit</Badge>
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compliance Tracking</h1>
          <p className="text-gray-600">
            Monitor compliance, MCLs, deadlines, and violations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Systems</p>
                  <p className="text-2xl font-bold text-gray-900">106</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Compliance</p>
                  <p className="text-2xl font-bold text-green-600">98</p>
                  <p className="text-xs text-gray-500">92.5%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Violations</p>
                  <p className="text-2xl font-bold text-red-600">8</p>
                  <p className="text-xs text-gray-500">7.5%</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue Reports</p>
                  <p className="text-2xl font-bold text-orange-600">3</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="mcls">MCL Management</TabsTrigger>
            <TabsTrigger value="exceedances">MCL Exceedances</TabsTrigger>
            <TabsTrigger value="non-submissions">Non-Submissions</TabsTrigger>
            <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
                <CardDescription>
                  Real-time compliance status across all water systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Compliance Rate</span>
                    <span className="text-2xl font-bold text-green-600">92.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-green-600 h-4 rounded-full" style={{ width: '92.5%' }}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Systems with Violations</p>
                      <p className="text-xl font-bold">8</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">MCL Exceedances This Month</p>
                      <p className="text-xl font-bold">5</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mcls" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Maximum Contaminant Levels (MCLs)</CardTitle>
                    <CardDescription>
                      Configure MCLs for parameters
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowMCLForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add MCL
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showMCLForm && (
                  <Card className="mb-6 border-2">
                    <CardHeader>
                      <CardTitle>Add New MCL</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="parameter">Parameter *</Label>
                          <Input
                            id="parameter"
                            value={newMCL.parameter}
                            onChange={(e) => setNewMCL({ ...newMCL, parameter: e.target.value })}
                            placeholder="e.g., Turbidity"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="value">MCL Value *</Label>
                          <Input
                            id="value"
                            type="number"
                            step="0.001"
                            value={newMCL.value}
                            onChange={(e) => setNewMCL({ ...newMCL, value: e.target.value })}
                            placeholder="e.g., 0.3"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unit">Unit *</Label>
                          <Input
                            id="unit"
                            value={newMCL.unit}
                            onChange={(e) => setNewMCL({ ...newMCL, unit: e.target.value })}
                            placeholder="e.g., NTU"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="effectiveDate">Effective Date</Label>
                          <Input
                            id="effectiveDate"
                            type="date"
                            value={newMCL.effectiveDate}
                            onChange={(e) => setNewMCL({ ...newMCL, effectiveDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reference">Reference</Label>
                        <Input
                          id="reference"
                          value={newMCL.reference}
                          onChange={(e) => setNewMCL({ ...newMCL, reference: e.target.value })}
                          placeholder="e.g., EPA Standard"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddMCL}>Save MCL</Button>
                        <Button variant="outline" onClick={() => setShowMCLForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  {mcls.map(mcl => (
                    <div key={mcl.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{mcl.parameter}</h4>
                        <p className="text-sm text-gray-600">
                          {mcl.value} {mcl.unit} • Effective: {mcl.effectiveDate} • {mcl.reference}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exceedances" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>MCL Exceedances</CardTitle>
                <CardDescription>
                  Systems with parameters exceeding MCLs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exceedances.map(exceedance => (
                    <div key={exceedance.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{exceedance.systemName}</h4>
                          <p className="text-sm text-gray-600">{exceedance.parameter}</p>
                        </div>
                        {getStatusBadge(exceedance.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-600">Measured Value</p>
                          <p className="text-lg font-bold text-red-600">
                            {exceedance.measuredValue} {exceedance.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">MCL Limit</p>
                          <p className="text-lg font-bold">
                            {exceedance.mclValue} {exceedance.unit}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-orange-600">
                          Exceedance: {getExceedancePercentage(exceedance.measuredValue, exceedance.mclValue)}%
                        </p>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm">Generate Violation Notice</Button>
                        <Button size="sm" variant="outline">Acknowledge</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="non-submissions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Non-Submissions</CardTitle>
                    <CardDescription>
                      Systems that haven&apos;t submitted reports
                    </CardDescription>
                  </div>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025-11">November 2025</SelectItem>
                      <SelectItem value="2025-10">October 2025</SelectItem>
                      <SelectItem value="2025-09">September 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nonSubmissions.map(ns => (
                    <div key={ns.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{ns.systemName}</h4>
                        <p className="text-sm text-gray-600">{ns.month}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Days Overdue</p>
                          <p className="text-lg font-bold text-orange-600">{ns.daysOverdue}</p>
                        </div>
                        {getNonSubmissionStatusBadge(ns.status)}
                        <Button size="sm">Send Reminder</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deadlines" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Deadline Configuration</CardTitle>
                <CardDescription>
                  Configure report submission deadlines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportType">Report Type</Label>
                    <Select 
                      value={deadlineConfig.reportType} 
                      onValueChange={(value) => setDeadlineConfig({ ...deadlineConfig, reportType: value })}
                    >
                      <SelectTrigger id="reportType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly Operating Report</SelectItem>
                        <SelectItem value="daily">Daily Report</SelectItem>
                        <SelectItem value="inspection">Inspection Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="submissionDeadline">
                      Submission Deadline (day of following month)
                    </Label>
                    <Input
                      id="submissionDeadline"
                      type="number"
                      min="1"
                      max="31"
                      value={deadlineConfig.submissionDeadline}
                      onChange={(e) => setDeadlineConfig({ ...deadlineConfig, submissionDeadline: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">
                      e.g., 10 = 10th of the following month
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gracePeriod">Grace Period (days)</Label>
                    <Input
                      id="gracePeriod"
                      type="number"
                      min="0"
                      value={deadlineConfig.gracePeriod}
                      onChange={(e) => setDeadlineConfig({ ...deadlineConfig, gracePeriod: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">
                      Days after deadline before marked as late
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lateLimit">Late Submission Limit (days)</Label>
                    <Input
                      id="lateLimit"
                      type="number"
                      min="0"
                      value={deadlineConfig.lateLimit}
                      onChange={(e) => setDeadlineConfig({ ...deadlineConfig, lateLimit: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">
                      Maximum days after deadline to accept submissions
                    </p>
                  </div>

                  <Button onClick={handleSaveDeadline}>
                    Save Deadline Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

