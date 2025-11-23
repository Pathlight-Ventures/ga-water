"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Download,
  FileSpreadsheet,
  CheckCircle,
  RefreshCw,
  Search,
  Database
} from 'lucide-react'
import Link from 'next/link'

interface Export {
  id: string
  date: string
  month: string
  year: string
  waterSystems: string
  format: string
  status: 'completed' | 'pending' | 'failed'
  fileName: string
  downloadedBy: string
}

const mockExports: Export[] = [
  {
    id: '1',
    date: '2025-12-01',
    month: 'November',
    year: '2025',
    waterSystems: 'All Systems (106)',
    format: 'CSV',
    status: 'completed',
    fileName: 'sdwis_export_nov_2025.csv',
    downloadedBy: 'Admin User'
  },
  {
    id: '2',
    date: '2025-11-01',
    month: 'October',
    year: '2025',
    waterSystems: 'Atlanta Water Plant #1',
    format: 'CSV',
    status: 'completed',
    fileName: 'sdwis_export_oct_2025_atlanta.csv',
    downloadedBy: 'Inspector John Doe'
  }
]

export default function DataExchangePage() {
  const [selectedMonth, setSelectedMonth] = useState('2025-11')
  const [selectedSystem, setSelectedSystem] = useState('all')
  const [exportFormat, setExportFormat] = useState('csv')
  const [exports, setExports] = useState<Export[]>(mockExports)
  const [exporting, setExporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleGenerateExport = async () => {
    setExporting(true)
    // Simulate export generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newExport: Export = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      month: new Date(selectedMonth).toLocaleString('default', { month: 'long' }),
      year: selectedMonth.split('-')[0],
      waterSystems: selectedSystem === 'all' ? 'All Systems (106)' : 'Atlanta Water Plant #1',
      format: exportFormat.toUpperCase(),
      status: 'completed',
      fileName: `sdwis_export_${selectedMonth}_${selectedSystem}.csv`,
      downloadedBy: 'Current User'
    }
    
    setExports([newExport, ...exports])
    setExporting(false)
    alert('Export generated successfully!')
  }

  const handleDownload = (exportId: string) => {
    const exportItem = exports.find(e => e.id === exportId)
    if (exportItem) {
      alert(`Downloading ${exportItem.fileName}...`)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return null
    }
  }

  const filteredExports = exports.filter(exp => {
    return !searchTerm || 
      exp.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.year.includes(searchTerm) ||
      exp.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Exchange / Data Sharing</h1>
          <p className="text-gray-600">
            Export data to SDWIS and other external systems
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>SDWIS Export</CardTitle>
              <CardDescription>
                Generate CSV files for SDWIS/LabToState conversion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="exportMonth">Month/Year *</Label>
                  <Input
                    id="exportMonth"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exportSystem">Water Systems *</Label>
                  <Select value={selectedSystem} onValueChange={setSelectedSystem} required>
                    <SelectTrigger id="exportSystem">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Systems (106)</SelectItem>
                      <SelectItem value="atlanta">Atlanta Water Plant #1</SelectItem>
                      <SelectItem value="system2">Water System #2</SelectItem>
                      <SelectItem value="system3">Water System #3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exportFormat">Export Format *</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat} required>
                    <SelectTrigger id="exportFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (for SDWIS/LabToState)</SelectItem>
                      <SelectItem value="xml">XML (Direct SDWIS format)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    CSV format compatible with SDWIS/LabToState conversion tool
                  </p>
                </div>

                <Button 
                  onClick={handleGenerateExport} 
                  className="w-full"
                  disabled={exporting}
                >
                  {exporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating Export...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Export
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Information</CardTitle>
              <CardDescription>
                SDWIS integration details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <h4 className="font-medium mb-2">SDWIS Integration</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Monthly data export in CSV format</li>
                  <li>• Compatible with SDWIS/LabToState conversion tool</li>
                  <li>• CSV converted to XML for SDWIS import</li>
                  <li>• All required SDWIS fields included</li>
                  <li>• Data validation before export</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium">Export Process</h4>
                </div>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Select month and water systems</li>
                  <li>2. Generate CSV export</li>
                  <li>3. Download CSV file</li>
                  <li>4. Use SDWIS/LabToState tool to convert to XML</li>
                  <li>5. Import XML into SDWIS</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Labworks Integration</CardTitle>
                <CardDescription>
                  Import and export data with Labworks Laboratory Information System
                </CardDescription>
              </div>
              <Link href="/data-exchange/labworks">
                <Button variant="outline">
                  <Database className="w-4 h-4 mr-2" />
                  Manage Labworks Integration
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-blue-50">
              <p className="text-sm text-gray-600">
                The system integrates with Labworks Laboratory Information System v6.10 for automated import and export of laboratory test results and compliance data.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Export History</CardTitle>
                <CardDescription>
                  View past SDWIS exports
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search exports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredExports.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No exports found
                </div>
              ) : (
                filteredExports.map(exp => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <FileSpreadsheet className="w-8 h-8 text-green-600" />
                      <div>
                        <h4 className="font-medium">{exp.fileName}</h4>
                        <div className="flex gap-4 text-sm text-gray-600 mt-1">
                          <span>{exp.month} {exp.year}</span>
                          <span>•</span>
                          <span>{exp.waterSystems}</span>
                          <span>•</span>
                          <span>{exp.format} Format</span>
                          <span>•</span>
                          <span>Exported by: {exp.downloadedBy}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {exp.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(exp.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(exp.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

