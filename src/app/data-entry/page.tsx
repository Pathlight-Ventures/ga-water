"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  FileText,
  Save,
  CheckCircle
} from 'lucide-react'

interface ReportForm {
  id: string
  name: string
  type: 'daily' | 'monthly'
  description: string
}

const reportForms: ReportForm[] = [
  {
    id: 'daily-surface',
    name: 'Daily Surface Water Treatment Plant Operation Report',
    type: 'daily',
    description: 'Daily operational data for surface water treatment plants'
  },
  {
    id: 'monthly-turbidity',
    name: 'Monthly Surface Water Treatment Plant Operation Report for Turbidity',
    type: 'monthly',
    description: 'Monthly turbidity monitoring and reporting'
  },
  {
    id: 'disinfectant-1',
    name: 'Monthly Disinfectant/Oxidant Monitoring (Part 1 - Chlorine)',
    type: 'monthly',
    description: 'Chlorine monitoring at entry point and distribution system'
  },
  {
    id: 'disinfectant-2',
    name: 'Monthly Disinfectant/Oxidant Monitoring (Part 2 - Chlorine Dioxide)',
    type: 'monthly',
    description: 'Chlorine dioxide monitoring and reporting'
  },
  {
    id: 'disinfectant-3',
    name: 'Monthly Disinfectant/Oxidant Monitoring (Part 3 - Chlorite)',
    type: 'monthly',
    description: 'Chlorite monitoring for systems using chlorine dioxide'
  },
  {
    id: 'disinfectant-4',
    name: 'Monthly Disinfectant/Oxidant Monitoring (Part 4 - Bromate)',
    type: 'monthly',
    description: 'Bromate monitoring for systems using ozone'
  },
  {
    id: 'toc-removal',
    name: 'Monthly Total Organic Carbon (TOC) Removal Report',
    type: 'monthly',
    description: 'TOC removal monitoring and reporting'
  },
  {
    id: 'groundwater',
    name: 'Ground Water (GW) Operation Report',
    type: 'monthly',
    description: 'Groundwater system operational data'
  },
  {
    id: 'membrane-filtration',
    name: 'Surface Water Treatment Operation Report for Membrane Filtration',
    type: 'monthly',
    description: 'Membrane filtration system monitoring'
  },
  {
    id: 'ct-giardia-summary',
    name: 'CT Calculation (Giardia) Summary',
    type: 'monthly',
    description: 'CT value summary for Giardia removal'
  },
  {
    id: 'ct-giardia',
    name: 'CT Calculation (Giardia)',
    type: 'monthly',
    description: 'Detailed CT calculations for Giardia removal'
  },
  {
    id: 'virus-ozone',
    name: 'Virus Inactivation via Ozone Report',
    type: 'monthly',
    description: 'Virus inactivation monitoring for ozone systems'
  }
]

export default function DataEntryPage() {
  const [selectedForm, setSelectedForm] = useState<string>('daily-surface')
  const [selectedMonth, setSelectedMonth] = useState('2025-11')
  const [selectedSystem, setSelectedSystem] = useState('atlanta')
  const [formData, setFormData] = useState<Record<string, string | number>>({})
  const [saved, setSaved] = useState(false)

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    // Simulate save
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    alert('Data saved successfully!')
  }

  const renderDailySurfaceForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date || ''}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dailyFlow">Daily Flow (gallons) *</Label>
          <Input
            id="dailyFlow"
            type="number"
            value={formData.dailyFlow || ''}
            onChange={(e) => handleInputChange('dailyFlow', e.target.value)}
            placeholder="150000"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rawWaterTurbidity">Raw Water Turbidity (NTU)</Label>
          <Input
            id="rawWaterTurbidity"
            type="number"
            step="0.01"
            value={formData.rawWaterTurbidity || ''}
            onChange={(e) => handleInputChange('rawWaterTurbidity', e.target.value)}
            placeholder="2.5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="finishedWaterTurbidity">Finished Water Turbidity (NTU) *</Label>
          <Input
            id="finishedWaterTurbidity"
            type="number"
            step="0.01"
            value={formData.finishedWaterTurbidity || ''}
            onChange={(e) => handleInputChange('finishedWaterTurbidity', e.target.value)}
            placeholder="0.15"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="chlorineResidual">Chlorine Residual (mg/L) *</Label>
          <Input
            id="chlorineResidual"
            type="number"
            step="0.01"
            value={formData.chlorineResidual || ''}
            onChange={(e) => handleInputChange('chlorineResidual', e.target.value)}
            placeholder="0.5"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="filterBackwash">Filter Backwash (Yes/No)</Label>
          <Select 
            value={String(formData.filterBackwash || '')} 
            onValueChange={(value) => handleInputChange('filterBackwash', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Additional notes..."
          />
        </div>
      </div>
    </div>
  )

  const renderMonthlyTurbidityForm = () => (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg bg-blue-50">
        <p className="text-sm text-gray-600">
          Enter daily turbidity readings for the selected month. The system will calculate monthly averages, maximums, and minimums.
        </p>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
          <div key={day} className="grid grid-cols-4 gap-4 items-center">
            <div className="font-medium">Day {day}</div>
            <div className="space-y-2">
              <Label htmlFor={`turbidity-${day}`}>Turbidity (NTU)</Label>
              <Input
                id={`turbidity-${day}`}
                type="number"
                step="0.01"
                value={formData[`turbidity-${day}`] || ''}
                onChange={(e) => handleInputChange(`turbidity-${day}`, e.target.value)}
                placeholder="0.15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`flow-${day}`}>Flow (gallons)</Label>
              <Input
                id={`flow-${day}`}
                type="number"
                value={formData[`flow-${day}`] || ''}
                onChange={(e) => handleInputChange(`flow-${day}`, e.target.value)}
                placeholder="150000"
              />
            </div>
            <div>
              {formData[`turbidity-${day}`] && parseFloat(String(formData[`turbidity-${day}`])) > 0.3 && (
                <Badge className="bg-red-100 text-red-800">Exceedance</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border rounded-lg bg-gray-50">
        <h4 className="font-semibold mb-2">Calculated Values</h4>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Average Turbidity</p>
            <p className="text-lg font-bold">0.18 NTU</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Maximum Turbidity</p>
            <p className="text-lg font-bold">0.32 NTU</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Minimum Turbidity</p>
            <p className="text-lg font-bold">0.12 NTU</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Days Reported</p>
            <p className="text-lg font-bold">30</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDisinfectantForm = () => (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg bg-blue-50">
        <p className="text-sm text-gray-600">
          Enter disinfectant/oxidant monitoring data for the month. Report values at entry point and in distribution system.
        </p>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
          <div key={day} className="grid grid-cols-5 gap-4 items-center border-b pb-4">
            <div className="font-medium">Day {day}</div>
            <div className="space-y-2">
              <Label htmlFor={`entry-chlorine-${day}`}>Entry Point (mg/L)</Label>
              <Input
                id={`entry-chlorine-${day}`}
                type="number"
                step="0.01"
                value={formData[`entry-chlorine-${day}`] || ''}
                onChange={(e) => handleInputChange(`entry-chlorine-${day}`, e.target.value)}
                placeholder="0.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`dist-chlorine-${day}`}>Distribution (mg/L)</Label>
              <Input
                id={`dist-chlorine-${day}`}
                type="number"
                step="0.01"
                value={formData[`dist-chlorine-${day}`] || ''}
                onChange={(e) => handleInputChange(`dist-chlorine-${day}`, e.target.value)}
                placeholder="0.3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`contact-time-${day}`}>Contact Time (minutes)</Label>
              <Input
                id={`contact-time-${day}`}
                type="number"
                step="0.1"
                value={formData[`contact-time-${day}`] || ''}
                onChange={(e) => handleInputChange(`contact-time-${day}`, e.target.value)}
                placeholder="30"
              />
            </div>
            <div>
              {formData[`dist-chlorine-${day}`] && parseFloat(String(formData[`dist-chlorine-${day}`])) < 0.2 && (
                <Badge className="bg-red-100 text-red-800">Below Limit</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderFormContent = () => {
    switch (selectedForm) {
      case 'daily-surface':
        return renderDailySurfaceForm()
      case 'monthly-turbidity':
        return renderMonthlyTurbidityForm()
      case 'disinfectant-1':
      case 'disinfectant-2':
      case 'disinfectant-3':
      case 'disinfectant-4':
        return renderDisinfectantForm()
      default:
        return (
          <div className="p-8 text-center text-gray-500">
            Select a report form to begin data entry
          </div>
        )
    }
  }

  const selectedFormData = reportForms.find(f => f.id === selectedForm)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Entry</h1>
          <p className="text-gray-600">
            Enter daily and monthly operational data for your water system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Form Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Report Forms</CardTitle>
                <CardDescription>Select a form to fill out</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportForms.map(form => (
                    <button
                      key={form.id}
                      onClick={() => setSelectedForm(form.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedForm === form.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium text-sm">{form.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {form.type}
                      </Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedFormData?.name || 'Select a Form'}</CardTitle>
                    <CardDescription>{selectedFormData?.description || ''}</CardDescription>
                  </div>
                  {saved && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Saved
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 mb-6">
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
                          <SelectItem value="system2">Water System #2</SelectItem>
                          <SelectItem value="system3">Water System #3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  {renderFormContent()}
                </div>

                <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                  <Button variant="outline">Save Draft</Button>
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save & Submit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

