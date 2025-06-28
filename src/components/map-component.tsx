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

// Georgia county coordinates (approximate centers)
const GEORGIA_COUNTIES: Record<string, [number, number]> = {
  'FULTON': [33.7490, -84.3880], // Atlanta
  'GWINNETT': [33.9560, -83.9930], // Lawrenceville
  'COBB': [33.9525, -84.5493], // Marietta
  'DEKALB': [33.7490, -84.3880], // Decatur
  'CHATHAM': [32.0809, -81.0912], // Savannah
  'CLAYTON': [33.5415, -84.3566], // Jonesboro
  'CHEROKEE': [34.2440, -84.4760], // Canton
  'HENRY': [33.4530, -84.1460], // McDonough
  'FORSYTH': [34.2070, -84.1400], // Cumming
  'PAULDING': [33.9200, -84.8670], // Dallas
  'CARROLL': [33.5800, -85.0800], // Carrollton
  'DOUGLAS': [33.7510, -84.7470], // Douglasville
  'FAYETTE': [33.4140, -84.4900], // Fayetteville
  'NEWTON': [33.5120, -83.8500], // Covington
  'ROCKDALE': [33.6540, -84.0270], // Conyers
  'BARROW': [34.0060, -83.7130], // Winder
  'WALTON': [33.7830, -83.7330], // Monroe
  'HALL': [34.3170, -83.8180], // Gainesville
  'COLUMBIA': [33.5440, -82.1310], // Evans
  'RICHMOND': [33.4710, -81.9640], // Augusta
  'BIBB': [32.8407, -83.6324], // Macon
  'HOUSTON': [32.4584, -83.6666], // Warner Robins
  'MUSCOGEE': [32.4610, -84.9877], // Columbus
  'CLARKE': [33.9519, -83.3576], // Athens
  'WHITFIELD': [34.7730, -84.9670], // Dalton
  'GORDON': [34.5030, -84.8710], // Calhoun
  'FLOYD': [34.2630, -85.1640], // Rome
  'BARTOW': [34.2440, -84.8400], // Cartersville
  'SPALDING': [33.2630, -84.2840], // Griffin
  'COWETA': [33.3530, -84.7690], // Newnan
  'TROUP': [33.0340, -85.0310], // LaGrange
  'MERIWETHER': [33.0410, -84.6970], // Greenville
  'PIKE': [33.0920, -84.3890], // Zebulon
  'UPSON': [32.8810, -84.2990], // Thomaston
  'LAMAR': [33.0760, -84.1390], // Barnesville
  'MONROE': [33.0140, -83.9180], // Forsyth
  'JONES': [33.0250, -83.5600], // Gray
  'PUTNAM': [33.3220, -83.3720], // Eatonton
  'MORGAN': [33.5920, -83.4920], // Madison
  'OCONEE': [33.8340, -83.4370], // Watkinsville
  'JACKSON': [34.1340, -83.5660], // Jefferson
  'BANKS': [34.3540, -83.4970], // Homer
  'FRANKLIN': [34.3750, -83.2290], // Carnesville
  'HART': [34.3530, -82.9640], // Hartwell
  'ELBERT': [34.1110, -82.8680], // Elberton
  'MADISON': [34.1280, -83.2130], // Danielsville
  'OGLETHORPE': [33.8810, -83.0810], // Lexington
  'WILKES': [33.7810, -82.7430], // Washington
  'LINCOLN': [33.7940, -82.4510], // Lincolnton
  'WARREN': [33.4090, -82.6620], // Warrenton
  'MCDUFFIE': [33.4820, -82.4810], // Thomson
  'TALIAFERRO': [33.5660, -82.8780], // Crawfordville
  'GREENE': [33.5770, -83.1660], // Greensboro
  'HANCOCK': [33.2700, -83.0000], // Sparta
  'WASHINGTON': [32.9670, -82.7940], // Sandersville
  'JOHNSON': [32.7020, -82.6620], // Wrightsville
  'EMANUEL': [32.5930, -82.3020], // Swainsboro
  'JEFFERSON': [33.0550, -82.4180], // Louisville
  'BURKE': [33.0620, -82.0000], // Waynesboro
  'JENKINS': [32.7920, -81.9630], // Millen
  'SCREVEN': [32.7500, -81.6120], // Sylvania
  'BULLOCH': [32.3950, -81.7430], // Statesboro
  'EVANS': [32.1560, -81.8870], // Claxton
  'TATTNALL': [32.0460, -82.0580], // Reidsville
  'TOOMBS': [32.1210, -82.3310], // Lyons
  'CANDLER': [32.4030, -82.0740], // Metter
  'TREUTLEN': [32.4040, -82.5640], // Soperton
  'MONTGOMERY': [32.1740, -82.5350], // Mount Vernon
  'WHEELER': [32.1170, -82.7240], // Alamo
  'TELFAIR': [31.9330, -82.9390], // McRae
  'DODGE': [32.1720, -83.1680], // Eastman
  'LAURENS': [32.4630, -82.9220], // Dublin
  'WILCOX': [31.9730, -83.4320], // Abbeville
  'TURNER': [31.7250, -83.6240], // Ashburn
  'CRISP': [31.9630, -83.7770], // Cordele
  'DOOLY': [32.1580, -83.7990], // Vienna
  'PULASKI': [32.2330, -83.4650], // Hawkinsville
  'BLEECKLEY': [32.4340, -83.3270], // Cochran
  'TWIGGS': [32.6670, -83.4270], // Jeffersonville
  'WILKINSON': [32.8040, -83.1720], // Irwinton
  'BALDWIN': [33.0580, -83.2500], // Milledgeville
}

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
      // Get county coordinates for the selected system
      const county = selectedSystem.city_name?.toUpperCase() || 'FULTON'
      const coordinates = GEORGIA_COUNTIES[county] || GEORGIA_COUNTIES['FULTON']
      map.setView(coordinates, 10)
    }
  }, [selectedSystem, map])

  return null
}

// Generate coordinates based on county and system data
const generateCoordinates = (system: WaterSystemSearchResult): [number, number] => {
  // Try to find county coordinates first
  const county = system.city_name?.toUpperCase() || 'FULTON'
  const countyCoords = GEORGIA_COUNTIES[county]
  
  if (countyCoords) {
    // Add some randomization within the county bounds
    const latOffset = (Math.random() - 0.5) * 0.1 // ±0.05 degrees
    const lngOffset = (Math.random() - 0.5) * 0.1 // ±0.05 degrees
    return [countyCoords[0] + latOffset, countyCoords[1] + lngOffset]
  }
  
  // Fallback to Georgia center with system-based randomization
  const georgiaCenter = [32.1656, -82.9001]
  const systemHash = system.id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const latOffset = (systemHash % 1000) / 10000 - 0.05 // ±0.05 degrees
  const lngOffset = ((systemHash >> 10) % 1000) / 10000 - 0.05 // ±0.05 degrees
  
  return [georgiaCenter[0] + latOffset, georgiaCenter[1] + lngOffset]
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  if (searchResults.length === 0) {
    return (
      <div className="h-full w-full bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Water Systems Found</h3>
          <p className="text-gray-500">
            Search for water systems to see them on the map
          </p>
        </div>
      </div>
    )
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
          const coordinates = generateCoordinates(system)
          const markerKey = `${system.id}-${coordinates[0]}-${coordinates[1]}`
          
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
                      <p><strong>Population:</strong> {formatNumber(system.population_served_count)}</p>
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
          const coordinates = generateCoordinates(selectedSystem)
          const markerKey = `selected-${selectedSystem.id}`
          
          return (
            <Marker
              key={markerKey}
              position={coordinates}
              icon={blueIcon}
              eventHandlers={{
                click: () => onSystemSelect(selectedSystem)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm text-blue-600">
                      {selectedSystem.pws_name || 'Unnamed System'}
                    </h3>
                    <Badge variant="default" className="text-xs bg-blue-600">
                      SELECTED
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    <p><strong>PWSID:</strong> {selectedSystem.pwsid}</p>
                    {selectedSystem.city_name && <p><strong>City:</strong> {selectedSystem.city_name}</p>}
                    <p><strong>Type:</strong> {selectedSystem.pws_type_code}</p>
                    <p><strong>Status:</strong> {selectedSystem.pws_activity_code}</p>
                    {selectedSystem.population_served_count && (
                      <p><strong>Population:</strong> {formatNumber(selectedSystem.population_served_count)}</p>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-2 border-t">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-white ${getViolationStatusColor(selectedSystem.violation_count)}`}>
                      {selectedSystem.violation_count === 0 ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      {getViolationStatusText(selectedSystem.violation_count)}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })()}
      </MapContainer>
    </div>
  )
} 