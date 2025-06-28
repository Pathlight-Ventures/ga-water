"use client"

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  MapPin, 
  Filter, 
  X,
  ZoomIn,
  ZoomOut,
  Layers,
  AlertTriangle
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { WaterSystemsRepository } from '@/lib/repository/water-systems'
import { ViolationsRepository } from '@/lib/repository/violations'
import type { WaterSystemSearchResult } from '@/lib/repository/water-systems'
import type { Violation } from '@/lib/repository/violations'

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/map-component'), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Loading Map...</h3>
      </div>
    </div>
  )
})

export default function MapPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<WaterSystemSearchResult[]>([])
  const [selectedSystem, setSelectedSystem] = useState<WaterSystemSearchResult | null>(null)
  const [systemViolations, setSystemViolations] = useState<Violation[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  
  // Advanced search filters
  const [filters, setFilters] = useState({
    stateCode: '',
    pwsType: '',
    activityStatus: '',
    hasViolations: false,
    populationMin: '',
    populationMax: ''
  })

  const waterSystemsRepo = new WaterSystemsRepository()
  const violationsRepo = new ViolationsRepository()

  // Search water systems
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)
    try {
      const results = await waterSystemsRepo.search({
        searchTerm: searchTerm.trim(),
        stateCode: filters.stateCode || undefined,
        pwsType: filters.pwsType || undefined,
        activityStatus: filters.activityStatus || undefined,
        hasViolations: filters.hasViolations || undefined,
        limit: 100
      })
      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [searchTerm, filters])

  // Load violations for selected system
  const loadSystemViolations = useCallback(async (pwsid: string) => {
    try {
      const violations = await violationsRepo.getByPwsid(pwsid, { limit: 50 })
      setSystemViolations(violations)
    } catch (error) {
      console.error('Error loading violations:', error)
      setSystemViolations([])
    }
  }, [])

  // Handle system selection
  const handleSystemSelect = useCallback((system: WaterSystemSearchResult) => {
    setSelectedSystem(system)
    loadSystemViolations(system.pwsid)
  }, [loadSystemViolations])

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm('')
    setSearchResults([])
    setSelectedSystem(null)
    setSystemViolations([])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Water Systems Map</h1>
          <p className="text-muted-foreground">
            Search and explore Georgia&apos;s water systems and compliance data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search Bar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Water Systems
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSearchSubmit} className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, PWSID, or city..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    {searchTerm && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSearching || !searchTerm.trim()}
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </form>

                {/* Advanced Search Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  className="w-full flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Advanced Search
                </Button>

                {/* Advanced Search Filters */}
                {showAdvancedSearch && (
                  <div className="space-y-3 pt-3 border-t">
                    <div>
                      <label className="text-sm font-medium mb-1 block">State</label>
                      <Select value={filters.stateCode} onValueChange={(value) => setFilters(prev => ({ ...prev, stateCode: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="All States" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All States</SelectItem>
                          <SelectItem value="GA">Georgia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">System Type</label>
                      <Select value={filters.pwsType} onValueChange={(value) => setFilters(prev => ({ ...prev, pwsType: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Types</SelectItem>
                          <SelectItem value="CWS">Community Water System</SelectItem>
                          <SelectItem value="TNCWS">Transient Non-Community</SelectItem>
                          <SelectItem value="NTNCWS">Non-Transient Non-Community</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Activity Status</label>
                      <Select value={filters.activityStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, activityStatus: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Statuses</SelectItem>
                          <SelectItem value="A">Active</SelectItem>
                          <SelectItem value="I">Inactive</SelectItem>
                          <SelectItem value="N">New</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hasViolations"
                        checked={filters.hasViolations}
                        onChange={(e) => setFilters(prev => ({ ...prev, hasViolations: e.target.checked }))}
                        className="rounded"
                      />
                      <label htmlFor="hasViolations" className="text-sm">Has Violations</label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Search Results ({searchResults.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {searchResults.map((system) => (
                      <div
                        key={system.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedSystem?.id === system.id 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleSystemSelect(system)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{system.pws_name || 'Unnamed System'}</h4>
                          <Badge 
                            variant={system.violation_count > 0 ? "destructive" : "default"}
                            className="text-xs"
                          >
                            {system.violation_count} violations
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>PWSID: {system.pwsid}</p>
                          {system.city_name && <p>City: {system.city_name}</p>}
                          {system.population_served_count && (
                            <p>Population: {system.population_served_count.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Selected System Details */}
            {selectedSystem && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    System Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">{selectedSystem.pws_name || 'Unnamed System'}</h4>
                      <p className="text-sm text-gray-600">PWSID: {selectedSystem.pwsid}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Type:</span>
                        <Badge variant="outline">{selectedSystem.pws_type_code}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <Badge variant="outline">{selectedSystem.pws_activity_code}</Badge>
                      </div>
                      {selectedSystem.population_served_count && (
                        <div className="flex justify-between text-sm">
                          <span>Population:</span>
                          <span>{selectedSystem.population_served_count.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>Violations:</span>
                        <Badge 
                          variant={selectedSystem.violation_count > 0 ? "destructive" : "default"}
                        >
                          {selectedSystem.violation_count}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Map Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Interactive Map</CardTitle>
                    <CardDescription>
                      {selectedSystem 
                        ? `Viewing: ${selectedSystem.pws_name || selectedSystem.pwsid}`
                        : 'Click on a search result to view system details'
                      }
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
                      <Layers className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <MapComponent 
                  searchResults={searchResults}
                  selectedSystem={selectedSystem}
                  onSystemSelect={handleSystemSelect}
                />
              </CardContent>
            </Card>

            {/* Violations Panel */}
            {selectedSystem && systemViolations.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Violations ({systemViolations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {systemViolations.map((violation) => (
                      <div key={violation.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{violation.violation_code}</h4>
                          <Badge 
                            variant={violation.violation_status === 'Resolved' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {violation.violation_status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>Category: {violation.violation_category_code}</p>
                          {violation.contaminant_code && (
                            <p>Contaminant: {violation.contaminant_code}</p>
                          )}
                          {violation.non_compl_per_begin_date && (
                            <p>Started: {new Date(violation.non_compl_per_begin_date).toLocaleDateString()}</p>
                          )}
                          {violation.is_health_based_ind === 'Y' && (
                            <Badge variant="destructive" className="text-xs">Health-Based</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 