import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MapPin, 
  Layers, 
  Filter, 
  Download,
  ZoomIn,
  ZoomOut
} from 'lucide-react'

export default function MapPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Geographic Explorer</h1>
              <p className="text-muted-foreground">
                Interactive map of Georgia's water systems and compliance data
              </p>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Systems</SelectItem>
                  <SelectItem value="violations">With Violations</SelectItem>
                  <SelectItem value="compliant">Compliant Only</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Map Legend */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Map Layers
              </CardTitle>
              <CardDescription>
                Toggle map layers and filters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Compliant Systems</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Minor Violations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Major Violations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">County Boundaries</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Quick Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Systems:</span>
                    <Badge variant="secondary">1,247</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>With Violations:</span>
                    <Badge variant="destructive">73</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Compliant:</span>
                    <Badge variant="default">1,174</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Georgia Water Systems Map</CardTitle>
                    <CardDescription>
                      Interactive map showing water system locations and compliance status
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center relative">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Interactive Map Coming Soon
                    </h3>
                    <p className="text-gray-500 max-w-md">
                      This will be an interactive map showing water system locations, 
                      violation data, and geographic boundaries across Georgia.
                    </p>
                  </div>
                  
                  {/* Mock map markers */}
                  <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Geographic Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Analyze water system distribution and compliance patterns by geographic region.
              </p>
              <Button variant="outline" className="w-full">
                View Regional Data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-green-600" />
                Spatial Filtering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Filter water systems by county, watershed, or custom geographic boundaries.
              </p>
              <Button variant="outline" className="w-full">
                Set Filters
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-purple-600" />
                Export Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Export map data, geographic boundaries, and spatial analysis results.
              </p>
              <Button variant="outline" className="w-full">
                Export Map Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
} 