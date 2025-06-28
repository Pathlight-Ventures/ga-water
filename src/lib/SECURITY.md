# Security Configuration Guide for SpeedTrials 2025

## 🔒 **Pre-Deployment Security Checklist**

### **1. Environment Variables Setup**

Create `.env.local` with these variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Security Headers
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_ENV=production

# Rate Limiting
NEXT_PUBLIC_RATE_LIMIT_MAX=100
NEXT_PUBLIC_RATE_LIMIT_WINDOW=900000

# Content Security Policy
NEXT_PUBLIC_CSP_NONCE=your_csp_nonce

# Analytics & Monitoring (Optional)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# API Security
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_MAX_PAYLOAD_SIZE=1048576

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_EXPORT=true
NEXT_PUBLIC_ENABLE_MAP=true
```

### **2. Vercel Environment Variables**

Set these in your Vercel dashboard:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL

# Security
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_RATE_LIMIT_MAX=100
NEXT_PUBLIC_RATE_LIMIT_WINDOW=900000

# Optional
NEXT_PUBLIC_ANALYTICS_ID
NEXT_PUBLIC_SENTRY_DSN
```

### **3. Supabase Security Configuration**

#### **Row Level Security (RLS) Policies**

Your schema already includes RLS policies for public read access. Verify these are active:

```sql
-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verify policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

#### **Database Security Checklist**

- [ ] RLS enabled on all tables
- [ ] Public read policies configured
- [ ] No public write access
- [ ] Stored procedures used for all operations
- [ ] Input validation in functions
- [ ] Audit logging enabled

### **4. Application Security Features**

#### **Implemented Security Measures**

✅ **Content Security Policy (CSP)**

- Prevents XSS attacks
- Restricts resource loading
- Blocks inline scripts and styles

✅ **Security Headers**

- X-XSS-Protection
- X-Content-Type-Options
- X-Frame-Options
- Referrer-Policy
- Permissions-Policy
- Strict-Transport-Security

✅ **Input Validation**

- Zod schemas for all inputs
- PWSID format validation
- Email and phone validation
- Input sanitization

✅ **Rate Limiting**

- Middleware-based rate limiting
- Configurable limits per IP
- Automatic cleanup of expired records

✅ **Request Filtering**

- Bot detection and blocking
- Suspicious user agent filtering
- File access restrictions

### **5. Production Deployment Steps**

#### **Vercel Configuration**

1. **Connect Repository**

   ```bash
   vercel --prod
   ```

2. **Set Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all required variables from step 1

3. **Configure Domain**
   - Add custom domain in Vercel Dashboard
   - Configure SSL certificate
   - Set up redirects if needed

4. **Enable Security Features**
   - Enable Vercel Analytics (optional)
   - Configure error monitoring
   - Set up logging

#### **Supabase Production Setup**

1. **Database Security**

   ```sql
   -- Enable SSL connections
   ALTER SYSTEM SET ssl = on;
   
   -- Restrict connections
   ALTER SYSTEM SET listen_addresses = 'localhost';
   
   -- Set connection limits
   ALTER SYSTEM SET max_connections = 100;
   ```

2. **Backup Configuration**
   - Enable automated backups
   - Set retention policy
   - Test restore procedures

3. **Monitoring**
   - Enable query logging
   - Set up alerts for unusual activity
   - Monitor connection limits

### **6. Security Monitoring**

#### **Logging Configuration**

```typescript
// Add to your application
import { logSecurityEvent } from '@/lib/security'

// Log security events
logSecurityEvent('failed_login', { ip: request.ip, userAgent: request.headers.get('user-agent') })
logSecurityEvent('rate_limit_exceeded', { ip: request.ip })
logSecurityEvent('suspicious_request', { path: request.url, userAgent: request.headers.get('user-agent') })
```

#### **Monitoring Checklist**

- [ ] Set up error tracking (Sentry)
- [ ] Configure application logging
- [ ] Monitor rate limiting events
- [ ] Track failed authentication attempts
- [ ] Monitor database query performance
- [ ] Set up alerts for security events

### **7. Ongoing Security Maintenance**

#### **Regular Security Tasks**

**Weekly:**

- Review security logs
- Check for failed login attempts
- Monitor rate limiting events
- Review error rates

**Monthly:**

- Update dependencies
- Review access logs
- Check for suspicious activity
- Update security policies

**Quarterly:**

- Security audit
- Penetration testing
- Update security documentation
- Review compliance requirements

#### **Dependency Updates**

```bash
# Check for security vulnerabilities
npm audit

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

### **8. Incident Response Plan**

#### **Security Incident Response**

1. **Detection**
   - Monitor logs for unusual activity
   - Set up alerts for security events
   - Regular security scans

2. **Response**
   - Immediate containment
   - Evidence preservation
   - Communication plan
   - Recovery procedures

3. **Recovery**
   - System restoration
   - Data integrity verification
   - Post-incident analysis
   - Security improvements

### **9. Compliance Considerations**

#### **Data Protection**

- **Public Data**: All drinking water data is public by law
- **No PII**: Application doesn't collect personal information
- **Transparency**: Open access to public records
- **Audit Trail**: All data changes are logged

#### **Regulatory Compliance**

- **Georgia Open Records Act**: Public data access
- **Safe Drinking Water Act**: Federal compliance
- **State EPD Requirements**: Georgia-specific regulations

### **10. Security Testing**

#### **Pre-Deployment Testing**

```bash
# Run security tests
npm run test:security

# Check for vulnerabilities
npm audit

# Test rate limiting
curl -H "User-Agent: test" https://your-domain.vercel.app

# Test input validation
curl -X POST https://your-domain.vercel.app/api/search \
  -H "Content-Type: application/json" \
  -d '{"searchTerm": "<script>alert(1)</script>"}'
```

#### **Security Headers Test**

```bash
# Test security headers
curl -I https://your-domain.vercel.app

# Expected headers:
# X-XSS-Protection: 1; mode=block
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

## 🚨 **Emergency Contacts**

- **Security Issues**: <security@your-organization.com>
- **Vercel Support**: <https://vercel.com/support>
- **Supabase Support**: <https://supabase.com/support>
- **Georgia EPD**: [EPD Contact Information]

---

**Last Updated**: January 2025  
**Next Review**: April 2025
