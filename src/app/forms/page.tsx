"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  FileText,
  Plus,
  Edit,
  Printer,
  Send,
  Settings,
  FileCheck,
  CheckCircle
} from 'lucide-react'

interface Template {
  id: string
  name: string
  type: string
  description: string
  mergeFields: string[]
}

interface WorkflowRule {
  id: string
  name: string
  trigger: string
  action: string
  enabled: boolean
}

const mergeFields = [
  '{{water_system_name}}',
  '{{date_of_violation}}',
  '{{parameter_name}}',
  '{{measured_value}}',
  '{{mcl_limit}}',
  '{{contact_name}}',
  '{{current_date}}',
  '{{system_id}}',
  '{{facility_name}}',
  '{{report_month}}',
  '{{report_year}}'
]

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Violation Notice Letter',
    type: 'letter',
    description: 'Standard violation notice letter',
    mergeFields: ['{{water_system_name}}', '{{date_of_violation}}', '{{parameter_name}}', '{{measured_value}}', '{{mcl_limit}}']
  },
  {
    id: '2',
    name: 'Compliance Certificate',
    type: 'certificate',
    description: 'Compliance certification document',
    mergeFields: ['{{water_system_name}}', '{{current_date}}', '{{system_id}}']
  }
]

const mockWorkflowRules: WorkflowRule[] = [
  {
    id: '1',
    name: 'Auto-generate violation notice on MCL exceedance',
    trigger: 'MCL exceedance detected',
    action: 'Generate Violation Notice Letter',
    enabled: true
  },
  {
    id: '2',
    name: 'Auto-generate compliance letter on report submission',
    trigger: 'Report submitted',
    action: 'Generate Compliance Letter',
    enabled: true
  }
]

export default function FormsPage() {
  const [templates] = useState<Template[]>(mockTemplates)
  const [workflowRules] = useState<WorkflowRule[]>(mockWorkflowRules)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [templateContent, setTemplateContent] = useState('')
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [distributionMethod, setDistributionMethod] = useState<'email' | 'print' | 'both'>('both')

  const handleInsertMergeField = (field: string) => {
    setTemplateContent(templateContent + field + ' ')
  }

  const handleGenerateDocument = () => {
    if (!selectedTemplate) return
    alert('Document generated successfully!')
  }

  const handleDistribute = () => {
    alert(`Document distributed via ${distributionMethod}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forms Management</h1>
          <p className="text-gray-600">
            Create, manage, and distribute forms and documents
          </p>
        </div>

        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="merge-fields">Merge Fields</TabsTrigger>
            <TabsTrigger value="workflow">Workflow Rules</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Document Templates</CardTitle>
                    <CardDescription>
                      Create and manage form templates
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowTemplateEditor(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        <div className="flex gap-2 mt-2">
                          {template.mergeFields.map((field, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedTemplate(template)
                          setShowTemplateEditor(true)
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {showTemplateEditor && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedTemplate ? 'Edit Template' : 'New Template'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="templateName">Template Name</Label>
                      <Input
                        id="templateName"
                        value={selectedTemplate?.name || ''}
                        placeholder="Enter template name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="templateType">Template Type</Label>
                      <Select defaultValue="letter">
                        <SelectTrigger id="templateType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="letter">Letter</SelectItem>
                          <SelectItem value="notice">Notice</SelectItem>
                          <SelectItem value="report">Report</SelectItem>
                          <SelectItem value="certificate">Certificate</SelectItem>
                          <SelectItem value="checklist">Checklist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="templateContent">Template Content</Label>
                    <Textarea
                      id="templateContent"
                      value={templateContent}
                      onChange={(e) => setTemplateContent(e.target.value)}
                      rows={12}
                      placeholder="Enter template content. Use merge fields to insert dynamic data..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleGenerateDocument}>
                      Generate Document
                    </Button>
                    <Button variant="outline" onClick={() => setShowTemplateEditor(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="merge-fields" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Merge Fields</CardTitle>
                <CardDescription>
                  Available merge fields for templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {mergeFields.map((field, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleInsertMergeField(field)}
                    >
                      <code className="text-sm font-mono">{field}</code>
                      <p className="text-xs text-gray-500 mt-1">
                        {field.replace(/[{}]/g, '').replace(/_/g, ' ')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflow" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Workflow Rules</CardTitle>
                    <CardDescription>
                      Automated document generation rules
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflowRules.map(rule => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{rule.name}</h4>
                          {rule.enabled && (
                            <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Trigger:</span> {rule.trigger}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Action:</span> {rule.action}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Distribution</CardTitle>
                <CardDescription>
                  Distribute documents via email or print
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Recipients</Label>
                    <div className="border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Atlanta Water Plant #1 - Operator</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Atlanta Water Plant #1 - Administrator</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Inspector John Doe</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Inspector Jane Smith</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Distribution Method *</Label>
                    <Select 
                      value={distributionMethod} 
                      onValueChange={(value: 'email' | 'print' | 'both') => setDistributionMethod(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email Only</SelectItem>
                        <SelectItem value="print">Print Only</SelectItem>
                        <SelectItem value="both">Both Email & Print</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Email Template (Optional)</Label>
                    <Textarea
                      placeholder="Enter email message..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleDistribute} className="flex-1">
                      <Send className="w-4 h-4 mr-2" />
                      Send Document
                    </Button>
                    <Button variant="outline">
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Electronic Signature Integration</CardTitle>
                <CardDescription>
                  SignNow API integration for electronic signatures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCheck className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium">SignNow Integration</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Request electronic signatures using SignNow API integration. Documents can be sent for signature and tracked through the signing process.
                    </p>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signerEmail">Signer Email Address *</Label>
                        <Input
                          id="signerEmail"
                          type="email"
                          placeholder="signer@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signerName">Signer Name *</Label>
                        <Input
                          id="signerName"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signingOrder">Signing Order</Label>
                        <Select defaultValue="any">
                          <SelectTrigger id="signingOrder">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Order</SelectItem>
                            <SelectItem value="sequential">Sequential (One at a time)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expirationDays">Expiration (days)</Label>
                        <Input
                          id="expirationDays"
                          type="number"
                          defaultValue="30"
                          min="1"
                          max="90"
                        />
                      </div>
                      <Button className="w-full">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Send for Signature via SignNow
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium mb-3">Signature Status Tracking</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium">Violation Notice - Atlanta Water Plant #1</p>
                          <p className="text-sm text-gray-600">Sent to: john.doe@example.com</p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Pending Signature</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium">Compliance Certificate - Water System #2</p>
                          <p className="text-sm text-gray-600">Sent to: jane.smith@example.com</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Signed</Badge>
                      </div>
                    </div>
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

