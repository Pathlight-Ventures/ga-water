"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react'

interface RegistrationStep {
  id: string
  title: string
  description: string
  completed: boolean
}

export default function FacilityRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // User Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    certificateClass: '',
    certificateNumber: '',
    
    // Water System Information
    waterSystemId: '',
    plantNumber: '',
    waterSystemName: '',
    
    // Facility Capacity
    permittedCapacity: '',
    groundWaterWithdrawal24hr: '',
    groundWaterWithdrawalMonthly: '',
    surfaceWaterWithdrawal24hr: '',
    surfaceWaterWithdrawalMonthly: '',
    
    // Filtration Information
    numberOfFilters: '',
    individualFilterArea: '',
    totalFilterArea: '',
    permitLimitFiltrationRate: '',
    permitLimitFluxRate: '',
    membraneArea: '',
    
    // Treatment Information
    disinfectionType: '',
    
    // Additional Information
    address: '',
    city: '',
    state: 'GA',
    zipCode: '',
    county: '',
    latitude: '',
    longitude: ''
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [sdwisValidation, setSdwisValidation] = useState<{
    status: 'idle' | 'validating' | 'valid' | 'invalid'
    message: string
  }>({ status: 'idle', message: '' })

  const steps: RegistrationStep[] = [
    { id: 'user', title: 'User Information', description: 'Personal details and credentials', completed: false },
    { id: 'system', title: 'Water System', description: 'System identification and validation', completed: false },
    { id: 'capacity', title: 'Capacity & Limits', description: 'Permitted capacity and withdrawal limits', completed: false },
    { id: 'filtration', title: 'Filtration', description: 'Filter configuration and limits', completed: false },
    { id: 'treatment', title: 'Treatment', description: 'Treatment and disinfection type', completed: false },
    { id: 'location', title: 'Location', description: 'Facility address and coordinates', completed: false },
    { id: 'review', title: 'Review', description: 'Review and submit', completed: false }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateStep = (stepIndex: number): boolean => {
    const errors: Record<string, string> = {}
    
    switch (stepIndex) {
      case 0: // User Information
        if (!formData.firstName) errors.firstName = 'First name is required'
        if (!formData.lastName) errors.lastName = 'Last name is required'
        if (!formData.email) errors.email = 'Email is required'
        if (!formData.role) errors.role = 'Role is required'
        if (!formData.certificateClass) errors.certificateClass = 'Certificate class is required'
        if (!formData.certificateNumber) errors.certificateNumber = 'Certificate number is required'
        break
      case 1: // Water System
        if (!formData.waterSystemId) errors.waterSystemId = 'Water System ID is required'
        if (!formData.plantNumber) errors.plantNumber = 'Plant number is required'
        break
      case 2: // Capacity
        if (!formData.permittedCapacity) errors.permittedCapacity = 'Permitted capacity is required'
        break
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleValidateSDWIS = async () => {
    if (!formData.waterSystemId || !formData.plantNumber) {
      setSdwisValidation({ status: 'invalid', message: 'Please enter Water System ID and Plant Number first' })
      return
    }

    setSdwisValidation({ status: 'validating', message: 'Validating against SDWIS...' })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock validation result
    const isValid = Math.random() > 0.3 // 70% chance of valid
    setSdwisValidation({
      status: isValid ? 'valid' : 'invalid',
      message: isValid 
        ? 'Water System ID and Plant Number validated successfully'
        : 'Water System ID or Plant Number not found in SDWIS. Please verify and try again.'
    })
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
        // Mark current step as completed
        steps[currentStep].completed = true
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      // Simulate submission
      alert('Facility registration submitted successfully! Your account will be reviewed and activated within 1-2 business days.')
      // Reset form
      setFormData({
        firstName: '', lastName: '', email: '', phone: '', role: '', certificateClass: '', certificateNumber: '',
        waterSystemId: '', plantNumber: '', waterSystemName: '',
        permittedCapacity: '', groundWaterWithdrawal24hr: '', groundWaterWithdrawalMonthly: '',
        surfaceWaterWithdrawal24hr: '', surfaceWaterWithdrawalMonthly: '',
        numberOfFilters: '', individualFilterArea: '', totalFilterArea: '',
        permitLimitFiltrationRate: '', permitLimitFluxRate: '', membraneArea: '',
        disinfectionType: '', address: '', city: '', state: 'GA', zipCode: '', county: '', latitude: '', longitude: ''
      })
      setCurrentStep(0)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // User Information
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="John"
                />
                {validationErrors.firstName && (
                  <p className="text-xs text-red-600">{validationErrors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Doe"
                />
                {validationErrors.lastName && (
                  <p className="text-xs text-red-600">{validationErrors.lastName}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john.doe@example.com"
              />
              {validationErrors.email && (
                <p className="text-xs text-red-600">{validationErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(404) 555-1234"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operator">Operator</SelectItem>
                    <SelectItem value="operator_in_charge">Operator in Responsible Charge (ORC)</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.role && (
                  <p className="text-xs text-red-600">{validationErrors.role}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificateClass">Certificate Class *</Label>
                <Select value={formData.certificateClass} onValueChange={(value) => handleInputChange('certificateClass', value)}>
                  <SelectTrigger id="certificateClass">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Class A</SelectItem>
                    <SelectItem value="B">Class B</SelectItem>
                    <SelectItem value="C">Class C</SelectItem>
                    <SelectItem value="D">Class D</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.certificateClass && (
                  <p className="text-xs text-red-600">{validationErrors.certificateClass}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificateNumber">Certificate Number *</Label>
              <Input
                id="certificateNumber"
                value={formData.certificateNumber}
                onChange={(e) => handleInputChange('certificateNumber', e.target.value)}
                placeholder="12345"
              />
              {validationErrors.certificateNumber && (
                <p className="text-xs text-red-600">{validationErrors.certificateNumber}</p>
              )}
            </div>
          </div>
        )
      
      case 1: // Water System
        return (
          <div className="space-y-6">
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium">SDWIS Validation</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Water System ID and Plant Number will be validated against SDWIS database to ensure accuracy.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="waterSystemId">Water System ID *</Label>
                  <Input
                    id="waterSystemId"
                    value={formData.waterSystemId}
                    onChange={(e) => handleInputChange('waterSystemId', e.target.value)}
                    placeholder="GA1234567"
                  />
                  {validationErrors.waterSystemId && (
                    <p className="text-xs text-red-600">{validationErrors.waterSystemId}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plantNumber">Plant Number *</Label>
                  <Input
                    id="plantNumber"
                    value={formData.plantNumber}
                    onChange={(e) => handleInputChange('plantNumber', e.target.value)}
                    placeholder="001"
                  />
                  {validationErrors.plantNumber && (
                    <p className="text-xs text-red-600">{validationErrors.plantNumber}</p>
                  )}
                </div>
              </div>
              <Button onClick={handleValidateSDWIS} variant="outline" className="w-full">
                Validate Against SDWIS
              </Button>
              {sdwisValidation.status !== 'idle' && (
                <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                  sdwisValidation.status === 'valid' ? 'bg-green-100 text-green-800' :
                  sdwisValidation.status === 'invalid' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {sdwisValidation.status === 'valid' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : sdwisValidation.status === 'invalid' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Settings className="w-5 h-5 animate-spin" />
                  )}
                  <p className="text-sm">{sdwisValidation.message}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="waterSystemName">Water System Name</Label>
              <Input
                id="waterSystemName"
                value={formData.waterSystemName}
                onChange={(e) => handleInputChange('waterSystemName', e.target.value)}
                placeholder="Atlanta Water Plant #1"
              />
            </div>
          </div>
        )
      
      case 2: // Capacity & Limits
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="permittedCapacity">Permitted Capacity of Plant (gallons/day) *</Label>
              <Input
                id="permittedCapacity"
                type="number"
                value={formData.permittedCapacity}
                onChange={(e) => handleInputChange('permittedCapacity', e.target.value)}
                placeholder="1000000"
              />
              {validationErrors.permittedCapacity && (
                <p className="text-xs text-red-600">{validationErrors.permittedCapacity}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="groundWaterWithdrawal24hr">Ground Water Withdrawal - 24hr Limit (gallons/day)</Label>
                <Input
                  id="groundWaterWithdrawal24hr"
                  type="number"
                  value={formData.groundWaterWithdrawal24hr}
                  onChange={(e) => handleInputChange('groundWaterWithdrawal24hr', e.target.value)}
                  placeholder="500000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="groundWaterWithdrawalMonthly">Ground Water Withdrawal - Monthly Limit (gallons/month)</Label>
                <Input
                  id="groundWaterWithdrawalMonthly"
                  type="number"
                  value={formData.groundWaterWithdrawalMonthly}
                  onChange={(e) => handleInputChange('groundWaterWithdrawalMonthly', e.target.value)}
                  placeholder="15000000"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="surfaceWaterWithdrawal24hr">Surface Water Withdrawal - 24hr Limit (gallons/day)</Label>
                <Input
                  id="surfaceWaterWithdrawal24hr"
                  type="number"
                  value={formData.surfaceWaterWithdrawal24hr}
                  onChange={(e) => handleInputChange('surfaceWaterWithdrawal24hr', e.target.value)}
                  placeholder="1000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surfaceWaterWithdrawalMonthly">Surface Water Withdrawal - Monthly Limit (gallons/month)</Label>
                <Input
                  id="surfaceWaterWithdrawalMonthly"
                  type="number"
                  value={formData.surfaceWaterWithdrawalMonthly}
                  onChange={(e) => handleInputChange('surfaceWaterWithdrawalMonthly', e.target.value)}
                  placeholder="30000000"
                />
              </div>
            </div>
          </div>
        )
      
      case 3: // Filtration
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="numberOfFilters">Number of Filters</Label>
              <Input
                id="numberOfFilters"
                type="number"
                value={formData.numberOfFilters}
                onChange={(e) => handleInputChange('numberOfFilters', e.target.value)}
                placeholder="4"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="individualFilterArea">Individual Filter Area (sq ft)</Label>
                <Input
                  id="individualFilterArea"
                  type="number"
                  step="0.01"
                  value={formData.individualFilterArea}
                  onChange={(e) => handleInputChange('individualFilterArea', e.target.value)}
                  placeholder="100.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalFilterArea">Total Filter Area (sq ft)</Label>
                <Input
                  id="totalFilterArea"
                  type="number"
                  step="0.01"
                  value={formData.totalFilterArea}
                  onChange={(e) => handleInputChange('totalFilterArea', e.target.value)}
                  placeholder="402.0"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="permitLimitFiltrationRate">Permit Limit - Filtration Rate (gpm/sq ft)</Label>
                <Input
                  id="permitLimitFiltrationRate"
                  type="number"
                  step="0.01"
                  value={formData.permitLimitFiltrationRate}
                  onChange={(e) => handleInputChange('permitLimitFiltrationRate', e.target.value)}
                  placeholder="4.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="permitLimitFluxRate">Permit Limit - Flux Rate (gpm/sq ft)</Label>
                <Input
                  id="permitLimitFluxRate"
                  type="number"
                  step="0.01"
                  value={formData.permitLimitFluxRate}
                  onChange={(e) => handleInputChange('permitLimitFluxRate', e.target.value)}
                  placeholder="4.0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="membraneArea">Membrane Area (sq ft)</Label>
              <Input
                id="membraneArea"
                type="number"
                step="0.01"
                value={formData.membraneArea}
                onChange={(e) => handleInputChange('membraneArea', e.target.value)}
                placeholder="500.0"
              />
            </div>
          </div>
        )
      
      case 4: // Treatment
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="disinfectionType">Disinfection Type *</Label>
              <Select value={formData.disinfectionType} onValueChange={(value) => handleInputChange('disinfectionType', value)}>
                <SelectTrigger id="disinfectionType">
                  <SelectValue placeholder="Select disinfection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chlorine">Chlorine</SelectItem>
                  <SelectItem value="chlorine_dioxide">Chlorine Dioxide</SelectItem>
                  <SelectItem value="ozone">Ozone</SelectItem>
                  <SelectItem value="uv">UV</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      
      case 5: // Location
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main Street"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Atlanta"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="30309"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <Input
                id="county"
                value={formData.county}
                onChange={(e) => handleInputChange('county', e.target.value)}
                placeholder="Fulton"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                  placeholder="33.7490"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                  placeholder="-84.3880"
                />
              </div>
            </div>
          </div>
        )
      
      case 6: // Review
        return (
          <div className="space-y-6">
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-4">Review Your Information</h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Name:</p>
                    <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email:</p>
                    <p className="font-medium">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Water System ID:</p>
                    <p className="font-medium">{formData.waterSystemId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Plant Number:</p>
                    <p className="font-medium">{formData.plantNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Role:</p>
                    <p className="font-medium">{formData.role}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Certificate Class:</p>
                    <p className="font-medium">{formData.certificateClass}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-blue-50">
              <p className="text-sm text-gray-600">
                By submitting this registration, you agree to the terms and conditions. Your account will be reviewed and activated within 1-2 business days.
              </p>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Facility & System Registration</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Register your water system facility and create an account to submit data
          </p>
        </div>

        {/* Progress Steps */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="hidden sm:flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      index === currentStep 
                        ? 'border-orange-500 bg-orange-50 text-orange-600' 
                        : index < currentStep
                        ? 'border-green-500 bg-green-50 text-green-600'
                        : 'border-gray-300 bg-gray-50 text-gray-400'
                    }`}>
                      {index < currentStep ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <p className="text-xs mt-2 text-center max-w-[80px] truncate">{step.title}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            {/* Mobile: Simple step indicator */}
            <div className="sm:hidden flex items-center justify-center gap-2">
              <span className="text-sm font-medium">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600 truncate">{steps[currentStep].title}</span>
            </div>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
          <CardContent className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Previous
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} className="w-full sm:w-auto order-1 sm:order-2">
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto order-1 sm:order-2">
                Submit Registration
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

