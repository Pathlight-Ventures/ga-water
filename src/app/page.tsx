import { DATA_DICTIONARY } from '@/lib/data-dictionary'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SpeedTrials 2025
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Georgia Drinking Water Data Explorer
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Exploring Q1 2025 SDWIS data for Georgia's public water systems
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Water System Types</h3>
            <div className="space-y-2">
              {Object.entries(DATA_DICTIONARY.pws_type).map(([code, description]) => (
                <div key={code} className="flex justify-between text-sm">
                  <span className="font-mono text-gray-600">{code}</span>
                  <span className="text-gray-900">{description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Violation Categories</h3>
            <div className="space-y-2">
              {Object.entries(DATA_DICTIONARY.violation_category).map(([code, description]) => (
                <div key={code} className="flex justify-between text-sm">
                  <span className="font-mono text-gray-600">{code}</span>
                  <span className="text-gray-900">{description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Primary Sources</h3>
            <div className="space-y-2">
              {Object.entries(DATA_DICTIONARY.primary_source).map(([code, description]) => (
                <div key={code} className="flex justify-between text-sm">
                  <span className="font-mono text-gray-600">{code}</span>
                  <span className="text-gray-900">{description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Database Schema Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Database Schema Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Public Water Systems</h3>
              <p className="text-sm text-gray-600">Core information about water systems including PWSID, name, type, and contact details.</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Violations</h3>
              <p className="text-sm text-gray-600">Violation records, enforcement actions, and compliance status.</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Facilities</h3>
              <p className="text-sm text-gray-600">Water system facilities, infrastructure, and operational details.</p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Site Visits</h3>
              <p className="text-sm text-gray-600">Inspection records, evaluations, and compliance assessments.</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Lead & Copper Samples</h3>
              <p className="text-sm text-gray-600">Testing data for lead and copper contamination levels.</p>
            </div>
            <div className="border-l-4 border-indigo-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Geographic Areas</h3>
              <p className="text-sm text-gray-600">Service area information and geographic boundaries.</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Next Steps</h2>
          <div className="space-y-3 text-blue-800">
            <p>✅ <strong>Repository Setup:</strong> Next.js project with TypeScript and Tailwind CSS</p>
            <p>✅ <strong>Database Schema:</strong> Supabase schema with SDWIS data structure</p>
            <p>✅ <strong>Data Dictionary:</strong> Code lookups and utility functions</p>
            <p>🔄 <strong>Next:</strong> Set up Supabase project and import data</p>
            <p>🔄 <strong>Next:</strong> Create data visualization components</p>
            <p>🔄 <strong>Next:</strong> Build search and filtering functionality</p>
          </div>
        </div>
      </div>
    </main>
  )
}
