"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ResponsiveTabs, ResponsiveTabsContent, ResponsiveTabsList, ResponsiveTabsTrigger } from '@/components/ui/responsive-tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  FileText, 
  Search, 
  Filter,
  Download,
  Eye,
  Trash2,
  MapPin,
  FileCheck,
  FileSpreadsheet
} from 'lucide-react'

interface Document {
  id: string
  name: string
  type: string
  category: string
  size: string
  uploadedBy: string
  uploadedDate: string
  waterSystem?: string
  status: 'pending' | 'approved' | 'rejected'
}

const documentTypes = [
  { value: 'permit', label: 'Permit' },
  { value: 'historical', label: 'Historical Records' },
  { value: 'map', label: 'Facility Map (optional)' },
  { value: 'sop', label: 'Standard Operating Procedure (SOP)' },
  { value: 'epa', label: 'EPA Documents' },
  { value: 'state', label: 'State Documents' },
  { value: 'other', label: 'Other' }
]

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Water Withdrawal Permit 2025.pdf',
    type: 'permit',
    category: 'Permit',
    size: '2.3 MB',
    uploadedBy: 'Atlanta Water Plant #1',
    uploadedDate: '2025-11-01',
    waterSystem: 'Atlanta Water Plant #1',
    status: 'approved'
  },
  {
    id: '2',
    name: 'Chlorination Procedure SOP.pdf',
    type: 'sop',
    category: 'SOP',
    size: '1.5 MB',
    uploadedBy: 'Atlanta Water Plant #1',
    uploadedDate: '2025-11-05',
    waterSystem: 'Atlanta Water Plant #1',
    status: 'approved'
  },
  {
    id: '3',
    name: 'Facility Map 2025.jpg',
    type: 'map',
    category: 'Facility Map',
    size: '3.1 MB',
    uploadedBy: 'Atlanta Water Plant #1',
    uploadedDate: '2025-11-10',
    waterSystem: 'Atlanta Water Plant #1',
    status: 'pending'
  }
]

export default function DocumentsPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [documentType, setDocumentType] = useState('')
  const [description, setDescription] = useState('')
  const [waterSystem, setWaterSystem] = useState('')
  const [uploadDate, setUploadDate] = useState('')
  const [uploading, setUploading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFiles.length === 0 || !documentType) {
      alert('Please select a file and document type')
      return
    }

    setUploading(true)
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Add new document to list (mock)
    const newDoc: Document = {
      id: Date.now().toString(),
      name: selectedFiles[0].name,
      type: documentType,
      category: documentTypes.find(dt => dt.value === documentType)?.label || 'Other',
      size: `${(selectedFiles[0].size / 1024 / 1024).toFixed(2)} MB`,
      uploadedBy: 'Current User',
      uploadedDate: new Date().toISOString().split('T')[0],
      waterSystem: waterSystem || 'Atlanta Water Plant #1',
      status: 'pending'
    }
    
    setDocuments([newDoc, ...documents])
    setSelectedFiles([])
    setDocumentType('')
    setDescription('')
    setUploadDate('')
    setUploading(false)
    alert('Document uploaded successfully!')
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'permit':
        return <FileCheck className="w-5 h-5 text-blue-600" />
      case 'sop':
        return <FileText className="w-5 h-5 text-green-600" />
      case 'map':
        return <MapPin className="w-5 h-5 text-orange-600" />
      case 'epa':
      case 'state':
        return <FileSpreadsheet className="w-5 h-5 text-purple-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return null
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || doc.type === filterType
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Document Management</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Upload, organize, and manage documents for water systems
          </p>
        </div>

        <ResponsiveTabs defaultValue="library">
          <ResponsiveTabsList>
            <ResponsiveTabsTrigger value="library">Document Library</ResponsiveTabsTrigger>
            <ResponsiveTabsTrigger value="upload">Upload Document</ResponsiveTabsTrigger>
          </ResponsiveTabsList>

          <ResponsiveTabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Document</CardTitle>
                <CardDescription>
                  Upload supporting documents for water system facilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="file">Select File</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <Input
                        id="file"
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                      />
                      <label htmlFor="file" className="cursor-pointer">
                        <Button type="button" variant="outline" className="mb-2">
                          Choose File
                        </Button>
                      </label>
                      {selectedFiles.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600">
                            Selected: {selectedFiles[0].name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Size: {(selectedFiles[0].size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        PDF, DOC, DOCX, JPG, PNG, XLSX (Max 10MB)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="documentType">Document Type *</Label>
                      <Select value={documentType} onValueChange={setDocumentType} required>
                        <SelectTrigger id="documentType">
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="waterSystem">Water System</Label>
                      <Select value={waterSystem} onValueChange={setWaterSystem}>
                        <SelectTrigger id="waterSystem">
                          <SelectValue placeholder="Select water system" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="atlanta">Atlanta Water Plant #1</SelectItem>
                          <SelectItem value="system2">Water System #2</SelectItem>
                          <SelectItem value="system3">Water System #3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter document description"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="uploadDate">Document Date</Label>
                      <Input
                        id="uploadDate"
                        type="date"
                        value={uploadDate}
                        onChange={(e) => setUploadDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </ResponsiveTabsContent>

          <ResponsiveTabsContent value="library" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="break-words">Document Library</CardTitle>
                    <CardDescription className="break-words">
                      Browse and manage uploaded documents
                    </CardDescription>
                  </div>
                  <Button onClick={() => document.getElementById('library')?.scrollIntoView({ behavior: 'smooth' })} className="shrink-0 w-full sm:w-auto">
                    <Filter className="w-4 h-4 sm:mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" id="library">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search documents..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 min-w-0"
                        />
                      </div>
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-full sm:w-auto min-w-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {documentTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full sm:w-auto min-w-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    {filteredDocuments.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No documents found
                      </div>
                    ) : (
                      filteredDocuments.map(doc => (
                        <div
                          key={doc.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-3 min-w-0"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="shrink-0">{getDocumentIcon(doc.type)}</div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <span className="text-sm text-gray-600">{doc.category}</span>
                                <span className="text-sm text-gray-400">•</span>
                                <span className="text-sm text-gray-600">{doc.size}</span>
                                <span className="text-sm text-gray-400">•</span>
                                <span className="text-sm text-gray-600">{doc.uploadedDate}</span>
                              </div>
                              {doc.waterSystem && (
                                <p className="text-xs text-gray-500 mt-1 truncate">{doc.waterSystem}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="shrink-0">{getStatusBadge(doc.status)}</div>
                            <Button variant="ghost" size="sm" className="p-2">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-2">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-2">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </ResponsiveTabsContent>
        </ResponsiveTabs>
      </div>
    </main>
  )
}

