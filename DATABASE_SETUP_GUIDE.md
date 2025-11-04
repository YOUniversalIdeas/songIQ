# 🗄️ songIQ Database Setup Guide

## 📋 **Current Database Status**

Based on our testing, the staging server is running but the songs endpoint returns an error, indicating the database connection needs to be configured.

## 🎯 **Step 1: Check Current Database Status**

### **1.1 Test Database Connection on Staging Server**
```bash
# SSH into your staging server
ssh root@64.202.184.174

# Check if MongoDB is running
systemctl status mongod

# Check MongoDB process
ps aux | grep mongod

# Check if MongoDB is listening on port 27017
netstat -tlnp | grep 27017
```

### **1.2 Check Current Database Configuration**
```bash
# Check current environment configuration
cat /var/www/songiq-staging/server/.env

# Check MongoDB connection string
grep MONGODB_URI /var/www/songiq-staging/server/.env
```

## 🚀 **Step 2: Install and Configure MongoDB**

### **2.1 Install MongoDB (if not installed)**
```bash
# On CentOS/RHEL (your server)
sudo yum install -y mongodb-server mongodb

# Or on Ubuntu/Debian
sudo apt update
sudo apt install -y mongodb
```

### **2.2 Start MongoDB Service**
```bash
# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

### **2.3 Configure MongoDB for Production**
```bash
# Edit MongoDB configuration
sudo nano /etc/mongod.conf

# Add these settings:
net:
  port: 27017
  bindIp: 127.0.0.1

security:
  authorization: enabled

storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

# Restart MongoDB
sudo systemctl restart mongod
```

## 🔐 **Step 3: Set Up Database Security**

### **3.1 Create Admin User**
```bash
# Connect to MongoDB
mongo

# Switch to admin database
use admin

# Create admin user
db.createUser({
  user: "admin",
  pwd: "your_secure_admin_password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Exit MongoDB
exit
```

### **3.2 Create Application User**
```bash
# Connect to MongoDB with admin user
mongo -u admin -p your_secure_admin_password --authenticationDatabase admin

# Switch to songiq database
use songiq

# Create application user
db.createUser({
  user: "songiq_user",
  pwd: "your_secure_app_password",
  roles: ["readWrite"]
})

# Exit MongoDB
exit
```

## 🔧 **Step 4: Update Application Configuration**

### **4.1 Update Production Environment File**
```bash
# Edit production environment file
nano songiq/server/env.production

# Update MongoDB URI
MONGODB_URI=mongodb://songiq_user:your_secure_app_password@localhost:27017/songiq?authSource=songiq
```

### **4.2 Test Database Connection**
```bash
# Test connection from application
cd songiq/server
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://songiq_user:your_secure_app_password@localhost:27017/songiq?authSource=songiq')
  .then(() => console.log('✅ Database connected successfully'))
  .catch(err => console.error('❌ Database connection failed:', err));
"
```

## 📊 **Step 5: Create Database Collections and Indexes**

### **5.1 Create Initial Collections**
```bash
# Connect to MongoDB
mongo -u songiq_user -p your_secure_app_password --authenticationDatabase songiq

# Switch to songiq database
use songiq

# Create collections
db.createCollection("songs")
db.createCollection("users")
db.createCollection("analyses")
db.createCollection("subscriptions")

# Create indexes for better performance
db.songs.createIndex({ "spotifyId": 1 }, { unique: true })
db.songs.createIndex({ "title": "text", "artist": "text" })
db.users.createIndex({ "email": 1 }, { unique: true })
db.analyses.createIndex({ "songId": 1 })
db.analyses.createIndex({ "userId": 1 })
db.subscriptions.createIndex({ "userId": 1 }, { unique: true })

# Exit MongoDB
exit
```

## 🧪 **Step 6: Test Database Integration**

### **6.1 Test Songs Endpoint**
```bash
# Test songs endpoint (should now work)
curl http://64.202.184.174:5000/api/songs

# Expected response: [] (empty array) or list of songs
```

### **6.2 Test Song Creation**
```bash
# Test creating a song
curl -X POST http://64.202.184.174:5000/api/songs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Song",
    "artist": "Test Artist",
    "spotifyId": "test123",
    "audioFeatures": {
      "danceability": 0.8,
      "energy": 0.7,
      "valence": 0.6
    }
  }'
```

### **6.3 Test Database Queries**
```bash
# Connect to MongoDB and verify data
mongo -u songiq_user -p your_secure_app_password --authenticationDatabase songiq

# Switch to songiq database
use songiq

# Check collections
show collections

# Check songs
db.songs.find()

# Check users
db.users.find()

# Exit MongoDB
exit
```

## 🔄 **Step 7: Set Up Database Backups**

### **7.1 Create Backup Script**
```bash
# Create backup directory
sudo mkdir -p /var/backups/mongodb

# Create backup script
sudo nano /usr/local/bin/backup-mongodb.sh
```

**Backup Script Content:**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="songiq"
DB_USER="songiq_user"
DB_PASS="your_secure_app_password"

# Create backup
mongodump --db $DB_NAME --username $DB_USER --password $DB_PASS --authenticationDatabase $DB_NAME --out $BACKUP_DIR/backup_$DATE

# Compress backup
tar -czf $BACKUP_DIR/songiq_backup_$DATE.tar.gz -C $BACKUP_DIR backup_$DATE

# Remove uncompressed backup
rm -rf $BACKUP_DIR/backup_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "songiq_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: songiq_backup_$DATE.tar.gz"
```

### **7.2 Set Up Automated Backups**
```bash
# Make backup script executable
sudo chmod +x /usr/local/bin/backup-mongodb.sh

# Add to crontab for daily backups at 2 AM
sudo crontab -e

# Add this line:
0 2 * * * /usr/local/bin/backup-mongodb.sh
```

## 🚨 **Step 8: Database Monitoring**

### **8.1 Monitor Database Performance**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check database size
mongo -u songiq_user -p your_secure_app_password --authenticationDatabase songiq --eval "db.stats()"

# Check slow queries
mongo -u songiq_user -p your_secure_app_password --authenticationDatabase songiq --eval "db.setProfilingLevel(2, {slowms: 100})"
```

### **8.2 Set Up Database Alerts**
```bash
# Create monitoring script
sudo nano /usr/local/bin/monitor-mongodb.sh
```

**Monitoring Script:**
```bash
#!/bin/bash
# Check if MongoDB is running
if ! systemctl is-active --quiet mongod; then
    echo "ALERT: MongoDB is not running!"
    # Add notification logic here (email, Slack, etc.)
fi

# Check disk space
DISK_USAGE=$(df /var/lib/mongodb | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "ALERT: MongoDB disk usage is ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEMORY_USAGE -gt 90 ]; then
    echo "ALERT: High memory usage: ${MEMORY_USAGE}%"
fi
```

## 🔧 **Step 9: Production Database Optimization**

### **9.1 Optimize MongoDB Configuration**
```bash
# Edit MongoDB configuration for production
sudo nano /etc/mongod.conf
```

**Production MongoDB Configuration:**
```yaml
# /etc/mongod.conf
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1  # Adjust based on available RAM

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1

security:
  authorization: enabled

processManagement:
  timeZoneInfo: /usr/share/zoneinfo
```

### **9.2 Set Up Database Replication (Optional)**
```bash
# For high availability, consider setting up MongoDB replica set
# This is advanced and optional for initial deployment
```

## 📋 **Step 10: Verification Checklist**

### **10.1 Database Setup Checklist**
- [ ] MongoDB installed and running
- [ ] Database users created (admin and application)
- [ ] Collections and indexes created
- [ ] Application can connect to database
- [ ] Songs endpoint working
- [ ] Backup system configured
- [ ] Monitoring set up
- [ ] Security configured

### **10.2 Test Commands**
```bash
# Test database connection
curl http://64.202.184.174:5000/api/songs

# Test song creation
curl -X POST http://64.202.184.174:5000/api/songs \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "artist": "Test Artist"}'

# Check database status
mongo -u songiq_user -p your_secure_app_password --authenticationDatabase songiq --eval "db.stats()"
```

## 🎯 **Next Steps**

1. **SSH into your staging server** and run the database setup commands
2. **Update the production environment file** with the correct MongoDB URI
3. **Test the database connection** from your application
4. **Set up monitoring and backups**
5. **Deploy to production** once database is working

---

**💡 Pro Tip**: Start with a simple MongoDB setup first, then add security and optimization features once everything is working.
