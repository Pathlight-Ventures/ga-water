"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Droplets,
  Building2,
  MapPin,
  Download,
  Loader2
} from 'lucide-react'
import { AnalyticsRepository } from '@/lib/repository/analytics'
import type { ComplianceTrend } from '@/lib/repository/analytics'

interface SystemStats {
  water_systems: {
    total: number
    active: number
    with_violations: number
    total_population: number
    avg_population: number
  }
  violations: {
    total: number
    active: number
    health_based: number
    avg_resolution_days: number
  }
  compliance_rate: string
}

interface ViolationCategory {
  category: string
  count: number
  percentage: number
}

interface CountyData {
  county: string
  systems: number
  violations: number
  population: number
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [complianceTrends, setComplianceTrends] = useState<ComplianceTrend[]>([])
  const [violationCategories, setViolationCategories] = useState<ViolationCategory[]>([])
  const [countyData, setCountyData] = useState<CountyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('q1-2025')

  const analyticsRepo = new AnalyticsRepository()

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Load system performance metrics
      const systemMetrics = await analyticsRepo.getSystemPerformanceMetrics() as SystemStats
      setStats(systemMetrics)

      // Load compliance trends
      const trends = await analyticsRepo.getComplianceTrends({ monthsBack: 12 })
      setComplianceTrends(trends)

      // Load violation trends by category
      const violationTrendsRaw = await analyticsRepo.getViolationTrendsByCategory(12)
      const violationTrends = violationTrendsRaw as { month: string, categories: Record<string, number> }[]
      
      // Process violation categories
      const categoryMap = new Map<string, number>()
      violationTrends.forEach((trend) => {
        Object.entries(trend.categories).forEach(([category, count]) => {
          const currentCount = categoryMap.get(category) || 0
          categoryMap.set(category, currentCount + (count as number))
        })
      })

      const totalViolations = Array.from(categoryMap.values()).reduce((sum, count) => sum + count, 0)
      const categories: ViolationCategory[] = Array.from(categoryMap.entries()).map(([category, count]) => ({
        category,
        count,
        percentage: totalViolations > 0 ? Math.round((count / totalViolations) * 100) : 0
      })).sort((a, b) => b.count - a.count)

      setViolationCategories(categories)

      // Load county statistics
      const countyStats = await analyticsRepo.getCountyStatistics() as CountyData[]
      setCountyData(countyStats.slice(0, 10)) // Top 10 counties

    } catch (err) {
      console.error('Error loading analytics data:', err)
      setError('Failed to load analytics data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  const getStatsCards = () => {
    if (!stats) return []

    return [
      {
        title: 'Total Water Systems',
        value: formatNumber(stats.water_systems.total),
        change: '+12',
        changeType: 'positive' as const,
        icon: Building2,
        description: 'Active public water systems'
      },
      {
        title: 'Compliance Rate',
        value: `${stats.compliance_rate}%`,
        change: '+2.1%',
        changeType: 'positive' as const,
        icon: CheckCircle,
        description: 'Systems in compliance'
      },
      {
        title: 'Active Violations',
        value: stats.violations.active.toString(),
        change: '-8',
        changeType: 'negative' as const,
        icon: AlertTriangle,
        description: 'Current violations'
      },
      {
        title: 'Population Served',
        value: formatNumber(stats.water_systems.total_population),
        change: '+0.3M',
        changeType: 'positive' as const,
        icon: Droplets,
        description: 'Georgia residents served'
      }
    ]
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading analytics data...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadAnalyticsData}>Try Again</Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Comprehensive insights into Georgia&apos;s drinking water system performance
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="q1-2025">Q1 2025</SelectItem>
                  <SelectItem value="q4-2024">Q4 2024</SelectItem>
                  <SelectItem value="q3-2024">Q3 2024</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getStatsCards().map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center gap-2 mt-2">
                    {stat.changeType === 'positive' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs last quarter</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts and Data */}
        <Tabs defaultValue="violations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="violations">Violation Analysis</TabsTrigger>
            <TabsTrigger value="counties">County Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="violations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Violation Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Violation Categories</CardTitle>
                  <CardDescription>
                    Breakdown of current violations by type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {violationCategories.map((item) => (
                      <div key={item.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">{item.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{item.count}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Violation Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Violation Trends</CardTitle>
                  <CardDescription>
                    Monthly violation trends over the past year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Chart visualization coming soon</p>
                      <p className="text-sm text-gray-400">
                        Interactive charts with violation trends and patterns
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="counties" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>County Overview</CardTitle>
                <CardDescription>
                  Water systems and violations by county
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {countyData.map((item) => (
                    <div key={item.county} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <h3 className="font-semibold">{item.county}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.systems} water systems
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Badge variant={item.violations > 0 ? "destructive" : "default"}>
                            {item.violations} violations
                          </Badge>
                        </div>
                        {item.population > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatNumber(item.population)} residents
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Trends</CardTitle>
                <CardDescription>
                  Monthly compliance rates over the past year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceTrends.slice(-6).map((trend) => (
                    <div key={trend.month_date} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">
                          {new Date(trend.month_date).toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {trend.total_systems} total systems
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {trend.compliance_rate}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {trend.compliant_systems} compliant, {trend.non_compliant_systems} non-compliant
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
} 