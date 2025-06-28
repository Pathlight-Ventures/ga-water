import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Building2, 
  AlertTriangle, 
  MapPin,
  Download,
  RefreshCw
} from 'lucide-react'

// Mock data for demonstration
const mockWaterSystems = [
  {
    id: 'GA1234567',
    name: 'Atlanta Water System',
    type: 'CWS',
    population: 498044,
    county: 'Fulton',
    violations: 2,
    status: 'Active'
  },
  {
    id: 'GA2345678',
    name: 'Savannah Water Works',
    type: 'CWS',
    population: 147780,
    county: 'Chatham',
    violations: 0,
    status: 'Active'
  },
  {
    id: 'GA3456789',
    name: 'Athens-Clarke County',
    type: 'CWS',
    population: 127330,
    county: 'Clarke',
    violations: 1,
    status: 'Active'
  },
  {
    id: 'GA4567890',
    name: 'Augusta Water System',
    type: 'CWS',
    population: 202081,
    county: 'Richmond',
    violations: 3,
    status: 'Active'
  },
  {
    id: 'GA5678901',
    name: 'Columbus Water Works',
    type: 'CWS',
    population: 195769,
    county: 'Muscogee',
    violations: 1,
    status: 'Active'
  }
]

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Water Systems</h1>
          <p className="text-muted-foreground">
            Find and explore Georgia&apos;s public water systems and their compliance data
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search & Filters
            </CardTitle>
            <CardDescription>
              Search by system name, ID, or location and apply filters to narrow results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="System name or ID..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fulton">Fulton</SelectItem>
                    <SelectItem value="chatham">Chatham</SelectItem>
                    <SelectItem value="clarke">Clarke</SelectItem>
                    <SelectItem value="richmond">Richmond</SelectItem>
                    <SelectItem value="muscogee">Muscogee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">System Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cws">Community Water System</SelectItem>
                    <SelectItem value="ntncws">Non-Transient Non-Community</SelectItem>
                    <SelectItem value="tws">Transient Non-Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="violations">Violations</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by violations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No violations</SelectItem>
                    <SelectItem value="minor">Minor violations</SelectItem>
                    <SelectItem value="major">Major violations</SelectItem>
                    <SelectItem value="all">All systems</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Clear Filters
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Tabs defaultValue="table" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Table View
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Map View
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="w-4 h-4" />
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>

          <TabsContent value="table" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Water Systems</CardTitle>
                    <CardDescription>
                      Showing {mockWaterSystems.length} water systems
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {mockWaterSystems.length} results
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>System ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>County</TableHead>
                      <TableHead>Population</TableHead>
                      <TableHead>Violations</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockWaterSystems.map((system) => (
                      <TableRow key={system.id}>
                        <TableCell className="font-mono text-sm">
                          {system.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {system.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {system.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{system.county}</TableCell>
                        <TableCell>
                          {system.population.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {system.violations > 0 ? (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {system.violations}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">0</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">
                            {system.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Geographic View</CardTitle>
                <CardDescription>
                  Interactive map showing water system locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Map view coming soon</p>
                    <p className="text-sm text-gray-400">
                      Interactive map with water system locations and violation data
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
} 