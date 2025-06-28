# Water Systems Map Features

## Overview
The Water Systems Map page provides an interactive interface for searching and exploring Georgia's water systems and compliance data. The page includes a navigation bar, search functionality, and an interactive map powered by Leaflet.

## Features

### Navigation Bar
- Consistent navigation across all pages
- Links to Dashboard, Analytics, Map, and Settings
- Mobile-responsive design with hamburger menu
- Partner Login button

### Search Functionality
- **Basic Search**: Search by water system name, PWSID, or city
- **Advanced Search**: Expandable filters including:
  - State selection (Georgia)
  - System type (Community, Transient Non-Community, Non-Transient Non-Community)
  - Activity status (Active, Inactive, New)
  - Violation filter (systems with violations only)

### Interactive Map
- **Leaflet Integration**: Powered by react-leaflet for interactive mapping
- **Custom Markers**: Color-coded markers based on violation status:
  - 🟢 Green: Compliant systems (0 violations)
  - 🟡 Yellow: Minor issues (1-2 violations)
  - 🔴 Red: Major issues (3+ violations)
  - 🔵 Blue: Selected system
- **Interactive Popups**: Click markers to view system details
- **Map Controls**: Zoom in/out and layer controls

### Search Results Panel
- **Results List**: Scrollable list of search results
- **System Cards**: Each result shows:
  - System name
  - PWSID
  - City
  - Population served
  - Violation count with color-coded badges
- **Selection**: Click to select a system and view details

### System Details Panel
- **Selected System Info**: Shows when a system is selected
- **Key Information**:
  - System name and PWSID
  - System type and activity status
  - Population served
  - Violation count
- **Violations List**: Detailed list of violations for the selected system

### Violations Panel
- **Violation Details**: Shows when a system has violations
- **Information Displayed**:
  - Violation code
  - Category and status
  - Contaminant information
  - Dates and health-based indicators
- **Status Badges**: Color-coded violation status

## Technical Implementation

### Components
- `MapPage`: Main page component with search and layout
- `MapComponent`: Interactive map using Leaflet
- `Navigation`: Reusable navigation component

### Data Integration
- **Water Systems Repository**: Handles water system searches
- **Violations Repository**: Manages violation data
- **Supabase Backend**: Database queries for water system data

### Map Features
- **Georgia Focus**: Centered on Georgia with appropriate zoom levels
- **Mock Coordinates**: Demo coordinates for water system locations
- **Responsive Design**: Works on desktop and mobile devices
- **Custom Styling**: Tailored popup and marker styles

## Usage

1. **Search**: Enter a search term in the search bar
2. **Filter**: Use advanced search to narrow results
3. **Explore**: Click on search results to view details
4. **Map Interaction**: Click markers on the map to select systems
5. **View Violations**: See detailed violation information for selected systems

## Future Enhancements

- Real geographic coordinates for water systems
- County boundaries and watershed overlays
- Export functionality for map data
- Spatial filtering by geographic boundaries
- Real-time data updates
- Mobile-optimized map controls 