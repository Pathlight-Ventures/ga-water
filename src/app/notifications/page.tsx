"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ResponsiveTabs, ResponsiveTabsContent, ResponsiveTabsList, ResponsiveTabsTrigger } from '@/components/ui/responsive-tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Bell,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Search
} from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  recipient: string
  sentDate: string
  status: 'sent' | 'pending' | 'failed'
  deliveryMethod: 'email' | 'in-app' | 'both'
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'report_due',
    title: 'Monthly Operating Report Due - November 2025',
    message: 'Your November 2025 Monthly Operating Report is due on December 10, 2025. Please submit your report before the deadline.',
    recipient: 'Atlanta Water Plant #1 - Operator',
    sentDate: '2025-12-01',
    status: 'sent',
    deliveryMethod: 'both'
  },
  {
    id: '2',
    type: 'mcl_exceedance',
    title: 'MCL Exceedance Detected - Turbidity at Plant #1',
    message: 'MCL exceedance detected: Turbidity measured at 0.45 NTU (MCL: 0.3 NTU). Action required.',
    recipient: 'Inspector John Doe',
    sentDate: '2025-11-15',
    status: 'sent',
    deliveryMethod: 'both'
  },
  {
    id: '3',
    type: 'report_submitted',
    title: 'Report Submitted - Atlanta Water Plant #1',
    message: 'Atlanta Water Plant #1 submitted their November 2025 Monthly Operating Report.',
    recipient: 'Inspector Jane Smith',
    sentDate: '2025-12-05',
    status: 'sent',
    deliveryMethod: 'in-app'
  }
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [notificationType, setNotificationType] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'in-app' | 'both'>('both')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [inAppNotifications, setInAppNotifications] = useState(true)

  const notificationTypes = [
    { value: 'report_due', label: 'Report Due Reminder' },
    { value: 'deadline_passed', label: 'Deadline Passed Alert' },
    { value: 'mcl_exceedance', label: 'MCL Exceedance Alert' },
    { value: 'violation', label: 'Violation Notification' },
    { value: 'report_submitted', label: 'Report Submitted' },
    { value: 'task_assigned', label: 'Task Assignment' },
    { value: 'document_review', label: 'Document Review Request' }
  ]

  const handleSendNotification = () => {
    if (!selectedRecipient || !notificationType || !subject || !message) {
      alert('Please fill in all required fields')
      return
    }

    const newNotification: Notification = {
      id: Date.now().toString(),
      type: notificationType,
      title: subject,
      message: message,
      recipient: selectedRecipient,
      sentDate: new Date().toISOString().split('T')[0],
      status: 'sent',
      deliveryMethod: deliveryMethod
    }

    setNotifications([newNotification, ...notifications])
    setSelectedRecipient('')
    setNotificationType('')
    setSubject('')
    setMessage('')
    alert('Notification sent successfully!')
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'report_due':
      case 'deadline_passed':
        return <Clock className="w-5 h-5 text-orange-600" />
      case 'mcl_exceedance':
      case 'violation':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'report_submitted':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      default:
        return <Bell className="w-5 h-5 text-blue-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800">Sent</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return null
    }
  }

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = !searchTerm || 
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.recipient.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || notif.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Send notifications to customers and staff
          </p>
        </div>

        <ResponsiveTabs defaultValue="inbox">
          <ResponsiveTabsList>
            <ResponsiveTabsTrigger value="inbox">Inbox</ResponsiveTabsTrigger>
            <ResponsiveTabsTrigger value="send">Send Notification</ResponsiveTabsTrigger>
            <ResponsiveTabsTrigger value="settings">Settings</ResponsiveTabsTrigger>
          </ResponsiveTabsList>

          <ResponsiveTabsContent value="inbox" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Center</CardTitle>
                <CardDescription>
                  View all notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search notifications..."
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
                        {notificationTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    {filteredNotifications.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No notifications found
                      </div>
                    ) : (
                      filteredNotifications.map(notif => (
                        <div
                          key={notif.id}
                          className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 min-w-0"
                        >
                          <div className="mt-1 shrink-0">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1 gap-2">
                              <h4 className="font-medium text-gray-900 break-words flex-1">{notif.title}</h4>
                              <div className="shrink-0">{getStatusBadge(notif.status)}</div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 break-words">{notif.message}</p>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                              <span className="truncate">To: {notif.recipient}</span>
                              <span>•</span>
                              <span>{notif.sentDate}</span>
                              <span>•</span>
                              <span>
                                {notif.deliveryMethod === 'both' ? 'Email & In-App' :
                                 notif.deliveryMethod === 'email' ? 'Email' : 'In-App'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </ResponsiveTabsContent>

          <ResponsiveTabsContent value="send" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send Notification</CardTitle>
                <CardDescription>
                  Send notification to water system users or agency staff
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleSendNotification(); }} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipient">Recipient *</Label>
                      <Select 
                        value={selectedRecipient} 
                        onValueChange={setSelectedRecipient}
                        required
                      >
                        <SelectTrigger id="recipient">
                          <SelectValue placeholder="Select recipient" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="atlanta-operator">Atlanta Water Plant #1 - Operator</SelectItem>
                          <SelectItem value="atlanta-admin">Atlanta Water Plant #1 - Administrator</SelectItem>
                          <SelectItem value="inspector1">Inspector John Doe</SelectItem>
                          <SelectItem value="inspector2">Inspector Jane Smith</SelectItem>
                          <SelectItem value="engineer1">Engineer Bob Williams</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notificationType">Notification Type *</Label>
                      <Select 
                        value={notificationType} 
                        onValueChange={(value) => {
                          setNotificationType(value)
                          // Auto-populate subject based on type
                          const typeObj = notificationTypes.find(t => t.value === value)
                          if (typeObj) {
                            setSubject(typeObj.label)
                            // Auto-populate message template
                            switch (value) {
                              case 'report_due':
                                setMessage('Your Monthly Operating Report is due soon. Please submit your report before the deadline.')
                                break
                              case 'mcl_exceedance':
                                setMessage('MCL exceedance detected. Action required.')
                                break
                              default:
                                setMessage('')
                            }
                          }
                        }}
                        required
                      >
                        <SelectTrigger id="notificationType">
                          <SelectValue placeholder="Select notification type" />
                        </SelectTrigger>
                        <SelectContent>
                          {notificationTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter notification subject"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter notification message"
                      rows={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Delivery Method *</Label>
                    <Select 
                      value={deliveryMethod} 
                      onValueChange={(value: 'email' | 'in-app' | 'both') => setDeliveryMethod(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email Only</SelectItem>
                        <SelectItem value="in-app">In-App Only</SelectItem>
                        <SelectItem value="both">Both Email & In-App</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </Button>
                </form>
              </CardContent>
            </Card>
          </ResponsiveTabsContent>

          <ResponsiveTabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <input
                      id="emailNotifications"
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="inAppNotifications">In-App Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications in the application</p>
                    </div>
                    <input
                      id="inAppNotifications"
                      type="checkbox"
                      checked={inAppNotifications}
                      onChange={(e) => setInAppNotifications(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium">Notification Types</h3>
                  <div className="space-y-2">
                    {notificationTypes.map(type => (
                      <div key={type.value} className="flex items-center justify-between">
                        <Label>{type.label}</Label>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 rounded border-gray-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="frequency">Notification Frequency</Label>
                  <Select defaultValue="immediate">
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </ResponsiveTabsContent>
        </ResponsiveTabs>
      </div>
    </main>
  )
}

