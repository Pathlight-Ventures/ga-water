"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  FileText,
  Download,
  Search,
  FileSpreadsheet
} from 'lucide-react'

const reportTypes = [
  'Monthly Summary Page',
  'Monthly Summary Page Addendum',
  'Daily Surface Water Treatment Plant Operation Report Summary',
  'Monthly Surface Water Treatment Plant Operation Report for Turbidity',
  'Monthly Disinfectant/Oxidant Monitoring (Part 1)',
  'Monthly Disinfectant/Oxidant Monitoring (Part 2)',
  'Monthly Disinfectant/Oxidant Monitoring (Part 3)',
  'Monthly Disinfectant/Oxidant Monitoring (Part 4)',
  'Monthly Total Organic Carbon (TOC) Removal Report',
  'Ground Water (GW) Operation Report',
  'Surface Water Treatment Operation Report for Membrane Filtration',
  'CT Calculation (Giardia) Summary',
  'CT Calculation (Giardia)',
  'Virus Inactivation via Ozone Report',
  'Submission Exception Report'
]

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState('2025-11')
  const [selectedSystem, setSelectedSystem] = useState('atlanta')
  const [selectedReport, setSelectedReport] = useState('summary')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchField, setSearchField] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [selectedReports, setSelectedReports] = useState<string[]>([])

  const handleGenerateReport = () => {
    if (selectedReport === 'summary') {
      setShowSummary(true)
    } else {
      alert(`Generating ${selectedReport}...`)
    }
  }

  const handleExcelDownload = () => {
    // Simulate Excel file generation with calculations
    const excelData = {
      fileName: `Monthly_Summary_${selectedMonth}_${selectedSystem}.xlsx`,
      sheets: ['Summary', 'Addendum', 'Calculations'],
      calculations: {
        totals: sampleData.totalMonthlyFlow,
        averages: sampleData.averageDailyFlow,
        maximum: sampleData.maximumDailyFlow,
        minimum: sampleData.minimumDailyFlow,
        count: sampleData.daysReported
      }
    }
    alert(`Excel file "${excelData.fileName}" generated successfully!\n\nIncludes:\n- Totals: ${excelData.calculations.totals.toLocaleString()}\n- Averages: ${excelData.calculations.averages.toFixed(1)}\n- Maximum: ${excelData.calculations.maximum.toLocaleString()}\n- Minimum: ${excelData.calculations.minimum.toLocaleString()}\n- Count: ${excelData.calculations.count}`)
  }

  const handleBulkDownload = () => {
    if (selectedReports.length === 0) {
      alert('Please select at least one report')
      return
    }
    alert(`Downloading ${selectedReports.length} reports...`)
  }

  const toggleReportSelection = (report: string) => {
    if (selectedReports.includes(report)) {
      setSelectedReports(selectedReports.filter(r => r !== report))
    } else {
      setSelectedReports([...selectedReports, report])
    }
  }

  const sampleData = {
    totalMonthlyFlow: 5234567,
    averageDailyFlow: 174485.6,
    maximumDailyFlow: 198234,
    minimumDailyFlow: 152890,
    daysReported: 30,
    dateNoticeGAEPD: '2025-12-01',
    dateNoticeCustomer: '2025-12-02'
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">
            Generate, view, and download reports
          </p>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="generate">Generate Report</TabsTrigger>
            <TabsTrigger value="summary">Summary Page</TabsTrigger>
            <TabsTrigger value="addendum">Summary Addendum</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Download</TabsTrigger>
            <TabsTrigger value="historical">Historical Data</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Report</CardTitle>
                <CardDescription>
                  Select report type and parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="month">Month/Year *</Label>
                    <Input
                      id="month"
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="system">Water System *</Label>
                    <Select value={selectedSystem} onValueChange={setSelectedSystem} required>
                      <SelectTrigger id="system">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="atlanta">Atlanta Water Plant #1</SelectItem>
                        <SelectItem value="all">All Systems</SelectItem>
                        <SelectItem value="system2">Water System #2</SelectItem>
                        <SelectItem value="system3">Water System #3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="reportType">Report Type *</Label>
                    <Select value={selectedReport} onValueChange={setSelectedReport} required>
                      <SelectTrigger id="reportType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map((report, index) => (
                          <SelectItem key={index} value={report.toLowerCase().replace(/\s+/g, '-')}>
                            {report}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleGenerateReport} className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>

                {showSummary && (
                  <Card className="border-2">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Monthly Summary Page</CardTitle>
                        <Button onClick={handleExcelDownload}>
                          <Download className="w-4 h-4 mr-2" />
                          Download Excel
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Atlanta Water Plant #1 - November 2025</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Total Monthly Flow</p>
                            <p className="text-2xl font-bold">{sampleData.totalMonthlyFlow.toLocaleString()} gallons</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Average Daily Flow</p>
                            <p className="text-2xl font-bold">{sampleData.averageDailyFlow.toLocaleString(undefined, { maximumFractionDigits: 1 })} gallons</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Maximum Daily Flow</p>
                            <p className="text-2xl font-bold">{sampleData.maximumDailyFlow.toLocaleString()} gallons</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Minimum Daily Flow</p>
                            <p className="text-2xl font-bold">{sampleData.minimumDailyFlow.toLocaleString()} gallons</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Days Reported</p>
                            <p className="text-2xl font-bold">{sampleData.daysReported} days</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Monthly Summary Page</CardTitle>
                    <CardDescription>
                      Comprehensive monthly overview
                    </CardDescription>
                  </div>
                  <Button onClick={handleExcelDownload}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Download Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Atlanta Water Plant #1 - November 2025</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Monthly Flow</p>
                        <p className="text-2xl font-bold">{sampleData.totalMonthlyFlow.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">gallons</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Average Daily Flow</p>
                        <p className="text-2xl font-bold">{sampleData.averageDailyFlow.toLocaleString(undefined, { maximumFractionDigits: 1 })}</p>
                        <p className="text-xs text-gray-500">gallons</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Maximum Daily Flow</p>
                        <p className="text-2xl font-bold">{sampleData.maximumDailyFlow.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">gallons</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Minimum Daily Flow</p>
                        <p className="text-2xl font-bold">{sampleData.minimumDailyFlow.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">gallons</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Calculations</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="font-medium">{sampleData.totalMonthlyFlow.toLocaleString()} gallons</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Average</p>
                          <p className="font-medium">{sampleData.averageDailyFlow.toLocaleString(undefined, { maximumFractionDigits: 1 })} gallons</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Maximum</p>
                          <p className="font-medium">{sampleData.maximumDailyFlow.toLocaleString()} gallons</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Minimum</p>
                          <p className="font-medium">{sampleData.minimumDailyFlow.toLocaleString()} gallons</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Count</p>
                          <p className="font-medium">{sampleData.daysReported} days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addendum" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Monthly Summary Page Addendum</CardTitle>
                    <CardDescription>
                      Additional detailed information
                    </CardDescription>
                  </div>
                  <Button onClick={handleExcelDownload}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Download Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search (e.g., 'Date of Notice to GAEPD')..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={searchField} onValueChange={setSearchField}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select field to search" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dateNoticeGAEPD">Date of Notice to GAEPD</SelectItem>
                        <SelectItem value="dateNoticeCustomer">Date of Notice to Customer</SelectItem>
                        <SelectItem value="violationDate">Violation Date</SelectItem>
                        <SelectItem value="complianceDate">Compliance Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Atlanta Water Plant #1 - November 2025 Addendum</h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Date of Notice to GAEPD</p>
                          <p className="font-medium">{sampleData.dateNoticeGAEPD}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date of Notice to Customer</p>
                          <p className="font-medium">{sampleData.dateNoticeCustomer}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Violation Date</p>
                          <p className="font-medium">2025-11-15</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Compliance Date</p>
                          <p className="font-medium">2025-11-20</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Download</CardTitle>
                <CardDescription>
                  Select multiple reports to download
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulkMonth">Month/Year *</Label>
                    <Input
                      id="bulkMonth"
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulkSystem">Water System *</Label>
                    <Select value={selectedSystem} onValueChange={setSelectedSystem} required>
                      <SelectTrigger id="bulkSystem">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="atlanta">Atlanta Water Plant #1</SelectItem>
                        <SelectItem value="system2">Water System #2</SelectItem>
                        <SelectItem value="system3">Water System #3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-4">
                    <Label>Select Reports to Download</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (selectedReports.length === reportTypes.length) {
                          setSelectedReports([])
                        } else {
                          setSelectedReports(reportTypes)
                        }
                      }}
                    >
                      {selectedReports.length === reportTypes.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {reportTypes.map((report, index) => (
                        <label key={index} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedReports.includes(report)}
                            onChange={() => toggleReportSelection(report)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className="text-sm">{report}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleBulkDownload} 
                  className="w-full"
                  disabled={selectedReports.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download {selectedReports.length > 0 ? `${selectedReports.length} ` : ''}Reports as Excel
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historical" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Historical Data Viewing</CardTitle>
                    <CardDescription>
                      View reports and data from the past 4 years
                    </CardDescription>
                  </div>
                  <Button onClick={handleExcelDownload}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Download Historical Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="historicalYearFrom">From Year</Label>
                      <Select defaultValue="2021">
                        <SelectTrigger id="historicalYearFrom">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2021">2021</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="historicalYearTo">To Year</Label>
                      <Select defaultValue="2025">
                        <SelectTrigger id="historicalYearTo">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2021">2021</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-blue-50">
                    <h4 className="font-medium mb-2">Historical Data Available</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      The system maintains 12 years of historical data as required by regulations. You can view and download reports from any period within this range.
                    </p>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">2021 Reports</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">2022 Reports</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">2023 Reports</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">2024 Reports</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Recent Historical Reports</h4>
                    {[
                      { year: 2024, month: 'December', system: 'Atlanta Water Plant #1', status: 'Complete' },
                      { year: 2024, month: 'November', system: 'Atlanta Water Plant #1', status: 'Complete' },
                      { year: 2024, month: 'October', system: 'Atlanta Water Plant #1', status: 'Complete' },
                      { year: 2023, month: 'December', system: 'Atlanta Water Plant #1', status: 'Complete' },
                    ].map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div>
                          <h5 className="font-medium">{report.month} {report.year} - {report.system}</h5>
                          <p className="text-sm text-gray-600">Monthly Summary Report</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className="bg-green-100 text-green-800">{report.status}</Badge>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleExcelDownload}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
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

