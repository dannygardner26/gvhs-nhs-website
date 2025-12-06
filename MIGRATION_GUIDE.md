# Migration Guide: Backend + Frontend → Vercel + Supabase

## 🎯 Overview

This guide helps you migrate from the separate backend/frontend setup to a unified Vercel deployment with Supabase database.

## ✅ What's Been Completed

### 1. Database Schema Setup
- **File**: `supabase-schema.sql`
- **Tables Created**:
  - `users` - stores registered users with custom user IDs
  - `session_history` - tracks all check-in/check-out sessions
  - `active_checkins` - tracks currently checked-in users
  - `user_stats` - view for user statistics and hours

### 2. Next.js API Routes Created
All Express.js endpoints have been converted to Next.js API routes:

- **Check-in endpoints**:
  - `POST /api/checkin` - Check in user
  - `POST /api/checkin/checkout` - Check out user
  - `GET /api/checkin/count` - Get current count
  - `GET /api/checkin/status/[userId]` - Get user status
  - `GET /api/checkin/active` - Get all active users
  - `POST /api/checkin/logout-all` - Force logout all users
  - `POST /api/checkin/verify-and-checkin` - Verify existing user and check in
  - `POST /api/checkin/register-and-checkin` - Register new user and check in

- **Admin endpoints**:
  - `GET /api/checkin/admin/users` - Get all users with stats
  - `POST /api/checkin/admin/change-pin` - Change user's PIN/ID
  - `POST /api/checkin/admin/force-checkout` - Force checkout user
  - `GET /api/checkin/admin/session-history/[userId]` - Get user session history
  - `GET /api/checkin/admin/total-hours/[userId]` - Get user total hours
  - `GET /api/checkin/admin/all-sessions` - Get all session history

### 3. Frontend Updated
All frontend components now use relative API paths (`/api/checkin/...`) instead of `http://localhost:3001/api/checkin/...`

### 4. Supabase Integration
- Installed `@supabase/supabase-js`
- Created TypeScript types for database tables
- Configured Supabase client in `/src/lib/supabase.ts`

## 🚀 Deployment Steps

### Step 1: Set Up Supabase Project
1. Go to [Supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the contents of `supabase-schema.sql`
3. Get your project URL and anon key from Project Settings > API

### Step 2: Configure Environment Variables
1. Copy `frontend/.env.local.example` to `frontend/.env.local`
2. Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Step 3: Deploy to Vercel
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy from the `frontend` directory

### Step 4: Update Project Root (Optional)
To deploy the entire project from root instead of frontend subfolder:
1. Move all files from `frontend/` to root directory
2. Update `package.json` scripts and dependencies
3. Remove the old `backend/` directory

## 🎉 Benefits After Migration

- **✅ No separate backend server needed** - Everything runs on Vercel
- **✅ Persistent data storage** - No more in-memory data loss
- **✅ Real-time capabilities** - Supabase provides real-time subscriptions
- **✅ Better scalability** - Serverless functions auto-scale
- **✅ Cost effective** - Both Vercel and Supabase have generous free tiers
- **✅ Better reliability** - No server downtime issues

## 🔧 Development Workflow

### Local Development
```bash
cd frontend
npm run dev
```

### Testing API Endpoints
- Health check: `http://localhost:3000/api/health`
- Check-in count: `http://localhost:3000/api/checkin/count`

### Database Management
- Use Supabase dashboard for data management
- SQL Editor for schema changes
- Real-time logs and monitoring

## 📊 Data Migration (If Needed)

If you have existing data in the old in-memory system, you'll need to manually recreate users in the new system since the old data was not persistent.

## 🛠️ Troubleshooting

### Common Issues:
1. **CORS errors**: Make sure your Supabase project allows requests from your Vercel domain
2. **Environment variables**: Ensure all variables are set in both local `.env.local` and Vercel dashboard
3. **Database permissions**: Check that Row Level Security policies allow the operations you need

### Rollback Plan:
The old backend/frontend setup is still intact, so you can revert by:
1. Starting the old backend server: `cd backend && npm run dev`
2. Updating frontend API URLs back to `localhost:3001`

## 🎯 Next Steps

1. Test all functionality thoroughly
2. Set up monitoring and error reporting
3. Configure automatic backups in Supabase
4. Consider adding authentication if needed
5. Remove the old `backend/` directory once migration is confirmed working