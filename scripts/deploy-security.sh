#!/bin/bash

# SpeedTrials 2025 Security Deployment Script
# This script helps configure security settings for production deployment

set -e

echo "🔒 SpeedTrials 2025 Security Configuration"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "node is not installed"
        exit 1
    fi
    
    print_status "Dependencies check passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_status "Dependencies installed"
}

# Run security audit
run_security_audit() {
    print_status "Running security audit..."
    
    if npm audit --audit-level=moderate; then
        print_status "Security audit passed"
    else
        print_warning "Security vulnerabilities found. Run 'npm audit fix' to fix them."
    fi
}

# Check environment variables
check_env_vars() {
    print_status "Checking environment variables..."
    
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local file not found"
        echo "Please create .env.local with the following variables:"
        echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
        echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
        echo "NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app"
        echo "NEXT_PUBLIC_APP_ENV=production"
    else
        print_status ".env.local file found"
        
        # Check for required variables
        if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
            print_status "NEXT_PUBLIC_SUPABASE_URL is set"
        else
            print_warning "NEXT_PUBLIC_SUPABASE_URL is missing"
        fi
        
        if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
            print_status "NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
        else
            print_warning "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing"
        fi
    fi
}

# Build the application
build_app() {
    print_status "Building application..."
    npm run build
    print_status "Application built successfully"
}

# Test security headers
test_security_headers() {
    print_status "Testing security headers..."
    
    # Start the application in the background
    npm start &
    APP_PID=$!
    
    # Wait for the app to start
    sleep 10
    
    # Test security headers
    if curl -s -I http://localhost:3000 | grep -q "X-XSS-Protection"; then
        print_status "Security headers are configured"
    else
        print_warning "Security headers may not be properly configured"
    fi
    
    # Kill the background process
    kill $APP_PID 2>/dev/null || true
}

# Generate deployment checklist
generate_checklist() {
    print_status "Generating deployment checklist..."
    
    cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
# Deployment Checklist

## Pre-Deployment
- [ ] Environment variables configured
- [ ] Security audit passed
- [ ] Application builds successfully
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented

## Vercel Configuration
- [ ] Repository connected to Vercel
- [ ] Environment variables set in Vercel dashboard
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate enabled
- [ ] Analytics enabled (optional)

## Supabase Configuration
- [ ] RLS policies enabled
- [ ] Public read access configured
- [ ] No public write access
- [ ] Stored procedures deployed
- [ ] Backup configuration enabled

## Post-Deployment
- [ ] Application accessible via HTTPS
- [ ] Security headers present
- [ ] Rate limiting working
- [ ] Error monitoring configured
- [ ] Logging enabled

## Monitoring Setup
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] Security alerts configured
- [ ] Backup verification completed
EOF

    print_status "Deployment checklist generated: DEPLOYMENT_CHECKLIST.md"
}

# Main execution
main() {
    echo "Starting security configuration..."
    
    check_dependencies
    install_dependencies
    run_security_audit
    check_env_vars
    build_app
    test_security_headers
    generate_checklist
    
    echo ""
    echo "🎉 Security configuration completed!"
    echo ""
    echo "Next steps:"
    echo "1. Review DEPLOYMENT_CHECKLIST.md"
    echo "2. Set up environment variables in Vercel"
    echo "3. Deploy to Vercel: vercel --prod"
    echo "4. Configure Supabase security settings"
    echo "5. Set up monitoring and alerts"
    echo ""
    echo "For detailed security information, see SECURITY.md"
}

# Run main function
main "$@" 