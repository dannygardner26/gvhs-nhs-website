# Vercel Deployment Configuration

This document outlines the environment variables that need to be configured in Vercel for production deployment.

## Required Environment Variables

### Database Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://rwirbxrebjqaslcqwcrp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3aXJieHJlYmpxYXNsY3F3Y3JwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDk5NTk2MSwiZXhwIjoyMDgwNTcxOTYxfQ._w72vDsYdQwwokWcCrpR13mzYc1oWT-fTAt7fDrRMGI
SUPABASE_SERVICE_KEY=sb_secret_bBqk-J8ALyz78DSyGIJmDA_WO4PG_Ps
```

### Security Configuration
```
# Admin authentication (generated from hashing "Volunteeringisgreat")
ADMIN_PIN_HASH=$2a$12$LQv3c1yqBWVHxkjp/4v9rO5S8TbYyKj4MZWjLaZoK8P1aU3oC4Q9G

# Master admin override for emergencies
MASTER_ADMIN_PIN=EMERGENCY_OVERRIDE_2024

# Data encryption key (32 characters minimum)
ENCRYPTION_KEY=SecureKey123456789012345678901234

# Session management
SESSION_SECRET=SuperSecretSessionKey123456789012345678901234567890

# Environment setting
NEXT_PUBLIC_APP_ENV=production
```

## Deployment Instructions

1. **Set Environment Variables in Vercel:**
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Go to Environment Variables section
   - Add each variable listed above

2. **Security Notes:**
   - User IDs and passwords are encrypted using AES-256-GCM encryption
   - Admin panel requires PIN authentication
   - Master admin override is available for emergencies
   - All sensitive data is hidden from admin interface (user IDs are masked)

3. **Admin Access:**
   - Admin PIN: `Volunteeringisgreat`
   - Master Admin PIN: `EMERGENCY_OVERRIDE_2024`
   - Access URL: `https://your-domain.vercel.app/admin`

## Security Features Implemented

- ✅ Admin PIN authentication with bcrypt hashing
- ✅ User ID and password encryption in database
- ✅ Masked user IDs in admin interface
- ✅ Password reset functionality for admin
- ✅ Master admin override capability
- ✅ Environment variable configuration for production
- ✅ No sensitive data visible to admin users

## Database Security

- User IDs are encrypted before storage
- Password hashes are encrypted before storage
- Admin can only see masked user IDs (e.g., 1****6)
- Password reset generates new random passwords
- All encryption uses secure AES-256-GCM algorithm

## Troubleshooting

If you encounter issues during deployment:

1. Verify all environment variables are set correctly
2. Check Vercel build logs for any missing dependencies
3. Ensure Supabase connection is working
4. Test admin authentication with the provided PIN