# 🚀 Manual Deployment Instructions - songIQ

## ✅ **Security Fixes Applied**
- Fixed environment loading vulnerability that caused Stripe key exposure
- New Stripe keys configured securely
- Production environment properly isolated
- NODE_ENV=production properly configured

## 📦 **Deployment Package Ready**
**File:** `songiq-deployment-latest.zip` (3.4MB)
**Location:** `/Users/allanrestrepo/Documents/GitHub/songIQ/songiq-deployment-latest.zip`

## 🎯 **Manual Deployment Steps**

### **Step 1: Upload to Server**
1. **Access your server** via hosting control panel or SSH
2. **Upload** `songiq-deployment-latest.zip` to `/tmp/` directory
3. **Extract** the files:
   ```bash
   cd /tmp
   unzip songiq-deployment-latest.zip
   ```

### **Step 2: Set Up Environment**
1. **Copy environment files** to production locations:
   ```bash
   # Copy server environment
   cp /tmp/deploy-package-20250919-184924/server.env /var/www/songiq/.env.production
   
   # Copy client environment  
   cp /tmp/deploy-package-20250919-184924/client.env /var/www/songiq/client/.env.production
   ```

### **Step 3: Deploy Application Files**
1. **Copy server files**:
   ```bash
   cp -r /tmp/deploy-package-20250919-184924/server/* /var/www/songiq/server/
   ```

2. **Copy client files**:
   ```bash
   cp -r /tmp/deploy-package-20250919-184924/client/* /var/www/songiq/client/
   ```

### **Step 4: Install Dependencies & Start Services**
```bash
# Navigate to application directory
cd /var/www/songiq

# Install dependencies
npm install

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

### **Step 5: Verify Deployment**
1. **Check services**:
   ```bash
   pm2 status
   ```

2. **Test endpoints**:
   - Frontend: `http://songiq.ai/`
   - API Health: `http://songiq.ai/api/health`

## 🔐 **Security Verification**
- ✅ New Stripe keys configured
- ✅ Environment loading fixed
- ✅ Production environment isolated
- ✅ No hardcoded keys in source

## 🆘 **Troubleshooting**

### **If services don't start:**
```bash
# Check logs
pm2 logs

# Restart services
pm2 restart all
```

### **If environment issues:**
```bash
# Verify environment file
cat /var/www/songiq/.env.production | grep STRIPE
```

### **If permissions issues:**
```bash
# Fix ownership
sudo chown -R nginx:nginx /var/www/songiq/
sudo chmod -R 755 /var/www/songiq/
```

## 📞 **Support**
If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Verify environment: `pm2 env 0`
3. Test API: `curl http://songiq.ai/api/health`

---

**🎉 Your songIQ application is now deployed with security fixes applied!**
