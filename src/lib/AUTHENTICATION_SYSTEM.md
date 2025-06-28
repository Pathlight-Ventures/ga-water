# Authentication & Role-Based Access Control System

## Overview

SpeedTrials 2025 implements a comprehensive authentication and role-based access control (RBAC) system using Supabase Auth and PostgreSQL stored procedures. The system is designed to serve the diverse needs of the EPD Drinking Water Program's stakeholders while maintaining security and data integrity.

## Architecture

### Authentication Flow

```txt
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   PostgreSQL    │
│   (Next.js)     │    │   Auth          │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Sign In/Up         │                       │
         │──────────────────────▶│                       │
         │                       │ 2. Validate Credentials│
         │                       │──────────────────────▶│
         │                       │                       │
         │                       │ 3. Create Session     │
         │                       │◀──────────────────────│
         │ 4. Session Token      │                       │
         │◀──────────────────────│                       │
         │                       │                       │
         │ 5. API Calls          │                       │
         │──────────────────────▶│                       │
         │                       │ 6. RPC with Auth      │
         │                       │──────────────────────▶│
         │                       │                       │
         │                       │ 7. Check Permissions  │
         │                       │◀──────────────────────│
         │ 8. Data Response      │                       │
         │◀──────────────────────│                       │
```

### Database Schema

#### Authentication Tables

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    organization VARCHAR(255),
    role user_role_enum DEFAULT 'public',
    pwsid VARCHAR(9), -- For operators, link to their water system
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role permissions mapping
CREATE TABLE role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role user_role_enum NOT NULL,
    permission permission_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, permission)
);

-- User sessions for tracking
CREATE TABLE user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log for sensitive operations
CREATE TABLE audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## User Roles

### Role Hierarchy

1. **Public** - Basic read-only access to public data
2. **Operator** - Water system operators with system-specific access
3. **Laboratory** - Laboratory staff with sample data access
4. **EPD Staff** - EPD personnel with regulatory access
5. **EPA Staff** - EPA personnel with federal oversight access
6. **Admin** - System administrators with full access

### Role Permissions

| Permission | Public | Operator | Laboratory | EPD Staff | EPA Staff | Admin |
|------------|--------|----------|------------|-----------|-----------|-------|
| `read_public_data` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `read_operator_data` | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `read_lab_data` | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `read_epd_data` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `read_epa_data` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `write_operator_data` | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| `write_lab_data` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `write_epd_data` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `write_epa_data` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `export_data` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `import_data` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `manage_users` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `view_analytics` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `manage_system` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## Implementation

### Frontend Authentication

#### Auth Context (`src/lib/auth.ts`)

```typescript
// Authentication context provides user state and auth methods
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Authentication methods
  const signIn = async (email: string, password: string) => { /* ... */ }
  const signUp = async (email: string, password: string, metadata?: any) => { /* ... */ }
  const signOut = async () => { /* ... */ }
  const updateProfile = async (profileData: Partial<UserProfile>) => { /* ... */ }

  // Permission checking
  const hasPermission = (permission: string): boolean => { /* ... */ }
  const hasRole = (role: UserProfile['role']): boolean => { /* ... */ }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

#### Permission-Based Components

```typescript
// RequirePermission component for conditional rendering
export function RequirePermission({ 
  permission, 
  children, 
  fallback = null 
}: { 
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasPermission } = useAuth()
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Usage example
<RequirePermission permission="view_analytics">
  <AnalyticsDashboard />
</RequirePermission>
```

### Backend Authentication

#### Stored Procedures with Auth Checks

```sql
-- Example: Get water system with authentication
CREATE OR REPLACE FUNCTION get_water_system_by_pwsid(p_pwsid VARCHAR(9))
RETURNS TABLE (/* ... */) AS $$
BEGIN
    -- Check if user has permission to read public data
    IF NOT has_permission('read_public_data') THEN
        RAISE EXCEPTION 'Insufficient permissions to read water system data';
    END IF;
    
    RETURN QUERY
    SELECT /* ... */
    FROM public_water_systems pws
    WHERE pws.pwsid = p_pwsid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Authentication Helper Functions

```sql
-- Get current user's role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role_enum AS $$
DECLARE
    user_role user_role_enum;
BEGIN
    SELECT role INTO user_role
    FROM user_profiles
    WHERE id = auth.uid();
    
    RETURN COALESCE(user_role, 'public');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has permission
CREATE OR REPLACE FUNCTION has_permission(p_permission permission_enum)
RETURNS BOOLEAN AS $$
DECLARE
    user_role user_role_enum;
BEGIN
    user_role := get_current_user_role();
    
    RETURN EXISTS (
        SELECT 1 FROM role_permissions
        WHERE role = user_role AND permission = p_permission
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Security Features

### Row Level Security (RLS)

All tables have RLS policies enabled:

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_water_systems ENABLE ROW LEVEL SECURITY;
-- ... etc

-- Example RLS policy for user profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### Audit Logging

All sensitive operations are logged:

```sql
-- Audit log function
CREATE OR REPLACE FUNCTION log_audit_event(
    p_action VARCHAR(100),
    p_table_name VARCHAR(100) DEFAULT NULL,
    p_record_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_log (
        user_id, action, table_name, record_id,
        old_values, new_values, ip_address, user_agent
    ) VALUES (
        auth.uid(), p_action, p_table_name, p_record_id,
        p_old_values, p_new_values, inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Session Management

User sessions are tracked for security:

```sql
-- Session tracking
CREATE TABLE user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Usage Examples

### Frontend Usage

#### Authentication Pages

```typescript
// Login page
export default function LoginPage() {
  const { signIn } = useAuth()
  
  const handleSubmit = async (e: React.FormEvent) => {
    const { error } = await signIn(email, password)
    if (!error) {
      router.push('/')
    }
  }
}

// Signup page with role selection
export default function SignupPage() {
  const { signUp } = useAuth()
  
  const handleSubmit = async (e: React.FormEvent) => {
    const { error } = await signUp(email, password, {
      full_name: fullName,
      organization: organization,
      role: selectedRole,
      pwsid: pwsid // For operators
    })
  }
}
```

#### Protected Components

```typescript
// Role-based navigation
{hasRole('operator') && (
  <Link href="/operator">
    <Building2 className="w-4 h-4" />
    <span>My System</span>
  </Link>
)}

// Permission-based features
<RequirePermission permission="view_analytics">
  <AnalyticsDashboard />
</RequirePermission>
```

### Backend Usage

#### Repository Layer

```typescript
// All repository calls automatically include authentication
export class Repository {
  static async getWaterSystemByPwsid(pwsid: string) {
    const { data, error } = await supabase
      .rpc('get_water_system_by_pwsid', { p_pwsid: pwsid })
    
    if (error) throw error
    return data
  }
}
```

#### Direct RPC Calls

```typescript
// User management (admin only)
const updateUserProfile = async (profileData: any) => {
  const { data, error } = await supabase
    .rpc('upsert_user_profile', profileData)
  
  if (error) throw error
  return data
}
```

## Setup Instructions

### 1. Database Setup

Run the schema and functions:

```bash
# Run schema with authentication tables
psql -d your_database -f supabase/schema.sql

# Run functions with authentication
psql -d your_database -f supabase/functions.sql
```

### 2. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Configuration

1. Enable Row Level Security in Supabase dashboard
2. Configure authentication providers (email/password)
3. Set up email templates for verification
4. Configure session management settings

### 4. Create Admin User

```sql
-- Create admin user (run in Supabase SQL editor)
INSERT INTO user_profiles (
    id, email, full_name, role, is_active
) VALUES (
    'admin-user-id', 'admin@example.com', 'System Admin', 'admin', true
);

-- Grant admin permissions
INSERT INTO role_permissions (role, permission)
SELECT 'admin', permission FROM (
    VALUES 
        ('read_public_data'),
        ('read_operator_data'),
        ('read_lab_data'),
        ('read_epd_data'),
        ('read_epa_data'),
        ('write_operator_data'),
        ('write_lab_data'),
        ('write_epd_data'),
        ('write_epa_data'),
        ('export_data'),
        ('import_data'),
        ('manage_users'),
        ('view_analytics'),
        ('manage_system')
) AS permissions(permission);
```

## Best Practices

### Security

1. **Always use stored procedures** for data access
2. **Validate permissions** at the database level
3. **Log sensitive operations** in audit trail
4. **Use HTTPS** in production
5. **Implement session timeout** policies

### User Management

1. **Assign appropriate roles** based on user needs
2. **Regularly review permissions** and access
3. **Implement least privilege** principle
4. **Monitor audit logs** for suspicious activity

### Development

1. **Test with different roles** during development
2. **Use permission wrappers** for UI components
3. **Handle authentication errors** gracefully
4. **Provide clear error messages** for permission issues

## Troubleshooting

### Common Issues

1. **Permission denied errors**: Check user role and permissions
2. **Session expired**: Implement proper session refresh
3. **RLS blocking queries**: Verify RLS policies are correct
4. **Profile not created**: Check user profile creation logic

### Debug Commands

```sql
-- Check user permissions
SELECT role, permission FROM role_permissions 
WHERE role = (SELECT role FROM user_profiles WHERE id = auth.uid());

-- View audit log
SELECT * FROM audit_log 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC 
LIMIT 10;

-- Check active sessions
SELECT * FROM user_sessions 
WHERE user_id = auth.uid() 
AND expires_at > NOW();
```

## Future Enhancements

1. **Multi-factor authentication** (MFA)
2. **SAML/SSO integration** for enterprise users
3. **Advanced audit reporting**
4. **Role-based data masking**
5. **API rate limiting** by role
6. **Session analytics** and monitoring

---

This authentication system provides a secure, scalable foundation for the SpeedTrials 2025 application while serving the diverse needs of Georgia's EPD Drinking Water Program stakeholders.
