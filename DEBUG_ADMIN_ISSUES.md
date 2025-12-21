# 🔍 Debug Admin Dashboard Issues

## Current Problems
1. **403 Forbidden** errors when loading platform statistics
2. **404 error** when clicking "Create Market" button (should open modal)

## 🔧 Debugging Steps

### Step 1: Check Browser Console
1. Open DevTools (`F12`)
2. Go to **Console** tab
3. Clear console
4. Refresh the Admin Dashboard page
5. Look for these log messages:
   - `🔑 Token found, length: X` - Should show token exists
   - `📡 Fetching platform stats from: ...` - Shows API endpoint
   - `📊 Stats response status: XXX` - Shows HTTP status
   - `✅ Stats data received:` - Success message
   - `❌ Failed to fetch platform stats:` - Error details

### Step 2: Check Network Tab
1. Open DevTools (`F12`)
2. Go to **Network** tab
3. Filter by "Fetch/XHR"
4. Refresh Admin Dashboard
5. Look for `/api/admin/stats/platform` request
6. Click on it to see:
   - **Request Headers** - Check if `Authorization: Bearer ...` is present
   - **Response** - See the actual error message
   - **Status** - Should be 200, not 403

### Step 3: Test Create Market Button
1. Go to Admin Dashboard → Markets tab
2. Open Console (`F12`)
3. Click "Create Market" button
4. Look for these logs:
   - `🟢 Create Market button clicked`
   - `🟢 Current actionModal state: ...`
   - `🟢 Set actionModal to create`
   - `🟢 Create Market modal should be visible now`

### Step 4: Verify Token
In browser console, run:
```javascript
// Check token storage
console.log('localStorage token:', localStorage.getItem('songiq_token'));
console.log('sessionStorage token:', sessionStorage.getItem('songiq_token'));

// Check user role
fetch('/api/auth/profile', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('songiq_token') || sessionStorage.getItem('songiq_token')}` }
})
.then(r => r.json())
.then(data => {
  console.log('User profile:', data);
  console.log('User role:', data.user?.role);
});
```

## 🎯 Expected Behavior

### Statistics Should Show:
- User statistics (total, active, new users)
- Market statistics (total, active, resolved)
- Trading statistics (trades, positions)
- Volume statistics (total volume, fees)

### Create Market Should:
- Open a modal overlay (not navigate)
- Show a form to create a market
- Not cause a 404 error

## 🚨 Common Issues

### 403 Forbidden
**Possible causes:**
- Token is missing or invalid
- User doesn't have admin/superadmin role
- Token expired

**Solution:**
1. Sign out completely
2. Sign back in as admin
3. Check console for token logs

### 404 on Create Market
**Possible causes:**
- Browser cache serving old JavaScript
- Service worker caching old code
- React Router not handling the route

**Solution:**
1. Clear all caches (Application tab → Clear Storage)
2. Unregister service workers
3. Hard refresh: `Ctrl + Shift + R`

## 📋 Next Steps

After checking the console logs, share:
1. What you see in the console when loading statistics
2. What you see when clicking "Create Market"
3. The Network tab details for the failed requests
4. Any error messages

This will help identify the exact issue!

