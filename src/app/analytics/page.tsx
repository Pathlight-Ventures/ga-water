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
  Calendar,
  Download
} from 'lucide-react'

// Mock data for demonstration
const stats = [
  {
    title: 'Total Water Systems',
    value: '1,247',
    change: '+12',
    changeType: 'positive',
    icon: Building2,
    description: 'Active public water systems'
  },
  {
    title: 'Compliance Rate',
    value: '94.2%',
    change: '+2.1%',
    changeType: 'positive',
    icon: CheckCircle,
    description: 'Systems in compliance'
  },
  {
    title: 'Active Violations',
    value: '73',
    change: '-8',
    changeType: 'negative',
    icon: AlertTriangle,
    description: 'Current violations'
  },
  {
    title: 'Population Served',
    value: '10.7M',
    change: '+0.3M',
    changeType: 'positive',
    icon: Droplets,
    description: 'Georgia residents served'
  }
]

const violationData = [
  { category: 'Microbiological', count: 23, percentage: 31.5 },
  { category: 'Chemical', count: 18, percentage: 24.7 },
  { category: 'Radiological', count: 12, percentage: 16.4 },
  { category: 'Lead & Copper', count: 11, percentage: 15.1 },
  { category: 'Other', count: 9, percentage: 12.3 }
]

const countyData = [
  { county: 'Fulton', systems: 45, violations: 8, population: 1048000 },
  { county: 'Gwinnett', systems: 38, violations: 6, population: 936000 },
  { county: 'Cobb', systems: 32, violations: 5, population: 760000 },
  { county: 'DeKalb', systems: 29, violations: 7, population: 750000 },
  { county: 'Chatham', systems: 25, violations: 4, population: 295000 }
]

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Comprehensive insights into Georgia's drinking water system performance
              </p>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="q1-2025">
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
          {stats.map((stat) => {
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
                    {violationData.map((item) => (
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
                <CardTitle>County Performance</CardTitle>
                <CardDescription>
                  Water system performance by county
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {countyData.map((county) => (
                    <div key={county.county} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{county.county} County</h3>
                          <p className="text-sm text-muted-foreground">
                            {county.population.toLocaleString()} residents
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Systems</p>
                          <p className="font-semibold">{county.systems}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Violations</p>
                          <Badge variant={county.violations > 5 ? "destructive" : "secondary"}>
                            {county.violations}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Trends</CardTitle>
                  <CardDescription>
                    Monthly compliance rate changes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Trend analysis coming soon</p>
                      <p className="text-sm text-gray-400">
                        Historical compliance data and projections
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>System Growth</CardTitle>
                  <CardDescription>
                    New water systems and population served
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Growth metrics coming soon</p>
                      <p className="text-sm text-gray-400">
                        System expansion and population growth trends
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
} 