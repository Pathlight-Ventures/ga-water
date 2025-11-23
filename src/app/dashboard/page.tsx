"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Droplet,
  Filter,
  Activity,
  FileX,
  AlertCircle,
  Shield
} from 'lucide-react'
import Link from 'next/link'

interface DashboardMetric {
  id: string
  label: string
  value: number
  percentage?: number
  trend?: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'critical'
}

interface ExceedanceDetail {
  id: string
  systemName: string
  parameter: string
  measuredValue: number
  limit: number
  unit: string
  date: string
}

const mockMetrics: DashboardMetric[] = [
  {
    id: 'non-submissions',
    label: 'Systems Not Submitted MORS Report',
    value: 8,
    percentage: 7.5,
    trend: 'down',
    status: 'warning'
  },
  {
    id: 'gw-exceedance',
    label: 'Ground Water Withdrawal Exceedances',
    value: 3,
    percentage: 2.8,
    trend: 'stable',
    status: 'warning'
  },
  {
    id: 'sw-exceedance',
    label: 'Surface Water Withdrawal Exceedances',
    value: 2,
    percentage: 1.9,
    trend: 'down',
    status: 'warning'
  },
  {
    id: 'filtration-exceedance',
    label: 'Filtration Rate Exceedances',
    value: 5,
    percentage: 4.7,
    trend: 'up',
    status: 'critical'
  },
  {
    id: 'flux-exceedance',
    label: 'Flux Rate Exceedances',
    value: 4,
    percentage: 3.8,
    trend: 'stable',
    status: 'warning'
  },
  {
    id: 'virus-removal',
    label: 'Systems Not Meeting Virus Removal Log',
    value: 6,
    percentage: 5.7,
    trend: 'down',
    status: 'warning'
  },
  {
    id: 'giardia-removal',
    label: 'Systems Not Meeting Giardia Removal Log',
    value: 7,
    percentage: 6.6,
    trend: 'up',
    status: 'critical'
  },
  {
    id: 'toc-removal',
    label: 'Systems Not Meeting TOC Removal',
    value: 4,
    percentage: 3.8,
    trend: 'stable',
    status: 'warning'
  },
  {
    id: 'chlorine-low',
    label: 'Systems with Chlorine Residual < 0.2',
    value: 9,
    percentage: 8.5,
    trend: 'down',
    status: 'critical'
  },
  {
    id: 'turbidity-high',
    label: 'Systems with Turbidity > 0.3',
    value: 5,
    percentage: 4.7,
    trend: 'up',
    status: 'critical'
  }
]

const mockExceedanceDetails: ExceedanceDetail[] = [
  {
    id: '1',
    systemName: 'Atlanta Water Plant #1',
    parameter: 'Turbidity',
    measuredValue: 0.45,
    limit: 0.3,
    unit: 'NTU',
    date: '2025-11-15'
  },
  {
    id: '2',
    systemName: 'Water System #2',
    parameter: 'Chlorine Residual',
    measuredValue: 0.15,
    limit: 0.2,
    unit: 'mg/L',
    date: '2025-11-14'
  },
  {
    id: '3',
    systemName: 'Water System #3',
    parameter: 'Filtration Rate',
    measuredValue: 4.2,
    limit: 4.0,
    unit: 'gpm/sq ft',
    date: '2025-11-13'
  },
  {
    id: '4',
    systemName: 'Water System #4',
    parameter: 'Ground Water Withdrawal',
    measuredValue: 125000,
    limit: 120000,
    unit: 'gallons/day',
    date: '2025-11-12'
  },
  {
    id: '5',
    systemName: 'Water System #5',
    parameter: 'Giardia Removal',
    measuredValue: 2.8,
    limit: 3.0,
    unit: 'log',
    date: '2025-11-11'
  }
]

export default function DashboardPage() {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTrendIcon = (trend?: string) => {
    if (!trend) return null
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-600" />
      case 'down':
        return <TrendingUp className="w-4 h-4 text-green-600 rotate-180" />
      default:
        return null
    }
  }

  const totalSystems = 106
  const systemsInCompliance = totalSystems - mockMetrics.reduce((sum, m) => sum + m.value, 0)
  const complianceRate = ((systemsInCompliance / totalSystems) * 100).toFixed(1)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agency Dashboard</h1>
          <p className="text-gray-600">
            Real-time compliance monitoring and system status overview
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Water Systems</p>
                  <p className="text-3xl font-bold text-gray-900">{totalSystems}</p>
                </div>
                <Droplet className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Systems in Compliance</p>
                  <p className="text-3xl font-bold text-green-600">{systemsInCompliance}</p>
                  <p className="text-xs text-gray-500 mt-1">{complianceRate}% compliance rate</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Systems Requiring Follow-up</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {mockMetrics.reduce((sum, m) => sum + m.value, 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Multiple parameters</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics Grid */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Compliance Metrics</CardTitle>
            <CardDescription>
              Key performance indicators for water system compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockMetrics.map(metric => (
                <div
                  key={metric.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedMetric === metric.id 
                      ? 'border-orange-500 bg-orange-50' 
                      : getStatusColor(metric.status)
                  }`}
                  onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">{metric.label}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">{metric.value}</p>
                        {metric.percentage && (
                          <Badge variant="secondary" className="text-xs">
                            {metric.percentage}%
                          </Badge>
                        )}
                        {getTrendIcon(metric.trend)}
                      </div>
                    </div>
                    {getStatusIcon(metric.status)}
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          metric.status === 'critical' ? 'bg-red-600' :
                          metric.status === 'warning' ? 'bg-yellow-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${(metric.value / totalSystems) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Exceedance Details */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Water Systems with Exceedance of Monitored Parameters</CardTitle>
                <CardDescription>
                  Detailed view of systems requiring follow-up action
                </CardDescription>
              </div>
              <Link href="/compliance">
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockExceedanceDetails.map(detail => (
                <div
                  key={detail.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      detail.measuredValue > detail.limit 
                        ? 'bg-red-100' 
                        : 'bg-yellow-100'
                    }`}>
                      <Activity className={`w-5 h-5 ${
                        detail.measuredValue > detail.limit 
                          ? 'text-red-600' 
                          : 'text-yellow-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{detail.systemName}</h4>
                      <p className="text-sm text-gray-600">{detail.parameter}</p>
                      <p className="text-xs text-gray-500 mt-1">Date: {detail.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${
                        detail.measuredValue > detail.limit 
                          ? 'text-red-600' 
                          : 'text-yellow-600'
                      }`}>
                        {detail.measuredValue} {detail.unit}
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-600">
                        {detail.limit} {detail.unit}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {detail.measuredValue > detail.limit ? 'Exceeded' : 'Below Limit'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/compliance">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Compliance Tracking</h3>
                    <p className="text-sm text-gray-600">Manage MCLs and violations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/reports">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <FileX className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">Reports</h3>
                    <p className="text-sm text-gray-600">Generate and view reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/notifications">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-orange-600" />
                  <div>
                    <h3 className="font-semibold">Notifications</h3>
                    <p className="text-sm text-gray-600">Send alerts and reminders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  )
}

