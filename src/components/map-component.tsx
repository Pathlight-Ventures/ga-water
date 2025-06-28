"use client"

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, AlertTriangle, CheckCircle } from 'lucide-react'
import type { WaterSystemSearchResult } from '@/lib/repository/water-systems'

// Fix for default markers in Leaflet with Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
      "></div>
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

const greenIcon = createCustomIcon('#10b981')
const yellowIcon = createCustomIcon('#f59e0b')
const redIcon = createCustomIcon('#ef4444')
const blueIcon = createCustomIcon('#3b82f6')

interface MapComponentProps {
  searchResults: WaterSystemSearchResult[]
  selectedSystem: WaterSystemSearchResult | null
  onSystemSelect: (system: WaterSystemSearchResult) => void
}

// Component to handle map updates when selected system changes
function MapUpdater({ selectedSystem }: { selectedSystem: WaterSystemSearchResult | null }) {
  const map = useMap()

  useEffect(() => {
    if (selectedSystem) {
      // For demo purposes, we'll use Georgia coordinates
      // In a real implementation, you'd have lat/lng data for each system
      const georgiaCenter = [32.1656, -82.9001] // Georgia center coordinates
      map.setView(georgiaCenter as [number, number], 8)
    }
  }, [selectedSystem, map])

  return null
}

// Generate mock coordinates for demo purposes
const generateMockCoordinates = (index: number): [number, number] => {
  // Generate coordinates within Georgia bounds
  const georgiaBounds = {
    north: 35.0000,
    south: 30.3550,
    east: -80.8400,
    west: -85.6050
  }
  
  const lat = georgiaBounds.south + (georgiaBounds.north - georgiaBounds.south) * Math.random()
  const lng = georgiaBounds.west + (georgiaBounds.east - georgiaBounds.west) * Math.random()
  
  return [lat, lng]
}

export default function MapComponent({ searchResults, selectedSystem, onSystemSelect }: MapComponentProps) {
  const [mapReady, setMapReady] = useState(false)

  // Georgia center coordinates
  const georgiaCenter: [number, number] = [32.1656, -82.9001]

  const getMarkerIcon = (system: WaterSystemSearchResult) => {
    if (system.violation_count === 0) return greenIcon
    if (system.violation_count <= 2) return yellowIcon
    return redIcon
  }

  const getViolationStatusText = (violationCount: number) => {
    if (violationCount === 0) return 'Compliant'
    if (violationCount <= 2) return 'Minor Issues'
    return 'Major Issues'
  }

  const getViolationStatusColor = (violationCount: number) => {
    if (violationCount === 0) return 'bg-green-500'
    if (violationCount <= 2) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="h-full w-full">
      <MapContainer
        center={georgiaCenter}
        zoom={7}
        className="h-full w-full"
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater selectedSystem={selectedSystem} />

        {/* Render markers for search results */}
        {mapReady && searchResults.map((system) => {
          // Generate coordinates using system ID hash instead of index
          const systemHash = system.id.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
          const coordinates = generateMockCoordinates(Math.abs(systemHash))
          const markerKey = `${system.id}-${systemHash}`
          
          return (
            <Marker
              key={markerKey}
              position={coordinates}
              icon={getMarkerIcon(system)}
              eventHandlers={{
                click: () => onSystemSelect(system)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{system.pws_name || 'Unnamed System'}</h3>
                    <Badge 
                      variant={system.violation_count > 0 ? "destructive" : "default"}
                      className="text-xs"
                    >
                      {system.violation_count} violations
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    <p><strong>PWSID:</strong> {system.pwsid}</p>
                    {system.city_name && <p><strong>City:</strong> {system.city_name}</p>}
                    <p><strong>Type:</strong> {system.pws_type_code}</p>
                    <p><strong>Status:</strong> {system.pws_activity_code}</p>
                    {system.population_served_count && (
                      <p><strong>Population:</strong> {system.population_served_count.toLocaleString()}</p>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-2 border-t">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-white ${getViolationStatusColor(system.violation_count)}`}>
                      {system.violation_count === 0 ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      {getViolationStatusText(system.violation_count)}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => onSystemSelect(system)}
                  >
                    View Details
                  </Button>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Highlight selected system with a different marker */}
        {mapReady && selectedSystem && (() => {
          const selectedIndex = searchResults.findIndex(s => s.id === selectedSystem.id)
          const coordinates = selectedIndex >= 0 
            ? generateMockCoordinates(selectedIndex)
            : georgiaCenter
          
          return (
            <Marker
              position={coordinates}
              icon={blueIcon}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-sm">Selected: {selectedSystem.pws_name || selectedSystem.pwsid}</h3>
                  </div>
                  <p className="text-xs text-gray-600">This system is currently selected in the sidebar.</p>
                </div>
              </Popup>
            </Marker>
          )
        })()}
      </MapContainer>
    </div>
  )
} 