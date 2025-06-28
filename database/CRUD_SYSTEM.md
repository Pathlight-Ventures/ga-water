# CRUD System Documentation

## 🏗️ **Architecture Overview**

The SpeedTrials 2025 application uses a **secure, layered architecture** with stored procedures and a TypeScript repository pattern to prevent SQL injection and provide a clean API.

### **Architecture Layers**

```
┌─────────────────────────────────────┐
│           UI Components             │  ← React/Next.js UI
├─────────────────────────────────────┤
│         Repository Layer            │  ← TypeScript repositories
├─────────────────────────────────────┤
│      Supabase Client Layer          │  ← Database client
├─────────────────────────────────────┤
│      Stored Procedures              │  ← PostgreSQL functions
├─────────────────────────────────────┤
│         Database Schema             │  ← Tables and constraints
└─────────────────────────────────────┘
```

## 🔒 **Security Features**

### **SQL Injection Prevention**
- ✅ **Stored Procedures**: All database operations use PostgreSQL functions
- ✅ **Parameterized Queries**: No direct SQL string concatenation
- ✅ **Type Safety**: TypeScript interfaces for all data structures
- ✅ **Input Validation**: Repository layer validates all inputs
- ✅ **Row Level Security**: Supabase RLS policies enabled

### **Data Access Control**
- ✅ **Public Read Access**: All data is publicly readable
- ✅ **No Write Access**: No public write operations (data import only)
- ✅ **Audit Trail**: All tables have `created_at` and `updated_at` timestamps

## 📊 **Database Functions**

### **Water Systems Functions**

#### `get_water_system_by_pwsid(p_pwsid VARCHAR(9))`
- **Purpose**: Get detailed information about a specific water system
- **Parameters**: PWSID (Public Water System ID)
- **Returns**: Complete water system record
- **Usage**: `waterSystemsRepo.getByPwsid('GA1234567')`

#### `search_water_systems(...)`
- **Purpose**: Search water systems with advanced filtering
- **Parameters**: 
  - `p_search_term`: Text search in name, ID, or city
  - `p_state_code`: Filter by state
  - `p_pws_type`: Filter by system type
  - `p_activity_status`: Filter by activity status
  - `p_has_violations`: Filter by violation status
  - `p_limit`: Results limit
  - `p_offset`: Pagination offset
- **Returns**: Filtered water system list with violation counts
- **Usage**: `waterSystemsRepo.search({ searchTerm: 'Atlanta', stateCode: 'GA' })`

#### `get_water_system_stats()`
- **Purpose**: Get comprehensive statistics about water systems
- **Returns**: Total systems, active systems, violations, population served, etc.
- **Usage**: `waterSystemsRepo.getStats()`

### **Violations Functions**

#### `get_violations_by_pwsid(p_pwsid VARCHAR(9), ...)`
- **Purpose**: Get violations for a specific water system
- **Parameters**: PWSID, status filter, pagination
- **Returns**: Violation records with enforcement data
- **Usage**: `violationsRepo.getByPwsid('GA1234567')`

#### `get_violation_stats()`
- **Purpose**: Get violation statistics and trends
- **Returns**: Total violations, active violations, health-based violations, etc.
- **Usage**: `violationsRepo.getStats()`

### **Analytics Functions**

#### `get_compliance_trends(p_months_back INTEGER)`
- **Purpose**: Get compliance trends over time
- **Parameters**: Number of months to look back
- **Returns**: Monthly compliance rates and trends
- **Usage**: `analyticsRepo.getComplianceTrends({ monthsBack: 12 })`

## 🗂️ **Repository Layer**

### **Water Systems Repository**

```typescript
// Get a water system by PWSID
const waterSystem = await waterSystemsRepo.getByPwsid('GA1234567')

// Search water systems
const results = await waterSystemsRepo.search({
  searchTerm: 'Atlanta',
  stateCode: 'GA',
  hasViolations: true,
  limit: 50
})

// Get statistics
const stats = await waterSystemsRepo.getStats()

// Get systems by state
const gaSystems = await waterSystemsRepo.getByState('GA')

// Get systems with violations
const violatingSystems = await waterSystemsRepo.getWithViolations()
```

### **Violations Repository**

```typescript
// Get violations for a system
const violations = await violationsRepo.getByPwsid('GA1234567')

// Get active violations
const activeViolations = await violationsRepo.getActiveByPwsid('GA1234567')

// Get violation statistics
const violationStats = await violationsRepo.getStats()

// Get health-based violations
const healthViolations = await violationsRepo.getHealthBasedByPwsid('GA1234567')
```

### **Analytics Repository**

```typescript
// Get compliance trends
const trends = await analyticsRepo.getComplianceTrends({ monthsBack: 12 })

// Get violation trends by category
const categoryTrends = await analyticsRepo.getViolationTrendsByCategory(12)

// Get geographic distribution
const geoDistribution = await analyticsRepo.getGeographicViolationDistribution()

// Get system performance metrics
const metrics = await analyticsRepo.getSystemPerformanceMetrics()

// Get top violating systems
const topViolators = await analyticsRepo.getTopViolatingSystems(10)
```

## 📥 **Data Import System**

### **Bulk Import Functions**

#### `bulk_insert_water_systems(p_data JSON)`
- **Purpose**: Bulk import water systems data
- **Parameters**: JSON array of water system records
- **Features**: 
  - Upsert on conflict (submission_year_quarter, pwsid)
  - Automatic timestamp management
  - Data validation and cleaning
- **Usage**: `dataImporter.importWaterSystems(csvData)`

### **Import Process**

```typescript
// Import water systems
const result = await dataImporter.importWaterSystems(csvData)
console.log(`Imported ${result.recordsInserted} records`)

// Import violations
const violationResult = await dataImporter.importViolations(violationCsvData)

// Import facilities
const facilityResult = await dataImporter.importFacilities(facilityCsvData)

// Import reference codes
const refResult = await dataImporter.importReferenceCodes(refCsvData)
```

## 🔧 **Setup Instructions**

### **1. Database Setup**

```sql
-- Run the schema file
\i supabase/schema.sql

-- Run the functions file
\i supabase/functions.sql
```

### **2. Environment Variables**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **3. Import Data**

```typescript
import { dataImporter } from '@/lib/data-import'

// Import your CSV data
const result = await dataImporter.importWaterSystems(csvData)
```

## 📈 **Performance Optimizations**

### **Database Indexes**
- ✅ **Composite Indexes**: On frequently queried combinations
- ✅ **Partial Indexes**: For active systems and violations
- ✅ **Text Search Indexes**: For name and location searches

### **Query Optimization**
- ✅ **Stored Procedures**: Pre-compiled execution plans
- ✅ **Batch Processing**: Large imports processed in chunks
- ✅ **Pagination**: All list queries support pagination
- ✅ **Selective Columns**: Only fetch required data

### **Caching Strategy**
- ✅ **Repository Pattern**: Centralized data access
- ✅ **Type Safety**: Compile-time validation
- ✅ **Error Handling**: Comprehensive error management

## 🚀 **Usage Examples**

### **Search Interface**

```typescript
// Search water systems with filters
const searchResults = await waterSystemsRepo.search({
  searchTerm: 'Atlanta',
  stateCode: 'GA',
  pwsType: 'CWS',
  hasViolations: true,
  limit: 25,
  offset: 0
})
```

### **Analytics Dashboard**

```typescript
// Get comprehensive analytics
const [waterStats, violationStats, complianceTrends] = await Promise.all([
  waterSystemsRepo.getStats(),
  violationsRepo.getStats(),
  analyticsRepo.getComplianceTrends({ monthsBack: 12 })
])
```

### **System Details**

```typescript
// Get complete system information
const [system, violations, facilities] = await Promise.all([
  waterSystemsRepo.getByPwsid('GA1234567'),
  violationsRepo.getByPwsid('GA1234567'),
  facilitiesRepo.getByPwsid('GA1234567')
])
```

## 🔍 **Error Handling**

### **Repository Error Handling**

```typescript
try {
  const waterSystem = await waterSystemsRepo.getByPwsid('GA1234567')
  if (!waterSystem) {
    throw new Error('Water system not found')
  }
} catch (error) {
  console.error('Repository error:', error)
  // Handle error appropriately
}
```

### **Import Error Handling**

```typescript
const result = await dataImporter.importWaterSystems(csvData)
if (!result.success) {
  console.error('Import errors:', result.errors)
  // Handle import errors
}
```

## 📋 **Data Validation**

### **Input Validation**

```typescript
// Repository layer validates all inputs
const searchResults = await waterSystemsRepo.search({
  searchTerm: searchTerm?.trim(), // Sanitize input
  stateCode: stateCode?.toUpperCase(), // Normalize
  limit: Math.min(limit || 50, 100), // Enforce limits
  offset: Math.max(offset || 0, 0) // Ensure positive
})
```

### **Data Type Validation**

```typescript
// TypeScript interfaces ensure type safety
interface WaterSystem {
  pwsid: string
  pws_name: string | null
  population_served_count: number | null
  // ... other fields with proper types
}
```

## 🎯 **Benefits**

### **Security**
- ✅ **SQL Injection Prevention**: All queries use stored procedures
- ✅ **Input Validation**: Repository layer validates all inputs
- ✅ **Type Safety**: TypeScript prevents type-related errors
- ✅ **Access Control**: Row Level Security policies

### **Performance**
- ✅ **Optimized Queries**: Pre-compiled stored procedures
- ✅ **Efficient Indexing**: Strategic database indexes
- ✅ **Batch Processing**: Large data imports handled efficiently
- ✅ **Pagination**: Memory-efficient data retrieval

### **Maintainability**
- ✅ **Clean Architecture**: Separation of concerns
- ✅ **Type Safety**: Compile-time error detection
- ✅ **Comprehensive Error Handling**: Detailed error messages
- ✅ **Documentation**: Clear API documentation

### **Scalability**
- ✅ **Modular Design**: Easy to extend and modify
- ✅ **Efficient Queries**: Optimized for large datasets
- ✅ **Batch Operations**: Handle large data imports
- ✅ **Caching Ready**: Architecture supports caching layers

This CRUD system provides a robust, secure, and performant foundation for the SpeedTrials 2025 application, ensuring data integrity while maintaining excellent user experience. 