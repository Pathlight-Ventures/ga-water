"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  Download,
  AlertCircle
} from 'lucide-react'

interface Certificate {
  id: string
  certificateNumber: string
  certificateClass: string
  operatorName: string
  waterSystem: string
  verificationStatus: 'verified' | 'pending' | 'failed' | 'not_found'
  lastVerified: string
  sosMatch: boolean
}

const mockCertificates: Certificate[] = [
  {
    id: '1',
    certificateNumber: '12345',
    certificateClass: 'A',
    operatorName: 'John Doe',
    waterSystem: 'Atlanta Water Plant #1',
    verificationStatus: 'verified',
    lastVerified: '2025-11-15',
    sosMatch: true
  },
  {
    id: '2',
    certificateNumber: '67890',
    certificateClass: 'B',
    operatorName: 'Jane Smith',
    waterSystem: 'Water System #2',
    verificationStatus: 'verified',
    lastVerified: '2025-11-14',
    sosMatch: true
  },
  {
    id: '3',
    certificateNumber: '11111',
    certificateClass: 'C',
    operatorName: 'Bob Williams',
    waterSystem: 'Water System #3',
    verificationStatus: 'failed',
    lastVerified: '2025-11-13',
    sosMatch: false
  },
  {
    id: '4',
    certificateNumber: '22222',
    certificateClass: 'A',
    operatorName: 'Alice Johnson',
    waterSystem: 'Water System #4',
    verificationStatus: 'pending',
    lastVerified: '2025-11-12',
    sosMatch: false
  }
]

export default function CertificateVerificationPage() {
  const [certificates] = useState<Certificate[]>(mockCertificates)
  const [certificateNumber, setCertificateNumber] = useState('')
  const [certificateClass, setCertificateClass] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    status: 'idle' | 'success' | 'failed'
    message: string
  }>({ status: 'idle', message: '' })

  const handleVerify = async () => {
    if (!certificateNumber || !certificateClass) {
      alert('Please enter certificate number and class')
      return
    }

    setVerifying(true)
    setVerificationResult({ status: 'idle', message: 'Verifying with Secretary of State...' })

    // Simulate FTP verification
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock verification result
    const isValid = Math.random() > 0.3 // 70% chance of valid
    setVerificationResult({
      status: isValid ? 'success' : 'failed',
      message: isValid
        ? `Certificate ${certificateNumber} (Class ${certificateClass}) verified successfully with Secretary of State records.`
        : `Certificate ${certificateNumber} (Class ${certificateClass}) not found or does not match Secretary of State records.`
    })
    setVerifying(false)
  }

  const handleBulkVerify = async () => {
    setVerifying(true)
    alert('Bulk verification started. This will verify all certificates against Secretary of State FTP server...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    setVerifying(false)
    alert('Bulk verification complete. 3 certificates verified, 1 failed.')
  }

  const handleExport = () => {
    alert('Exporting certificate verification report to flat text file for Secretary of State FTP upload...')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case 'not_found':
        return <Badge className="bg-gray-100 text-gray-800">Not Found</Badge>
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Verification</h1>
          <p className="text-gray-600">
            Verify operator certificates against Secretary of State Professional Licensing data
          </p>
        </div>

        {/* Verification Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Verify Certificate</CardTitle>
            <CardDescription>
              Verify individual certificate against Secretary of State FTP database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="certificateNumber">Certificate Number *</Label>
                  <Input
                    id="certificateNumber"
                    value={certificateNumber}
                    onChange={(e) => setCertificateNumber(e.target.value)}
                    placeholder="12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificateClass">Certificate Class *</Label>
                  <Input
                    id="certificateClass"
                    value={certificateClass}
                    onChange={(e) => setCertificateClass(e.target.value.toUpperCase())}
                    placeholder="A"
                    maxLength={1}
                  />
                </div>
              </div>
              <Button onClick={handleVerify} disabled={verifying} className="w-full">
                {verifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Certificate
                  </>
                )}
              </Button>
              {verificationResult.status !== 'idle' && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${
                  verificationResult.status === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {verificationResult.status === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  <p className="text-sm">{verificationResult.message}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Integration Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Secretary of State Integration</CardTitle>
            <CardDescription>
              Automated certificate verification workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium">FTP Integration</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  The system exports a flat text file to upload to the Secretary of State File Transfer Protocol (FTP) server to verify that Operator Certificate class and certificate number match the Secretary of State Professional Licensing data.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Automated FTP upload for certificate verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Real-time verification against Secretary of State database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Bulk verification for all operators</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Export verification reports in flat text format</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleBulkVerify} variant="outline" disabled={verifying}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Bulk Verify All
                </Button>
                <Button onClick={handleExport} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Verification Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificate List */}
        <Card>
          <CardHeader>
            <CardTitle>Certificate Verification Status</CardTitle>
            <CardDescription>
              View verification status for all operator certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {certificates.map(cert => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      cert.verificationStatus === 'verified'
                        ? 'bg-green-100'
                        : cert.verificationStatus === 'failed'
                        ? 'bg-red-100'
                        : 'bg-yellow-100'
                    }`}>
                      {cert.verificationStatus === 'verified' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : cert.verificationStatus === 'failed' ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{cert.operatorName}</h4>
                      <p className="text-sm text-gray-600">{cert.waterSystem}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          Certificate: {cert.certificateNumber} (Class {cert.certificateClass})
                        </span>
                        {cert.sosMatch && (
                          <Badge variant="secondary" className="text-xs">SOS Match</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Last Verified</p>
                      <p className="text-sm font-medium">{cert.lastVerified}</p>
                    </div>
                    {getStatusBadge(cert.verificationStatus)}
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Re-verify
                    </Button>
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

