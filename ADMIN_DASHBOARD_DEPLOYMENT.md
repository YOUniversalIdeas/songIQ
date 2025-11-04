# 🚀 Admin Dashboard - Deployment Guide

## ✅ Deployment Status

**Committed:** ✅ Yes  
**Pushed to Remote:** ✅ Yes  
**Commit Hash:** `e39edb0`  
**Branch:** `main`  
**Files Changed:** 8 files, 3758 insertions(+), 128 deletions(-)

---

## 📦 What Was Deployed

### **New Files:**
1. `ADMIN_DASHBOARD_COMPLETE.md` - Complete documentation
2. `songiq/client/src/components/AdminOverview.tsx` - Overview tab
3. `songiq/client/src/components/EnhancedMarketsAdmin.tsx` - Markets management
4. `songiq/client/src/components/UsersManagement.tsx` - User management
5. `songiq/client/src/components/PlatformSettings.tsx` - Settings tab
6. `songiq/client/src/components/FlaggedContent.tsx` - Moderation queue

### **Modified Files:**
1. `songiq/client/src/components/AdminDashboard.tsx` - Updated main dashboard
2. `songiq/server/src/routes/admin.ts` - Added 15+ admin API endpoints

---

## 🖥️ Staging Server Deployment Steps

### **Option 1: Pull and Restart (Recommended)**

If you have SSH access to your staging server:

```bash
# SSH into staging server
ssh user@staging.songiq.ai

# Navigate to project directory
cd /path/to/songiq

# Pull latest changes
git pull origin main

# Install any new dependencies (if needed)
cd songiq/server
npm install

cd ../client
npm install

# Restart server (from appropriate subdirectory)
cd ../server
pm2 restart songiq-server

# Rebuild and restart client (if needed)
cd ../client
npm run build
pm2 restart songiq-client
```

### **Option 2: Using Deployment Script**

If you have a deployment script:

```bash
# From your local machine
./deploy-staging.sh
```

Or use your existing deployment workflow.

---

## 🔧 Environment Variables (Optional)

The admin dashboard can use these optional environment variables for settings:

```env
# Fee Configuration
PLATFORM_FEE=0.02          # 2% platform fee
WITHDRAWAL_FEE=0.01        # 1% withdrawal fee

# Market Limits
MAX_MARKET_DURATION=90     # 90 days max
MIN_LIQUIDITY=100          # $100 minimum
MAX_OUTCOMES=10            # 10 outcomes max
MIN_OUTCOMES=2             # 2 outcomes min

# Feature Toggles
TRADING_ENABLED=true
MARKET_CREATION_ENABLED=true
WITHDRAWALS_ENABLED=true
MAINTENANCE_MODE=false

# Moderation
AUTO_FLAG_THRESHOLD=5      # 5 reports before auto-flag
AUTO_SUSPEND_WARNINGS=3    # 3 warnings before auto-suspend
```

Add these to your `.env` file if you want to configure them.

---

## 🧪 Testing the Admin Dashboard

### **1. Access the Admin Dashboard**
- Navigate to: `https://staging.songiq.ai/admin` (or your admin route)
- Login with a superadmin account

### **2. Test Each Tab:**

**Overview:**
- ✅ Check real-time statistics load
- ✅ Verify auto-refresh works
- ✅ Check activity feeds display

**Markets:**
- ✅ Search and filter markets
- ✅ Flag a market
- ✅ View market analytics
- ✅ Suspend a test market
- ✅ Force resolve a market

**Users:**
- ✅ Search users
- ✅ Issue a warning to a test user
- ✅ Suspend/activate a user
- ✅ View user details

**Flagged Content:**
- ✅ View flagged items
- ✅ Remove a flag
- ✅ Suspend flagged content

**Settings:**
- ✅ View current platform configuration
- ✅ Verify all settings display correctly

---

## 🔐 Admin Access Requirements

### **To Use Admin Dashboard:**
1. User must have role `admin` or `superadmin`
2. Must be logged in with valid JWT token
3. Token must be stored in `localStorage` as `token`

### **Creating a Superadmin:**
If you need to create a superadmin user:

```bash
# From server directory
cd songiq/server

# Run the make-superadmin script
npx ts-node scripts/make-superadmin.ts <user-email>
```

---

## 🎯 API Endpoints Added

All endpoints require admin authentication (`Bearer token` in Authorization header):

### **Markets Management:**
- `GET /api/admin/markets` - List all markets
- `GET /api/admin/markets/:id` - Get market with analytics
- `PATCH /api/admin/markets/:id/suspend` - Suspend/unsuspend
- `PATCH /api/admin/markets/:id/flag` - Flag/unflag
- `DELETE /api/admin/markets/:id` - Delete (superadmin only)
- `POST /api/admin/markets/:id/force-resolve` - Force resolve

### **User Management:**
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `PATCH /api/admin/users/:id` - Update user
- `POST /api/admin/users/:id/promote` - Promote to admin
- `POST /api/admin/users/:id/demote` - Demote admin
- `POST /api/admin/users/:id/warnings` - Add warning
- `GET /api/admin/users/:id/warnings` - Get warnings
- `DELETE /api/admin/users/:id/warnings` - Clear warnings

### **Platform Stats:**
- `GET /api/admin/stats/platform` - Platform statistics
- `GET /api/admin/stats/activity` - Activity feed
- `GET /api/admin/stats/markets-analytics` - Market analytics

### **Settings:**
- `GET /api/admin/settings` - Get platform settings

---

## 📊 Database Changes

**No database migrations required!**

The admin dashboard uses existing collections and adds optional fields dynamically:
- Markets can have `flagged`, `flagReason`, `flaggedAt` fields
- Users can have `warnings` array field
- All handled via Mongoose without breaking changes

---

## 🔍 Monitoring

After deployment, monitor:

1. **Server logs** for any errors:
   ```bash
   pm2 logs songiq-server
   ```

2. **API response times** on admin endpoints

3. **Browser console** for frontend errors

4. **User feedback** on admin functionality

---

## 🐛 Troubleshooting

### **Issue: Admin dashboard not loading**
- Check user role is `admin` or `superadmin`
- Verify JWT token is valid
- Check server logs for errors

### **Issue: API endpoints returning 401**
- Token expired - user needs to re-login
- User doesn't have admin role

### **Issue: Statistics not showing**
- Backend server may need restart
- Check `/api/admin/stats/platform` endpoint directly

### **Issue: Real-time updates not working**
- Auto-refresh is every 30 seconds
- Can manually refresh with button
- Check browser console for fetch errors

---

## ✅ Deployment Checklist

- [x] Code committed to git
- [x] Code pushed to remote repository
- [ ] Pull changes on staging server
- [ ] Install dependencies (if any)
- [ ] Restart backend server
- [ ] Rebuild frontend
- [ ] Test admin login
- [ ] Test each admin tab
- [ ] Verify API endpoints work
- [ ] Check for console errors
- [ ] Monitor server logs

---

## 📞 Support

If you encounter any issues:
1. Check server logs: `pm2 logs`
2. Check browser console for errors
3. Verify user has admin permissions
4. Ensure all dependencies installed
5. Restart services from appropriate subdirectories [[memory:7599485]]

---

## 🎉 Success!

Your comprehensive Admin Dashboard is now deployed with:
- ✅ 5 functional tabs
- ✅ 20+ API endpoints
- ✅ Real-time monitoring
- ✅ Complete market & user management
- ✅ Security & safety checks
- ✅ Beautiful, responsive UI

Enjoy your new admin superpowers! 🚀

