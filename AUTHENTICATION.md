# Authentication System Documentation

## 🔐 **Overview**

The SpeedTrials 2025 application uses **Supabase Authentication** with a comprehensive **role-based approval system** for secure partner access. The system includes role selection during signup, email verification, admin approval workflow, and role-based access control.

## 🏗️ **Architecture**

### **Authentication Flow**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Signup   │───▶│  Email Verify   │───▶│  Admin Review   │
│  (with Role)    │    │   (Required)    │    │   (Required)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Pending        │    │  Pending        │    │  Full Access    │
│  Approval       │    │  Approval       │    │  (Role-based)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **User Roles**

- **👨‍🔬 Researcher** - Academic or research institution access
- **🏛️ Regulator** - Government regulatory agency access  
- **💼 Consultant** - Environmental consulting firm access
- **👥 Public** - General public user access
- **🛡️ Admin** - System administrator with full control

### **User Statuses**

- **⏳ Pending Approval** - Awaiting admin review
- **✅ Approved** - Full access granted
- **❌ Rejected** - Access denied
- **🚫 Suspended** - Temporarily blocked

## 🚀 **Features**

### **Enhanced User Registration**
- ✅ **Role Selection** - Users choose their role during signup
- ✅ **Organization Details** - Required organization information
- ✅ **Email Verification** - Mandatory email confirmation
- ✅ **Admin Approval** - All accounts require admin approval
- ✅ **Status Tracking** - Real-time approval status updates

### **Admin Management System**
- ✅ **Approval Dashboard** - Centralized user management
- ✅ **Bulk Operations** - Approve/reject multiple users
- ✅ **User Statistics** - Comprehensive user analytics
- ✅ **Search & Filter** - Advanced user search capabilities
- ✅ **Rejection Reasons** - Detailed rejection feedback

### **Security Features**
- ✅ **Route Protection** - Middleware-based access control
- ✅ **Role-Based Access** - Different permissions per role
- ✅ **Approval Workflow** - Multi-step verification process
- ✅ **Session Management** - Secure session handling
- ✅ **Audit Trail** - Complete user activity tracking

### **User Experience**
- ✅ **Status Pages** - Clear approval status communication
- ✅ **Email Notifications** - Automated status updates
- ✅ **Progress Indicators** - Visual approval progress
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **Accessible Design** - WCAG compliant interface

## 📁 **File Structure**

```
src/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx              # Enhanced login/signup page
│   │   └── pending-approval/
│   │       └── page.tsx              # Pending approval status page
│   └── admin/
│       └── page.tsx                  # Admin dashboard
├── lib/
│   ├── contexts/
│   │   └── AuthContext.tsx           # Enhanced auth state management
│   ├── repository/
│   │   └── user-management.ts        # User management operations
│   └── supabase/
│       └── client.ts                 # Supabase client configuration
├── components/
│   └── navigation.tsx                # Role-aware navigation
└── middleware.ts                     # Enhanced route protection

supabase/
└── user_profiles.sql                 # User profiles and approval schema
```

## 🔧 **Setup Instructions**

### **1. Environment Variables**

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **2. Database Setup**

Run the user profiles schema in your Supabase SQL editor:

```sql
-- Run the contents of supabase/user_profiles.sql
-- This creates the user_profiles table and all related functions
```

### **3. Create Admin User**

1. Create a user account through the signup process
2. Manually update their role to 'admin' in the database:

```sql
UPDATE user_profiles 
SET role = 'admin', status = 'approved', approved_by = user_id, approved_at = NOW()
WHERE email = 'admin@example.com';
```

## 🎯 **Usage Examples**

### **User Registration Flow**

```typescript
// 1. User fills out signup form with role selection
const signupData = {
  email: 'researcher@university.edu',
  password: 'securepassword123',
  fullName: 'Dr. Jane Smith',
  organization: 'Georgia State University',
  role: 'researcher'
}

// 2. Account created with pending_approval status
// 3. User receives email verification
// 4. After email verification, account awaits admin approval
// 5. Admin approves/rejects in admin dashboard
// 6. User receives notification and gains access
```

### **Admin Approval Process**

```typescript
import { userManagementRepo } from '@/lib/repository/user-management'

// Get pending approvals
const pendingUsers = await userManagementRepo.getPendingApprovals()

// Approve user
await userManagementRepo.approveUser(userId, adminUserId)

// Reject user with reason
await userManagementRepo.rejectUser(userId, adminUserId, 'Invalid organization')
```

### **Role-Based Access Control**

```typescript
import { useAuth } from '@/lib/contexts/AuthContext'

function MyComponent() {
  const { isAdmin, userRole, isApproved } = useAuth()
  
  if (!isApproved) {
    return <PendingApprovalMessage />
  }
  
  if (isAdmin) {
    return <AdminDashboard />
  }
  
  switch (userRole) {
    case 'researcher':
      return <ResearcherView />
    case 'regulator':
      return <RegulatorView />
    case 'consultant':
      return <ConsultantView />
    default:
      return <PublicView />
  }
}
```

## 🔒 **Security Considerations**

### **Approval Workflow Security**

1. **Email Verification** - Prevents fake email addresses
2. **Admin Review** - Manual verification of user legitimacy
3. **Role Validation** - Ensures appropriate role assignment
4. **Organization Verification** - Validates user affiliations
5. **Audit Trail** - Tracks all approval decisions

### **Access Control**

- **Public Routes** - Available to all users
- **Protected Routes** - Require authentication and approval
- **Admin Routes** - Require admin role and approval
- **Role-Specific Features** - Based on user role

### **Data Protection**

- **Row Level Security** - Database-level access control
- **Input Validation** - Client and server-side validation
- **Session Security** - Secure session management
- **Error Handling** - No sensitive information exposure

## 🐛 **Troubleshooting**

### **Common Issues**

1. **"Account pending approval"**
   - Normal workflow - wait for admin approval
   - Check email for verification link
   - Contact support if approval is delayed

2. **"Access denied to admin area"**
   - Verify user has admin role
   - Ensure account is approved
   - Check role assignment in database

3. **"Email verification failed"**
   - Check spam folder
   - Verify email address is correct
   - Request new verification email

4. **"Role not showing correctly"**
   - Refresh user profile data
   - Check database role assignment
   - Clear browser cache

### **Admin Troubleshooting**

1. **Cannot approve users**
   - Verify admin role and status
   - Check database permissions
   - Ensure proper authentication

2. **User statistics not loading**
   - Check database connection
   - Verify function permissions
   - Review error logs

## 📚 **Additional Resources**

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Role-Based Access Control Best Practices](https://owasp.org/www-project-cheat-sheets/cheatsheets/Authorization_Cheat_Sheet.html)

## 🤝 **Support**

For authentication-related issues:

1. Check the troubleshooting section above
2. Review Supabase dashboard logs
3. Check browser developer console for errors
4. Verify environment variable configuration
5. Contact system administrator for approval issues 