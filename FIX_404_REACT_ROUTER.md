# 🔧 Fix 404 Error for React Router Routes

## Problem
Routes like `/upload`, `/admin`, `/markets` return 404 errors even though the root (`/`) works.

## Root Cause
Apache isn't applying the `.htaccess` rewrite rules to serve `index.html` for React Router routes.

## Solution

The `.htaccess` file exists at `/var/www/songiq/songiq/client/dist/.htaccess` but Apache needs to be configured to:
1. Allow `.htaccess` overrides (`AllowOverride All`)
2. Have `mod_rewrite` enabled (already enabled)

## Quick Fix

Since this is a cPanel/managed server, you may need to:

### Option 1: Update Apache Config (if you have access)
Add this to your Apache virtual host configuration:

```apache
<Directory /var/www/songiq/songiq/client/dist>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
    
    # Handle React Router
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} !^/api
    RewriteRule . /index.html [L]
</Directory>
```

### Option 2: Use cPanel File Manager
1. Go to cPanel → File Manager
2. Navigate to `/var/www/songiq/songiq/client/dist/`
3. Create/edit `.htaccess` file
4. Add the rewrite rules

### Option 3: Contact Hosting Support
If you don't have access to Apache config, contact your hosting provider to:
- Enable `AllowOverride All` for `/var/www/songiq/songiq/client/dist`
- Or add the React Router rewrite rules directly to the Apache config

## Verify Fix

After applying the fix:
```bash
curl -I https://songiq.ai/upload
# Should return: HTTP/2 200 (not 404)
```

## Current Status

✅ `.htaccess` file exists at `/var/www/songiq/songiq/client/dist/.htaccess`
✅ `mod_rewrite` is enabled
❌ Apache may not be allowing `.htaccess` overrides

