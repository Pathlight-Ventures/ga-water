# SpeedTrials 2025 - Georgia Drinking Water Data Explorer

A fullstack application for exploring and analyzing Georgia's Safe Drinking Water Information System (SDWIS) data.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Language**: TypeScript

## 📊 Data Source

This application uses Q1 2025 SDWIS data for the state of Georgia, including:

- Public Water Systems
- Violations and Enforcement
- Facilities
- Site Visits
- Lead and Copper Samples
- Geographic Areas
- Reference Codes

## 🛠️ Setup

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

   Then edit `.env.local` with your Supabase credentials.

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
   - Copy your project URL and anon key to `.env.local`

5. **Run the development server**

   ```bash
   npm run dev
   ```

## 📁 Project Structure

```txt
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                 # Utility functions and configurations
│   ├── supabase.ts     # Supabase client configuration
│   └── data-dictionary.ts # SDWIS code lookups and descriptions
├── types/               # TypeScript type definitions
│   └── database.ts     # Database schema types
└── utils/               # Helper functions

supabase/
└── schema.sql          # Database schema
```

## 🗄️ Database Schema

The application uses a simplified version of the SDWIS schema with the following main tables:

- **public_water_systems**: Core water system information
- **violations**: Violation records and enforcement actions
- **facilities**: Water system facilities and infrastructure
- **site_visits**: Inspection and evaluation records
- **lead_copper_samples**: Lead and copper testing data
- **geographic_areas**: Service area information
- **reference_codes**: Code lookups and descriptions

## 🎨 UI Design Philosophy

The application follows a minimalist design approach:

- Clean, uncluttered interfaces
- Progressive disclosure of information
- Clear data visualization
- Mobile-responsive design
- Accessible color schemes and typography

## 🚀 Deployment

The application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📚 Data Dictionary

The application includes a comprehensive data dictionary for all SDWIS codes and their human-readable descriptions. See `src/lib/data-dictionary.ts` for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
