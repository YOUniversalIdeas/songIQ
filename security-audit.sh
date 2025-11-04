#!/bin/bash

# 🔒 Security Audit Script for songIQ
# This script performs a comprehensive security audit to find exposed API keys

set -e

echo "🔒 songIQ - Security Audit"
echo "========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "songiq/server/src/index.ts" ]; then
    echo -e "${RED}❌ Error: Please run this script from the songIQ project root directory${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Starting comprehensive security audit...${NC}"
echo ""

# Initialize counters
issues_found=0
critical_issues=0

# Function to report issues
report_issue() {
    local severity=$1
    local message=$2
    local file=$3
    
    if [ "$severity" = "CRITICAL" ]; then
        echo -e "${RED}❌ CRITICAL: $message${NC}"
        if [ -n "$file" ]; then
            echo -e "${RED}   File: $file${NC}"
        fi
        ((critical_issues++))
    elif [ "$severity" = "WARNING" ]; then
        echo -e "${YELLOW}⚠️  WARNING: $message${NC}"
        if [ -n "$file" ]; then
            echo -e "${YELLOW}   File: $file${NC}"
        fi
    else
        echo -e "${BLUE}ℹ️  INFO: $message${NC}"
        if [ -n "$file" ]; then
            echo -e "${BLUE}   File: $file${NC}"
        fi
    fi
    ((issues_found++))
}

# 1. Check for real API keys in source code
echo -e "${BLUE}1. Scanning for real API keys in source code...${NC}"

# Stripe keys
if grep -r "sk_live_[A-Za-z0-9]\{24,\}" songiq/server/src/ songiq/client/src/ --exclude-dir=node_modules 2>/dev/null | grep -v "your_production_" | grep -v "template" | grep -v "placeholder"; then
    report_issue "CRITICAL" "Real Stripe secret keys found in source code" ""
fi

if grep -r "pk_live_[A-Za-z0-9]\{24,\}" songiq/server/src/ songiq/client/src/ --exclude-dir=node_modules 2>/dev/null | grep -v "your_production_" | grep -v "template" | grep -v "placeholder"; then
    report_issue "WARNING" "Real Stripe publishable keys found in source code" ""
fi

# Other API keys
if grep -r "AIza[0-9A-Za-z_-]\{35\}" songiq/server/src/ songiq/client/src/ --exclude-dir=node_modules 2>/dev/null | grep -v "your_production_" | grep -v "template" | grep -v "placeholder"; then
    report_issue "CRITICAL" "Real YouTube API keys found in source code" ""
fi

if grep -r "sk_[0-9A-Za-z]\{24,\}" songiq/server/src/ songiq/client/src/ --exclude-dir=node_modules 2>/dev/null | grep -v "your_production_" | grep -v "template" | grep -v "placeholder"; then
    report_issue "CRITICAL" "Real Stripe keys found in source code" ""
fi

# MongoDB connection strings
if grep -r "mongodb://[^:]*:[^@]*@" songiq/server/src/ songiq/client/src/ --exclude-dir=node_modules 2>/dev/null | grep -v "your_production_" | grep -v "template" | grep -v "placeholder"; then
    report_issue "CRITICAL" "Real MongoDB connection strings found in source code" ""
fi

# 2. Check for exposed keys in environment files
echo ""
echo -e "${BLUE}2. Checking environment files for exposed keys...${NC}"

# Check if .env files are tracked by git
if git ls-files --error-unmatch songiq/server/.env.production >/dev/null 2>&1; then
    report_issue "CRITICAL" ".env.production is tracked by git" ""
fi

if git ls-files --error-unmatch songiq/client/.env.production >/dev/null 2>&1; then
    report_issue "CRITICAL" "Client .env.production is tracked by git" ""
fi

# Check for real keys in tracked environment files
if [ -f "songiq/server/env.development" ]; then
    if grep -q "sk_live_[A-Za-z0-9]\{24,\}" songiq/server/env.development 2>/dev/null; then
        report_issue "CRITICAL" "Real Stripe keys found in tracked env.development file" "songiq/server/env.development"
    fi
fi

# 3. Check deployment packages
echo ""
echo -e "${BLUE}3. Checking deployment packages for exposed keys...${NC}"

for package_dir in deploy-package-*; do
    if [ -d "$package_dir" ]; then
        if [ -f "$package_dir/server.env" ]; then
            if grep -q "sk_live_[A-Za-z0-9]\{24,\}" "$package_dir/server.env" 2>/dev/null; then
                report_issue "CRITICAL" "Real Stripe keys found in deployment package" "$package_dir/server.env"
            fi
        fi
    fi
done

# 4. Check for hardcoded secrets in scripts
echo ""
echo -e "${BLUE}4. Checking deployment scripts for hardcoded secrets...${NC}"

for script in *.sh; do
    if [ -f "$script" ]; then
        if grep -q "sk_live_[A-Za-z0-9]\{24,\}" "$script" 2>/dev/null; then
            report_issue "WARNING" "Potential hardcoded Stripe keys in script" "$script"
        fi
    fi
done

# 5. Check git history for exposed keys
echo ""
echo -e "${BLUE}5. Checking git history for exposed keys...${NC}"

if git log --all --full-history -- "**/.env*" | grep -q "sk_live_[A-Za-z0-9]\{24,\}" 2>/dev/null; then
    report_issue "CRITICAL" "Stripe keys found in git history" ""
fi

# 6. Check for exposed keys in logs
echo ""
echo -e "${BLUE}6. Checking log files for exposed keys...${NC}"

if [ -d "logs" ]; then
    if grep -r "sk_live_[A-Za-z0-9]\{24,\}" logs/ 2>/dev/null; then
        report_issue "WARNING" "Stripe keys found in log files" "logs/"
    fi
fi

# 7. Check for exposed keys in build artifacts
echo ""
echo -e "${BLUE}7. Checking build artifacts for exposed keys...${NC}"

if [ -d "songiq/server/dist" ]; then
    if grep -r "sk_live_[A-Za-z0-9]\{24,\}" songiq/server/dist/ 2>/dev/null; then
        report_issue "WARNING" "Stripe keys found in build artifacts" "songiq/server/dist/"
    fi
fi

# 8. Check for exposed keys in client build
echo ""
echo -e "${BLUE}8. Checking client build for exposed keys...${NC}"

if [ -d "songiq/client/dist" ]; then
    if grep -r "pk_live_[A-Za-z0-9]\{24,\}" songiq/client/dist/ 2>/dev/null; then
        report_issue "WARNING" "Stripe publishable keys found in client build" "songiq/client/dist/"
    fi
fi

# 9. Check for exposed keys in documentation
echo ""
echo -e "${BLUE}9. Checking documentation for exposed keys...${NC}"

if grep -r "sk_live_[A-Za-z0-9]\{24,\}" *.md 2>/dev/null | grep -v "your_production_" | grep -v "template" | grep -v "placeholder"; then
    report_issue "WARNING" "Potential real Stripe keys found in documentation" ""
fi

# 10. Check for exposed keys in configuration files
echo ""
echo -e "${BLUE}10. Checking configuration files for exposed keys...${NC}"

for config_file in *.js *.json *.ts *.tsx; do
    if [ -f "$config_file" ]; then
        if grep -q "sk_live_[A-Za-z0-9]\{24,\}" "$config_file" 2>/dev/null; then
            report_issue "WARNING" "Potential Stripe keys found in config file" "$config_file"
        fi
    fi
done

# Summary
echo ""
echo -e "${BLUE}📋 Security Audit Summary${NC}"
echo "=========================="

if [ $critical_issues -gt 0 ]; then
    echo -e "${RED}❌ $critical_issues CRITICAL issues found${NC}"
    echo -e "${RED}❌ $issues_found total issues found${NC}"
    echo ""
    echo -e "${RED}🚨 IMMEDIATE ACTION REQUIRED:${NC}"
    echo "1. Revoke all exposed API keys immediately"
    echo "2. Generate new API keys"
    echo "3. Remove exposed keys from git history"
    echo "4. Update all environment files"
    echo "5. Redeploy with new keys"
    exit 1
elif [ $issues_found -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $issues_found issues found (no critical issues)${NC}"
    echo ""
    echo -e "${YELLOW}📝 Recommended actions:${NC}"
    echo "1. Review and fix the issues above"
    echo "2. Consider rotating API keys as a precaution"
    echo "3. Update documentation to remove any exposed keys"
else
    echo -e "${GREEN}✅ No security issues found${NC}"
    echo ""
    echo -e "${GREEN}🎉 Security audit passed!${NC}"
fi

echo ""
echo -e "${BLUE}🔒 Security Best Practices:${NC}"
echo "1. Never commit .env files to git"
echo "2. Use environment variables for all secrets"
echo "3. Rotate API keys regularly"
echo "4. Monitor API usage for unauthorized activity"
echo "5. Use different keys for development and production"
echo ""

# Unset variables
unset issues_found critical_issues
