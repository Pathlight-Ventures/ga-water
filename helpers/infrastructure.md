# Infrastructure and Database Architecture

## 🏗️ **CRUD System Architecture**

The SpeedTrials 2025 application uses a **secure, layered architecture** with stored procedures and a TypeScript repository pattern to prevent SQL injection and provide a clean API.

### **Architecture Layers**

```architecture
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
- **Parameters**
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
- **Features**
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

## 📊 **Database Schema Review**

### **Critical Issues Found**

After reviewing the actual CSV data structure from the Georgia Q1 2025 SDWIS export, several critical issues were identified with the original schema that would prevent proper data import and functionality.

### **1. Missing Critical Fields**

The original schema was missing **50+ important fields** that are present in the actual data:

#### **Public Water Systems (Missing 30+ fields)**

- `SUBMISSIONYEARQUARTER` - **CRITICAL** for data versioning and quarterly snapshots
- `PRIMACY_AGENCY_CODE` - State agency code (GA for Georgia)
- `EPA_REGION` - EPA region information (04 for Georgia)
- `SEASON_BEGIN_DATE` / `SEASON_END_DATE` - For seasonal systems
- `PWS_DEACTIVATION_DATE` - System closure date
- `DBPR_SCHEDULE_CAT_CODE` - Stage 2 DBP schedule categories
- `CDS_ID` - Combined distribution system ID
- `GW_SW_CODE` - Source type code
- `LT2_SCHEDULE_CAT_CODE` - LT2 schedule categories
- `POP_CAT_*_CODE` - Multiple population category codes
- `PRIMACY_TYPE` - Primacy type (State, Tribal, etc.)
- `IS_GRANT_ELIGIBLE_IND` - Grant eligibility indicator
- `IS_WHOLESALER_IND` - Wholesaler indicator
- `IS_SCHOOL_OR_DAYCARE_IND` - School/daycare indicator
- `SUBMISSION_STATUS_CODE` - Submission status (Y/U/R)
- `ORG_NAME` - Legal entity name
- `PHONE_EXT_NUMBER`, `FAX_NUMBER`, `ALT_PHONE_NUMBER` - Additional contact info
- `ADDRESS_LINE1`, `ADDRESS_LINE2` - Full address information
- `COUNTRY_CODE` - Country code
- `FIRST_REPORTED_DATE`, `LAST_REPORTED_DATE` - Reporting dates
- `SOURCE_WATER_PROTECTION_CODE` - Source water protection status
- `OUTSTANDING_PERFORMER` - Outstanding performer status
- `REDUCED_RTCR_MONITORING` - Reduced monitoring information
- `SEASONAL_STARTUP_SYSTEM` - Seasonal system information

#### **Violations (Missing 20+ fields)**

- `SUBMISSIONYEARQUARTER` - **CRITICAL** for data versioning
- `FACILITY_ID` - Facility identifier
- `COMPL_PER_BEGIN_DATE`, `COMPL_PER_END_DATE` - Compliance periods
- `PWS_DEACTIVATION_DATE` - System deactivation date
- `IS_MAJOR_VIOL_IND` - Major violation indicator
- `SEVERITY_IND_CNT` - Severity count
- `CALCULATED_RTC_DATE` - Return to compliance date
- `PUBLIC_NOTIFICATION_TIER` - Public notification tier
- `CALCULATED_PUB_NOTIF_TIER` - Calculated notification tier
- `VIOL_ORIGINATOR_CODE` - Violation originator
- `SAMPLE_RESULT_ID` - Sample result link
- `CORRECTIVE_ACTION_ID` - Corrective action ID
- `RULE_GROUP_CODE` - Rule group code
- `VIOL_FIRST_REPORTED_DATE`, `VIOL_LAST_REPORTED_DATE` - Violation reporting dates
- `ENFORCEMENT_ID` - Enforcement action ID
- `ENFORCEMENT_DATE` - Enforcement date
- `ENFORCEMENT_ACTION_TYPE_CODE` - Enforcement action type
- `ENF_ACTION_CATEGORY` - Enforcement category (Formal/Informal/Resolving)
- `ENF_ORIGINATOR_CODE` - Enforcement originator
- `ENF_FIRST_REPORTED_DATE`, `ENF_LAST_REPORTED_DATE` - Enforcement reporting dates

### **2. Missing Tables**

The original schema was missing **4 important tables**:

- **Events and Milestones** (`SDWA_EVENTS_MILESTONES.csv`) - Critical for tracking compliance milestones
- **Public Notice Violations** (`SDWA_PN_VIOLATION_ASSOC.csv`) - Public notification violations
- **Service Areas** (`SDWA_SERVICE_AREAS.csv`) - Service area information
- **ANSI Areas** (`SDWA_REF_ANSI_AREAS.csv`) - Geographic reference data

### **3. Data Type Issues**

- Some fields should be `TEXT` instead of `VARCHAR` for longer content
- Date fields need proper handling for various formats (MM/DD/YYYY)
- Numeric fields need proper precision handling
- Missing proper enum types for facility types and other categorical data

### **4. Challenge Requirements Alignment**

The challenge specifically asks for solutions that serve:

1. **The Public** - Need violation status, health implications, compliance tracking
2. **The Operators** - Need system information, regulatory notices, compliance tasks
3. **The Regulators** - Need field kit functionality, system status, drill-down capabilities

The original schema was missing critical fields needed for these use cases:

- Enforcement action tracking
- Public notification tiers
- Compliance period tracking
- Facility-specific violations
- Geographic service areas

## ✅ **Updated Schema Solution**

The updated schema includes:

### **1. Complete Field Coverage**

- Includes all 50+ missing fields from the actual CSV structure
- Proper data types and constraints
- Comprehensive enum types for categorical data

### **2. All Required Tables**

- 11 tables total (vs 7 in original)
- Proper relationships and foreign keys
- Optimized indexes for performance

### **3. Challenge-Ready Features**

- **Public Interface**: Violation status, health-based indicators, public notification tiers
- **Operator Interface**: System details, enforcement actions, compliance tracking
- **Regulator Interface**: Site visit data, evaluation codes, geographic information

### **4. Data Integrity**

- Proper unique constraints on composite keys
- Row Level Security policies
- Automatic timestamp management
- Comprehensive indexing strategy

## 🚀 **Next Steps**

1. **Use the updated schema** (`supabase/schema_updated.sql`) instead of the original
2. **Update TypeScript types** to use `database_updated.ts`
3. **Update data import functions** to handle the new field structure
4. **Test with actual CSV data** to ensure proper import

## 📊 **Impact on Challenge Success**

The updated schema directly supports the challenge requirements:

- **Core Delivery**: ✅ Preserves all data accurately
- **Impact and Relevance**: ✅ Enables all three stakeholder interfaces
- **Ambition and Scope**: ✅ Comprehensive data model for advanced features
- **Iron Man Score**: ✅ AI-assisted schema analysis and correction

The original schema would have failed to import the actual data properly and would have severely limited the application's functionality for the target users.
