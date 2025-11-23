'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ChevronDown, MessageCircle, MapPin, Building2, Activity } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/AuthContext'

export default function Home() {
  const { isAuthenticated, isApproved } = useAuth()
  const [address, setAddress] = useState('')
  const [searchMode, setSearchMode] = useState<'address' | 'system'>('address')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [advanced, setAdvanced] = useState({
    waterSystemNo: '',
    waterSystemName: '',
    county: '',
    systemType: '',
    sourceType: '',
    contactType: '',
    sampleClass: '',
    dateFrom: '',
    dateTo: '',
  })
  const [results, setResults] = useState<unknown[] | null>(null)
  type WaterQualitySystem = { pwsid: string; id?: string; pws_name?: string; compliance_status?: string; complianceStatus?: string; last_test_date?: string; lastTestDate?: string; violations?: number; violationCount?: number; system_type?: string; pws_type_code?: string; source_type?: string; primary_source_code?: string; mcl_exceedances?: string[]; county_served?: string }
  const [waterQualityData, setWaterQualityData] = useState<WaterQualitySystem[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Example dropdown options (replace with real data as needed)
  const counties = ['All', 'Fulton', 'DeKalb', 'Cobb', 'Gwinnett']
  const systemTypes = ['All', 'CWS', 'TNCWS', 'NTNCWS']
  const sourceTypes = ['All', 'GW', 'SW', 'GU']
  const contactTypes = ['None', 'Owner', 'Operator', 'Administrative']
  const sampleClasses = ['All', 'Routine', 'Check', 'Repeat']

  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address.trim()) {
      setError('Please enter an address')
      return
    }
    
    setLoading(true)
    setError('')
    setResults(null)
    setWaterQualityData(null)
    
    try {
      // In a real implementation, this would geocode the address and find nearby water systems
      // For prototype, we'll search by address string and return mock data
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search: address,
          ...advanced,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setResults(data.results)
        // Mock water quality data for the found water systems
        if (data.results && data.results.length > 0) {
          setWaterQualityData(data.results.map((system: Record<string, unknown>) => ({
            ...system,
            lastTestDate: new Date().toISOString().split('T')[0],
            complianceStatus: 'Compliant',
            violationCount: 0,
          })))
        }
      } else {
        setError(data.error || 'Search failed')
      }
    } catch {
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSystemSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResults(null)
    setWaterQualityData(null)
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search: advanced.waterSystemName || advanced.waterSystemNo,
          ...advanced,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setResults(data.results)
      } else {
        setError(data.error || 'Search failed')
      }
    } catch {
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FCFCFC] flex flex-col">
      {/* Main Content */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {isAuthenticated && isApproved ? (
          <>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-4 leading-tight">
              Welcome to the Compliance Portal
            </h1>
            <p className="text-lg text-gray-600 text-center mb-8 max-w-xl">
              Access your dashboard, reports, and compliance tools.
            </p>
            <Link href="/dashboard">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-6 text-lg">
                <Activity className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-4 leading-tight">
              Check Your Water Quality
            </h1>
            <p className="text-lg text-gray-600 text-center mb-8 max-w-xl">
              Enter your address to find water quality data for your area.
            </p>
          </>
        )}

        <Card className="w-full max-w-2xl mx-auto p-6 rounded-2xl shadow-sm">
          {/* Search Mode Toggle */}
          <div className="flex gap-2 mb-4 border-b border-gray-200 pb-4">
            <Button
              type="button"
              variant={searchMode === 'address' ? 'default' : 'ghost'}
              className={searchMode === 'address' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
              onClick={() => {
                setSearchMode('address')
                setResults(null)
                setWaterQualityData(null)
                setError('')
              }}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Search by Address
            </Button>
            <Button
              type="button"
              variant={searchMode === 'system' ? 'default' : 'ghost'}
              className={searchMode === 'system' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
              onClick={() => {
                setSearchMode('system')
                setResults(null)
                setWaterQualityData(null)
                setError('')
              }}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Search by Water System
            </Button>
          </div>

          {/* Address Search Form */}
          {searchMode === 'address' ? (
            <form onSubmit={handleAddressSearch} className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter your address (e.g., 123 Main St, Atlanta, GA 30309)"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="flex-1 text-base"
                  autoFocus
                />
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6" disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
            </form>
          ) : (
            /* System Search Form */
            <form onSubmit={handleSystemSearch} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search by Water System Name or ID..."
                  value={advanced.waterSystemName || advanced.waterSystemNo}
                  onChange={e => setAdvanced(a => ({ ...a, waterSystemName: e.target.value, waterSystemNo: e.target.value }))}
                  className="flex-1 text-base"
                  autoFocus
                />
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6" disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
              <button
                type="button"
                className="text-orange-600 text-sm font-semibold flex items-center gap-1 mt-1 hover:underline w-fit"
                onClick={() => setShowAdvanced(v => !v)}
              >
                Advanced Search <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>
            {showAdvanced && (
              <div className="mt-2 bg-orange-50 rounded-lg p-4 flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="waterSystemNo">Water System No.</Label>
                    <Input
                      id="waterSystemNo"
                      value={advanced.waterSystemNo}
                      onChange={e => setAdvanced(a => ({ ...a, waterSystemNo: e.target.value }))}
                      placeholder="Enter system number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="waterSystemName">Water System Name</Label>
                    <Input
                      id="waterSystemName"
                      value={advanced.waterSystemName}
                      onChange={e => setAdvanced(a => ({ ...a, waterSystemName: e.target.value }))}
                      placeholder="Enter system name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="county">Principal County Served</Label>
                    <Select
                      value={advanced.county}
                      onValueChange={value => setAdvanced(a => ({ ...a, county: value }))}
                    >
                      <SelectTrigger id="county">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        {counties.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="systemType">Water System Type</Label>
                    <Select
                      value={advanced.systemType}
                      onValueChange={value => setAdvanced(a => ({ ...a, systemType: value }))}
                    >
                      <SelectTrigger id="systemType">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        {systemTypes.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sourceType">Primary Source Water Type</Label>
                    <Select
                      value={advanced.sourceType}
                      onValueChange={value => setAdvanced(a => ({ ...a, sourceType: value }))}
                    >
                      <SelectTrigger id="sourceType">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceTypes.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="contactType">Point of Contact Type</Label>
                    <Select
                      value={advanced.contactType}
                      onValueChange={value => setAdvanced(a => ({ ...a, contactType: value }))}
                    >
                      <SelectTrigger id="contactType">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        {contactTypes.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sampleClass">Sample Class</Label>
                    <Select
                      value={advanced.sampleClass}
                      onValueChange={value => setAdvanced(a => ({ ...a, sampleClass: value }))}
                    >
                      <SelectTrigger id="sampleClass">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleClasses.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Sample Collection Date Range</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="date"
                        value={advanced.dateFrom}
                        onChange={e => setAdvanced(a => ({ ...a, dateFrom: e.target.value }))}
                        className="w-full"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="date"
                        value={advanced.dateTo}
                        onChange={e => setAdvanced(a => ({ ...a, dateTo: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
              {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            </form>
          )}

          {showAdvanced && searchMode === 'system' && (
            <div className="mt-4 bg-orange-50 rounded-lg p-4 flex flex-col gap-4 border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="waterSystemNo">Water System No.</Label>
                  <Input
                    id="waterSystemNo"
                    value={advanced.waterSystemNo}
                    onChange={e => setAdvanced(a => ({ ...a, waterSystemNo: e.target.value }))}
                    placeholder="Enter system number"
                  />
                </div>
                <div>
                  <Label htmlFor="waterSystemName">Water System Name</Label>
                  <Input
                    id="waterSystemName"
                    value={advanced.waterSystemName}
                    onChange={e => setAdvanced(a => ({ ...a, waterSystemName: e.target.value }))}
                    placeholder="Enter system name"
                  />
                </div>
                <div>
                  <Label htmlFor="county">Principal County Served</Label>
                  <Select
                    value={advanced.county}
                    onValueChange={value => setAdvanced(a => ({ ...a, county: value }))}
                  >
                    <SelectTrigger id="county">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      {counties.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="systemType">Water System Type</Label>
                  <Select
                    value={advanced.systemType}
                    onValueChange={value => setAdvanced(a => ({ ...a, systemType: value }))}
                  >
                    <SelectTrigger id="systemType">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      {systemTypes.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Water Quality Results - Address Search */}
        {waterQualityData && searchMode === 'address' && (
          <div className="w-full max-w-4xl mx-auto mt-8">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Water Quality Data for Your Area</h2>
              <div className="space-y-4">
                {waterQualityData.map((system: WaterQualitySystem) => (
                  <Card key={system.pwsid || system.id} className="p-4 border-l-4 border-l-orange-500">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{system.pws_name || 'Water System'}</h3>
                        <p className="text-sm text-gray-600">PWSID: {system.pwsid || system.id}</p>
                        {system.county_served && (
                          <p className="text-sm text-gray-600">County: {system.county_served}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          system.complianceStatus === 'Compliant' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {system.complianceStatus}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Last Test Date</p>
                        <p className="text-sm font-semibold">{system.lastTestDate || system.last_test_date || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Violations</p>
                        <p className="text-sm font-semibold">{system.violationCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">System Type</p>
                        <p className="text-sm font-semibold">{system.pws_type_code || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Water Source</p>
                        <p className="text-sm font-semibold">{system.primary_source_code || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link href={`/map?pwsid=${system.pwsid || system.id}`}>
                        <Button variant="outline" size="sm" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                          View on Map
                        </Button>
                      </Link>
                      <Link href={`/compliance?pwsid=${system.pwsid || system.id}`}>
                        <Button variant="outline" size="sm" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                          View Compliance
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* System Search Results */}
        {results && searchMode === 'system' && (
          <div className="w-full max-w-2xl mx-auto mt-8">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-2">Search Results</h2>
              {results.length === 0 ? (
                <div className="text-gray-500">No results found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-2 py-1 text-left">PWSID</th>
                        <th className="px-2 py-1 text-left">Name</th>
                        <th className="px-2 py-1 text-left">County</th>
                        <th className="px-2 py-1 text-left">Type</th>
                        <th className="px-2 py-1 text-left">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((row) => {
                        const r = row as {
                          pwsid: string;
                          pws_name?: string;
                          county_served?: string;
                          pws_type_code?: string;
                          primary_source_code?: string;
                        }
                        return (
                          <tr key={r.pwsid} className="border-b hover:bg-gray-50">
                            <td className="px-2 py-1 font-mono">{r.pwsid}</td>
                            <td className="px-2 py-1">{r.pws_name}</td>
                            <td className="px-2 py-1">{r.county_served || '-'}</td>
                            <td className="px-2 py-1">{r.pws_type_code}</td>
                            <td className="px-2 py-1">{r.primary_source_code}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}
      </section>

      {/* Floating Chat Button */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg focus:outline-none"
        aria-label="Open chat"
        // TODO: Add chat open handler
      >
        <MessageCircle className="w-7 h-7" />
      </button>
    </main>
  )
}
