#!/bin/bash

# songIQ Production Monitoring and Maintenance Script
# This script provides monitoring, health checks, and maintenance tools for production

set -e

# Configuration
PRODUCTION_SERVER="songiq.com"
PRODUCTION_USER="rthadmin"
PRODUCTION_PATH="/var/www/songiq"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[HEADER]${NC} $1"
}

print_section() {
    echo -e "${PURPLE}[SECTION]${NC} $1"
}

# Function to show menu
show_menu() {
    echo ""
    print_header "🎯 songIQ Production Monitoring & Maintenance"
    echo ""
    echo "1.  🔍 Quick Health Check"
    echo "2.  📊 PM2 Process Status"
    echo "3.  📈 System Resources"
    echo "4.  📝 View Recent Logs"
    echo "5.  🌐 Test Application Endpoints"
    echo "6.  🔒 Check SSL Certificate"
    echo "7.  💾 Database Connection Test"
    echo "8.  🧹 Clean Old Logs"
    echo "9.  🔄 Restart Services"
    echo "10. 📋 Full System Report"
    echo "11. 🚨 Emergency Stop All Services"
    echo "12. 🚀 Emergency Start All Services"
    echo "0.  ❌ Exit"
    echo ""
}

# Function to run quick health check
quick_health_check() {
    print_section "Quick Health Check"
    ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER << 'EOF'
        echo "=== PM2 Status ==="
        pm2 status
        
        echo ""
        echo "=== Nginx Status ==="
        sudo systemctl status nginx --no-pager -l | head -10
        
        echo ""
        echo "=== Disk Space ==="
        df -h /var/www/songiq
        
        echo ""
        echo "=== Memory Usage ==="
        free -h
        
        echo ""
        echo "=== Recent Errors (Last 5 lines) ==="
        pm2 logs songiq-api --lines 5 --err
EOF
}

# Function to show PM2 status
show_pm2_status() {
    print_section "PM2 Process Status"
    ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER << 'EOF'
        echo "=== PM2 Status ==="
        pm2 status
        
        echo ""
        echo "=== PM2 Monit (Press Ctrl+C to exit) ==="
        pm2 monit
EOF
}

# Function to show system resources
show_system_resources() {
    print_section "System Resources"
    ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER << 'EOF'
        echo "=== CPU Usage ==="
        top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}'
        
        echo ""
        echo "=== Memory Usage ==="
        free -h
        
        echo ""
        echo "=== Disk Usage ==="
        df -h
        
        echo ""
        echo "=== Load Average ==="
        uptime
        
        echo ""
        echo "=== Process Count ==="
        ps aux | wc -l
EOF
}

# Function to view recent logs
view_recent_logs() {
    print_section "Recent Logs"
    echo "Select log type:"
    echo "1. API Error Logs"
    echo "2. API Output Logs"
    echo "3. Client Error Logs"
    echo "4. Client Output Logs"
    echo "5. Nginx Error Logs"
    echo "6. Nginx Access Logs"
    
    read -p "Enter choice (1-6): " -r
    case $REPLY in
        1)
            ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER "pm2 logs songiq-api --lines 50 --err"
            ;;
        2)
            ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER "pm2 logs songiq-api --lines 50 --out"
            ;;
        3)
            ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER "pm2 logs songiq-client --lines 50 --err"
            ;;
        4)
            ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER "pm2 logs songiq-client --lines 50 --out"
            ;;
        5)
            ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER "sudo tail -50 /var/log/nginx/error.log"
            ;;
        6)
            ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER "sudo tail -50 /var/log/nginx/access.log"
            ;;
        *)
            print_error "Invalid choice"
            ;;
    esac
}

# Function to test application endpoints
test_endpoints() {
    print_section "Testing Application Endpoints"
    
    echo "Testing client accessibility..."
    if curl -f -s https://songiq.com > /dev/null; then
        print_status "✅ Client is accessible"
    else
        print_error "❌ Client is not accessible"
    fi
    
    echo "Testing API health endpoint..."
    if curl -f -s https://songiq.com/api/health > /dev/null; then
        print_status "✅ API health check passed"
    else
        print_error "❌ API health check failed"
    fi
    
    echo "Testing SSL certificate..."
    if command -v openssl >/dev/null 2>&1; then
        echo | openssl s_client -servername songiq.com -connect songiq.com:443 2>/dev/null | openssl x509 -noout -dates
    fi
}

# Function to check SSL certificate
check_ssl_certificate() {
    print_section "SSL Certificate Check"
    
    if command -v openssl >/dev/null 2>&1; then
        echo "=== SSL Certificate Details ==="
        echo | openssl s_client -servername songiq.com -connect songiq.com:443 2>/dev/null | openssl x509 -noout -text | grep -E "(Subject:|Issuer:|Not Before:|Not After:)"
        
        echo ""
        echo "=== Certificate Expiry ==="
        echo | openssl s_client -servername songiq.com -connect songiq.com:443 2>/dev/null | openssl x509 -noout -dates
        
        echo ""
        echo "=== SSL Labs Test ==="
        print_status "Visit https://www.ssllabs.com/ssltest/analyze.html?d=songiq.com for detailed SSL analysis"
    else
        print_error "OpenSSL not available on local machine"
    fi
}

# Function to test database connection
test_database() {
    print_section "Database Connection Test"
    ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER << 'EOF'
        echo "Testing MongoDB connection..."
        cd /var/www/songiq/server
        
        # Check if MongoDB connection is working by looking at logs
        echo "=== Recent Database Operations ==="
        pm2 logs songiq-api --lines 20 | grep -i "mongo\|database\|connection" || echo "No database-related logs found in recent entries"
        
        echo ""
        echo "=== MongoDB Process Status ==="
        if pgrep -x "mongod" > /dev/null; then
            echo "✅ MongoDB process is running"
        else
            echo "❌ MongoDB process not found (may be running as a service)"
        fi
        
        echo ""
        echo "=== MongoDB Service Status ==="
        sudo systemctl status mongod --no-pager -l 2>/dev/null || echo "MongoDB service not found or not running as systemd service"
EOF
}

# Function to clean old logs
clean_old_logs() {
    print_section "Cleaning Old Logs"
    print_warning "This will remove log files older than 30 days"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER << 'EOF'
            echo "Cleaning old log files..."
            
            # Clean PM2 logs older than 30 days
            find ~/.pm2/logs -name "*.log" -mtime +30 -delete 2>/dev/null || true
            
            # Clean application logs older than 30 days
            find /var/www/songiq/logs -name "*.log" -mtime +30 -delete 2>/dev/null || true
            
            # Clean Nginx logs older than 30 days (keep access logs for analytics)
            sudo find /var/log/nginx -name "error.log.*" -mtime +30 -delete 2>/dev/null || true
            
            echo "Log cleanup completed!"
            
            echo ""
            echo "=== Current Log Sizes ==="
            du -sh ~/.pm2/logs 2>/dev/null || echo "PM2 logs not found"
            du -sh /var/www/songiq/logs 2>/dev/null || echo "App logs not found"
            du -sh /var/log/nginx 2>/dev/null || echo "Nginx logs not found"
EOF
    else
        print_status "Log cleanup cancelled"
    fi
}

# Function to restart services
restart_services() {
    print_section "Restarting Services"
    echo "Select service to restart:"
    echo "1. API Service Only"
    echo "2. Client Service Only"
    echo "3. All Services"
    echo "4. Nginx Only"
    
    read -p "Enter choice (1-4): " -r
    case $REPLY in
        1)
            ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER "pm2 restart songiq-api"
            ;;
        2)
            ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER "pm2 restart songiq-client"
            ;;
        3)
            ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER "pm2 restart all"
            ;;
        4)
            ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER "sudo systemctl reload nginx"
            ;;
        *)
            print_error "Invalid choice"
            ;;
    esac
    
    print_status "Service restart completed"
}

# Function to generate full system report
full_system_report() {
    print_section "Full System Report"
    
    REPORT_FILE="production-report-$(date +%Y%m%d-%H%M%S).txt"
    
    ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER > "$REPORT_FILE" << 'EOF'
        echo "=== songIQ Production System Report ==="
        echo "Generated: $(date)"
        echo ""
        
        echo "=== System Information ==="
        uname -a
        echo ""
        
        echo "=== Uptime ==="
        uptime
        echo ""
        
        echo "=== PM2 Status ==="
        pm2 status
        echo ""
        
        echo "=== PM2 Configuration ==="
        pm2 show songiq-api
        echo ""
        pm2 show songiq-client
        echo ""
        
        echo "=== Nginx Status ==="
        sudo systemctl status nginx --no-pager -l
        echo ""
        
        echo "=== Disk Usage ==="
        df -h
        echo ""
        
        echo "=== Memory Usage ==="
        free -h
        echo ""
        
        echo "=== Process Count ==="
        ps aux | wc -l
        echo ""
        
        echo "=== Recent API Logs (Last 20 lines) ==="
        pm2 logs songiq-api --lines 20
        echo ""
        
        echo "=== Recent Client Logs (Last 20 lines) ==="
        pm2 logs songiq-client --lines 20
        echo ""
        
        echo "=== Network Connections ==="
        netstat -tlnp | grep :5000
        netstat -tlnp | grep :80
        netstat -tlnp | grep :443
        echo ""
        
        echo "=== SSL Certificate Info ==="
        echo | openssl s_client -servername songiq.com -connect songiq.com:443 2>/dev/null | openssl x509 -noout -dates
EOF
    
    print_status "Full system report saved to: $REPORT_FILE"
}

# Function to emergency stop all services
emergency_stop() {
    print_section "Emergency Stop All Services"
    print_warning "⚠️  This will STOP ALL songIQ services!"
    read -p "Type 'STOP' to confirm: " -r
    if [[ $REPLY == "STOP" ]]; then
        ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER << 'EOF'
            echo "Emergency stopping all services..."
            pm2 stop all
            echo "All PM2 processes stopped"
EOF
        print_status "All services stopped"
    else
        print_status "Emergency stop cancelled"
    fi
}

# Function to emergency start all services
emergency_start() {
    print_section "Emergency Start All Services"
    print_warning "⚠️  This will START ALL songIQ services!"
    read -p "Type 'START' to confirm: " -r
    if [[ $REPLY == "START" ]]; then
        ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER << 'EOF'
            echo "Emergency starting all services..."
            cd /var/www/songiq
            pm2 start ecosystem.config.js --env production
            pm2 save
            echo "All services started"
EOF
        print_status "All services started"
    else
        print_status "Emergency start cancelled"
    fi
}

# Main menu loop
while true; do
    show_menu
    read -p "Enter your choice (0-12): " -r
    
    case $REPLY in
        0)
            print_status "Exiting..."
            exit 0
            ;;
        1)
            quick_health_check
            ;;
        2)
            show_pm2_status
            ;;
        3)
            show_system_resources
            ;;
        4)
            view_recent_logs
            ;;
        5)
            test_endpoints
            ;;
        6)
            check_ssl_certificate
            ;;
        7)
            test_database
            ;;
        8)
            clean_old_logs
            ;;
        9)
            restart_services
            ;;
        10)
            full_system_report
            ;;
        11)
            emergency_stop
            ;;
        12)
            emergency_start
            ;;
        *)
            print_error "Invalid choice. Please enter a number between 0 and 12."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done
