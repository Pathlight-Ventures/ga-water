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
  Upload,
  RefreshCw,
  FileSpreadsheet,
  Database
} from 'lucide-react'

interface LabworksSync {
  id: string
  date: string
  type: 'import' | 'export'
  status: 'completed' | 'pending' | 'failed'
  records: number
  fileName: string
}

const mockSyncs: LabworksSync[] = [
  {
    id: '1',
    date: '2025-11-15',
    type: 'import',
    status: 'completed',
    records: 245,
    fileName: 'labworks_import_2025-11-15.csv'
  },
  {
    id: '2',
    date: '2025-11-14',
    type: 'export',
    status: 'completed',
    records: 180,
    fileName: 'labworks_export_2025-11-14.csv'
  },
  {
    id: '3',
    date: '2025-11-13',
    type: 'import',
    status: 'failed',
    records: 0,
    fileName: 'labworks_import_2025-11-13.csv'
  }
]

export default function LabworksPage() {
  const [selectedMonth, setSelectedMonth] = useState('2025-11')
  const [selectedSystem, setSelectedSystem] = useState('all')
  const [syncing, setSyncing] = useState(false)
  const [syncs] = useState<LabworksSync[]>(mockSyncs)

  const handleImport = async () => {
    setSyncing(true)
    alert('Importing data from Labworks Laboratory Information System v6.10...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSyncing(false)
    alert('Import completed successfully! 245 records imported.')
  }

  const handleExport = async () => {
    setSyncing(true)
    alert('Exporting data to Labworks Laboratory Information System v6.10...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSyncing(false)
    alert('Export completed successfully! 180 records exported.')
  }

  const handleScheduledSync = () => {
    alert('Scheduled synchronization configured. The system will automatically sync with Labworks daily at 2:00 AM.')
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Labworks Integration</h1>
          <p className="text-gray-600">
            Import and export data with Labworks Laboratory Information System v6.10
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Import Card */}
          <Card>
            <CardHeader>
              <CardTitle>Import from Labworks</CardTitle>
              <CardDescription>
                Import laboratory test results from Labworks LIS v6.10
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="importMonth">Month/Year</Label>
                  <Input
                    id="importMonth"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="importSystem">Water System</Label>
                  <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                    <SelectTrigger id="importSystem">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Systems</SelectItem>
                      <SelectItem value="atlanta">Atlanta Water Plant #1</SelectItem>
                      <SelectItem value="system2">Water System #2</SelectItem>
                      <SelectItem value="system3">Water System #3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleImport} 
                className="w-full"
                disabled={syncing}
              >
                {syncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import from Labworks
                  </>
                )}
              </Button>
              <div className="p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium">Import Process</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Connects to Labworks LIS v6.10</li>
                  <li>• Retrieves laboratory test results</li>
                  <li>• Validates and maps data fields</li>
                  <li>• Imports into compliance system</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Export Card */}
          <Card>
            <CardHeader>
              <CardTitle>Export to Labworks</CardTitle>
              <CardDescription>
                Export compliance data to Labworks LIS v6.10
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="exportMonth">Month/Year</Label>
                  <Input
                    id="exportMonth"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exportSystem">Water System</Label>
                  <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                    <SelectTrigger id="exportSystem">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Systems</SelectItem>
                      <SelectItem value="atlanta">Atlanta Water Plant #1</SelectItem>
                      <SelectItem value="system2">Water System #2</SelectItem>
                      <SelectItem value="system3">Water System #3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleExport} 
                className="w-full"
                disabled={syncing}
                variant="outline"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export to Labworks
                  </>
                )}
              </Button>
              <div className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium">Export Process</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Formats data for Labworks LIS v6.10</li>
                  <li>• Validates data integrity</li>
                  <li>• Exports to Labworks system</li>
                  <li>• Confirms successful transfer</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Labworks LIS v6.10 Integration</CardTitle>
            <CardDescription>
              Automated data synchronization with Labworks Laboratory Information System
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium">Integration Details</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  The system integrates with Labworks Laboratory Information System version 6.10 to automatically import laboratory test results and export compliance data. This ensures seamless data flow between systems.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Supported Operations</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Import laboratory test results</li>
                      <li>• Export compliance data</li>
                      <li>• Automated synchronization</li>
                      <li>• Data validation and mapping</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Data Formats</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• CSV format for import/export</li>
                      <li>• XML format support</li>
                      <li>• Real-time API integration</li>
                      <li>• Scheduled batch processing</li>
                    </ul>
                  </div>
                </div>
              </div>
              <Button onClick={handleScheduledSync} variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Configure Scheduled Synchronization
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sync History */}
        <Card>
          <CardHeader>
            <CardTitle>Synchronization History</CardTitle>
            <CardDescription>
              View past import and export operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {syncs.map(sync => (
                <div
                  key={sync.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      sync.type === 'import' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {sync.type === 'import' ? (
                        <Upload className={`w-5 h-5 ${
                          sync.status === 'completed' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      ) : (
                        <Download className={`w-5 h-5 ${
                          sync.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {sync.type === 'import' ? 'Import from Labworks' : 'Export to Labworks'}
                      </h4>
                      <p className="text-sm text-gray-600">{sync.fileName}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500">
                          {sync.records} records • {sync.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(sync.status)}
                    {sync.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

