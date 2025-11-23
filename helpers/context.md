# Project Context and Overview

## SpeedTrials 2025 - Georgia Drinking Water Data Explorer

A fullstack application for exploring and analyzing Georgia's Safe Drinking Water Information System (SDWIS) data, designed to serve the EPD Drinking Water Program's diverse stakeholder needs.

## 🎯 **EPD Drinking Water Program Stakeholder Support**

### **Public Access & Transparency**

- **Water System Search**: Public can view data for any chosen water system or search across multiple systems
- **Violation Tracking**: Real-time access to compliance status and violation history
- **Health-Based Alerts**: Public notification tiers and health-based violation indicators
- **Geographic Explorer**: Interactive map showing water system locations and compliance status
- **Data Transparency**: Open access to all public drinking water data for Georgia

### **Water System Operators**

- **System Management**: Comprehensive view of their water system's compliance status
- **Violation Alerts**: Real-time notifications of violations and required corrective actions
- **Facility Information**: Detailed facility data and operational requirements
- **Compliance Tracking**: Historical compliance data and trend analysis
- **Contact Information**: Direct access to regulatory contacts and support resources

### **Laboratory Support**

- **QA/QC Data Analysis**: Quality Assurance/Quality Control tools for data validation
- **Electronic Sample Submissions**: Download capabilities for required data formats
- **Sample Tracking**: Lead and copper sample data with result validation
- **Compliance Verification**: Automated checking of sample submission requirements
- **Data Export**: Bulk data export for laboratory management systems

### **State & EPA Staff (Field Kit Functionality)**

- **Mobile-Ready Interface**: Responsive design optimized for phone and tablet use
- **Live Data Access**: Real-time information for meetings, conferences, and site visits
- **Detailed System Profiles**: Comprehensive water system information at your fingertips
- **Violation Details**: Complete violation history with enforcement actions
- **Site Visit Integration**: Site visit data and evaluation codes for field assessments
- **Offline Capability**: Critical data available even with limited connectivity

## 🚀 **Tech Stack**

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Language**: TypeScript
- **Security**: Stored procedures + Row Level Security

## 📊 **Data Source**

This application uses Q1 2025 SDWIS data for the state of Georgia, including:

- Public Water Systems (1,247+ systems)
- Violations and Enforcement Actions
- Facilities and Infrastructure
- Site Visits and Evaluations
- Lead and Copper Samples
- Geographic Areas and Service Boundaries
- Reference Codes and Data Dictionary

## 🔒 **Security & Authentication**

### **Database Security**

- **Stored Procedures**: All database operations use PostgreSQL functions to prevent SQL injection
- **Row Level Security (RLS)**: Supabase RLS policies ensure data access control
- **Parameterized Queries**: No direct SQL string concatenation
- **Type Safety**: TypeScript interfaces for all data structures
- **Input Validation**: Repository layer validates and sanitizes all inputs

### **Access Control**

- **Public Read Access**: All drinking water data is publicly accessible (transparency requirement)
- **No Public Write Access**: Data modifications only through secure import functions
- **Audit Trail**: All tables include `created_at` and `updated_at` timestamps
- **Data Integrity**: Foreign key constraints and data validation

## 🏗️ **Architecture Overview**

### **Layered Architecture**

```txt
┌─────────────────────────────────────┐
│           UI Components             │  ← React/Next.js with shadcn/ui
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

### **CRUD System**

- **Repository Pattern**: Clean separation of data access logic
- **Stored Procedures**: 20+ PostgreSQL functions for all operations
- **Type Safety**: Full TypeScript support with interfaces
- **Error Handling**: Comprehensive error management and logging
- **Performance**: Optimized queries with strategic indexing

## 🛠️ **Setup**

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd speedtrials-2025
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env.local
   ```

   Then edit `.env.local` with your Supabase credentials:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
   - Run the functions from `supabase/functions.sql` to create stored procedures
   - Copy your project URL and anon key to `.env.local`

5. **Import Data**

   ```typescript
   import { dataImporter } from '@/lib/data-import'
   
   // Import your CSV data
   const result = await dataImporter.importWaterSystems(csvData)
   ```

6. **Run the development server**

   ```bash
   npm run dev
   ```

## 🤖 **AI Chat Assistant Setup**

The application includes an AI-powered chat assistant powered by Google's Gemini AI that helps users understand water quality data, regulations, and system information.

### **Setting up Gemini AI**

1. **Get a Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the API key

2. **Add to Environment Variables**

   Add the following to your `.env.local` file:

   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Features**
   - **Water Safety Guidance**: Get explanations of water quality standards and regulations
   - **Data Interpretation**: Understand violation types and compliance requirements
   - **System Information**: Learn about public water system operations
   - **Regulatory Help**: Get guidance on EPA and state requirements
   - **Context-Aware**: Uses real-time data from your Supabase database

4. **Usage**
   - Click the chat icon (💬) in the bottom-right corner of any page
   - Ask questions about water quality, regulations, or data interpretation
   - The assistant will provide helpful, context-aware responses
   - All conversations are focused on water safety and quality topics

### **Chat Assistant Capabilities**

- **Water Quality Standards**: Explain MCLs, treatment techniques, and monitoring requirements
- **Violation Types**: Clarify different categories of violations and their significance
- **Compliance Guidance**: Help understand regulatory requirements and timelines
- **Data Navigation**: Guide users through the application's features and data
- **Safety Information**: Provide public health guidance related to drinking water

## 📁 **Project Structure**

```txt
src/
├── app/                 # Next.js App Router pages
│   ├── page.tsx        # Dashboard
│   ├── search/         # Water system search
│   ├── analytics/      # Data analytics
│   ├── map/           # Geographic explorer
│   └── settings/      # User preferences
├── components/          # Reusable UI components
│   ├── ui/            # shadcn/ui components
│   └── navigation.tsx # App navigation
├── lib/                 # Utility functions and configurations
│   ├── repository/     # Data access layer
│   │   ├── water-systems.ts
│   │   ├── violations.ts
│   │   ├── analytics.ts
│   │   └── index.ts
│   ├── supabase/       # Database configuration
│   │   └── client.ts
│   ├── data-import.ts  # Data import utilities
│   └── data-dictionary.ts # SDWIS code lookups
└── types/               # TypeScript type definitions
    └── database.ts     # Database schema types

supabase/
├── schema.sql          # Database schema
└── functions.sql       # Stored procedures
```

## 🗄️ **Database Schema**

The application uses a comprehensive SDWIS schema with 11 main tables:

- **public_water_systems**: Core water system information (50+ fields)
- **violations_enforcement**: Violation records and enforcement actions
- **facilities**: Water system facilities and infrastructure
- **site_visits**: Inspection and evaluation records
- **lead_copper_samples**: Lead and copper testing data
- **geographic_areas**: Service area information
- **service_areas**: Service area details
- **events_milestones**: Compliance milestones and events
- **public_notice_violations**: Public notification violations
- **reference_codes**: Code lookups and descriptions
- **ansi_areas**: Geographic reference data

## 🎨 **UI Design Philosophy**

The application follows a modern, accessible design approach:

- **Clean Interfaces**: Uncluttered, professional layouts
- **Progressive Disclosure**: Information revealed as needed
- **Mobile-First**: Responsive design for field use
- **Accessibility**: WCAG compliant color schemes and typography
- **Data Visualization**: Clear charts and analytics
- **shadcn/ui Components**: Modern, accessible UI components

## 📊 **Key Features**

### **Search & Discovery**

- Advanced water system search with filters
- Geographic search and mapping
- Violation-based filtering
- Real-time search results

### **Analytics & Reporting**

- Compliance trend analysis
- Violation statistics and patterns
- Geographic distribution analysis
- System performance metrics

### **Data Export**

- CSV/Excel export capabilities
- Bulk data downloads
- Custom report generation
- API access for integrations

### **Mobile Optimization**

- Responsive design for all devices
- Touch-friendly interfaces
- Offline data caching
- Fast loading times

## 🚀 **Deployment**

The application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📚 **Data Dictionary**

The application includes a comprehensive data dictionary for all SDWIS codes and their human-readable descriptions. See `src/lib/data-dictionary.ts` for details.

## 🔧 **Development**

### **Repository Usage**

```typescript
import { waterSystemsRepo, violationsRepo, analyticsRepo } from '@/lib/repository'

// Search water systems
const results = await waterSystemsRepo.search({
  searchTerm: 'Atlanta',
  stateCode: 'GA',
  hasViolations: true
})

// Get violation statistics
const stats = await violationsRepo.getStats()

// Get compliance trends
const trends = await analyticsRepo.getComplianceTrends({ monthsBack: 12 })
```

### **Data Import**

```typescript
import { dataImporter } from '@/lib/data-import'

// Import water systems data
const result = await dataImporter.importWaterSystems(csvData)
console.log(`Imported ${result.recordsInserted} records`)
```

## Quick Start: Run Prototype Demo

### To Run the Prototype Application

```bash
cd ga-water
npm install
npm run dev
```

Then open your browser to: **`http://localhost:3000`**

### All Prototype Pages Are Accessible

✅ **`http://localhost:3000/documents`** - Document Management
✅ **`http://localhost:3000/compliance`** - Compliance Tracking & MCL Management  
✅ **`http://localhost:3000/reports`** - Reporting & Excel Export
✅ **`http://localhost:3000/notifications`** - Notification Center
✅ **`http://localhost:3000/forms`** - Forms Management
✅ **`http://localhost:3000/data-exchange`** - SDWIS Data Exchange
✅ **`http://localhost:3000/admin/audit-trail`** - Audit Trail Viewer

### Navigation

Use the navigation menu at the top of any page to access all prototype pages.

### Demo Mode

The application runs in **demo mode** without requiring Supabase configuration:

- All pages work with mock data
- No database connection required
- All UI features are functional
- Perfect for presentation demonstrations

### Build Status

✅ **Build successful** - All prototype pages compile without errors
✅ **All lint errors fixed** - Code is clean and ready
✅ **Navigation updated** - All prototype pages accessible from menu

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

## 📞 **Support**

For questions about the EPD Drinking Water Program or data access, please contact the Georgia Environmental Protection Division.

---

**Built for the Georgia EPD Drinking Water Program** - Providing transparency, compliance support, and field-ready tools for Georgia's drinking water infrastructure.
