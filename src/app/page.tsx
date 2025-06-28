'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ChevronDown, MessageCircle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export default function Home() {
  const [search, setSearch] = useState('')
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Example dropdown options (replace with real data as needed)
  const counties = ['All', 'Fulton', 'DeKalb', 'Cobb', 'Gwinnett']
  const systemTypes = ['All', 'CWS', 'TNCWS', 'NTNCWS']
  const sourceTypes = ['All', 'GW', 'SW', 'GU']
  const contactTypes = ['None', 'Owner', 'Operator', 'Administrative']
  const sampleClasses = ['All', 'Routine', 'Check', 'Repeat']

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResults(null)
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search,
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
      <section className="flex-1 flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-4 leading-tight">
          Georgia&apos;s Source for Water Quality
        </h1>
        <p className="text-lg text-gray-600 text-center mb-8 max-w-xl">
          Search by water system, county, or ID to find the latest public data.
        </p>

        <Card className="w-full max-w-2xl mx-auto p-6 rounded-2xl shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search by Water System Name or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
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
        </Card>
        {/* Results Table */}
        {results && (
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
                          <tr key={r.pwsid} className="border-b">
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
