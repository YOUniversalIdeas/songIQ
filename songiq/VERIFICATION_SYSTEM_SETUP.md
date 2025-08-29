# 🔐 songIQ Verification System Setup Guide

This guide will help you set up the complete verification system for songIQ, including both email and SMS verification using SendGrid and Twilio.

## 🚀 **Quick Start**

1. **Install Dependencies** ✅ COMPLETED
2. **Configure Twilio** (Get API keys)
3. **Update Environment Variables**
4. **Test the System**
5. **Deploy to Production**

---

## 📦 **Dependencies Installed**

The following packages have been added to your server:
- `twilio` - SMS service
- `@types/twilio` - TypeScript types

---

## 🔑 **Twilio Setup (Required for SMS)**

### **1. Create Twilio Account**
1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account
3. Verify your email and phone number

### **2. Get Your Credentials**
1. In Twilio Console, go to **Dashboard**
2. Copy your **Account SID** and **Auth Token**
3. Go to **Phone Numbers** → **Manage** → **Active numbers**
4. Get a phone number for sending SMS (or use your verified number for testing)

### **3. Environment Variables**
Update your environment files with:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 📧 **SendGrid Setup (Already Configured)**

Your SendGrid is already configured in the environment files:
- `EMAIL_SERVICE=sendgrid`
- `EMAIL_USER=apikey`
- `EMAIL_PASSWORD=your_sendgrid_api_key_here`

---

## 🏗️ **System Architecture**

### **Backend Components**
1. **Verification Service** (`src/services/verificationService.ts`)
   - Handles both email and SMS verification
   - Generates 6-digit codes
   - Integrates with SendGrid and Twilio

2. **Verification Routes** (`src/routes/verification.ts`)
   - `/api/verification/send` - Send verification codes
   - `/api/verification/verify-email` - Verify email code
   - `/api/verification/verify-sms` - Verify SMS code
   - `/api/verification/resend` - Resend codes
   - `/api/verification/status` - Get verification status

3. **Updated User Model** (`src/models/User.ts`)
   - Added SMS verification fields
   - Added verification methods
   - 10-minute expiration for codes

### **Frontend Components**
1. **Verification Page** (`src/pages/VerificationPage.tsx`)
   - Beautiful UI for entering codes
   - Real-time status updates
   - Resend functionality

2. **Updated Registration Flow**
   - Automatically sends verification codes after registration
   - Redirects to verification page

---

## 🧪 **Testing the System**

### **1. Test Backend**
```bash
cd songiq/server
npm run test-verification
```

### **2. Test Frontend**
1. Register a new user
2. Check email and phone for verification codes
3. Navigate to `/verify` page
4. Enter codes to verify account

### **3. Test API Endpoints**
```bash
# Send verification codes
curl -X POST http://localhost:5001/api/verification/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Verify email
curl -X POST http://localhost:5001/api/verification/verify-email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"123456"}'

# Verify SMS
curl -X POST http://localhost:5001/api/verification/verify-sms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"123456"}'
```

---

## 🔄 **User Flow**

### **New User Registration**
1. User fills out registration form
2. Account is created (unverified)
3. **Automatically sends verification codes**:
   - Email verification code via SendGrid
   - SMS verification code via Twilio
4. User is redirected to verification page
5. User enters codes to verify account
6. Account is marked as verified

### **Existing User Login**
1. User logs in with email/password
2. If unverified, redirect to verification page
3. User can resend codes if needed
4. Complete verification to access full features

---

## 🛡️ **Security Features**

### **Code Generation**
- 6-digit numeric codes
- Cryptographically secure random generation
- 10-minute expiration

### **Rate Limiting**
- Verification attempts are rate-limited
- Prevents brute force attacks

### **Token Management**
- Verification tokens are cleared after use
- Expired tokens are automatically invalidated

---

## 📱 **SMS Message Format**

```
🎵 songIQ Verification Code: 123456

Hi [UserName], use this code to verify your account. This code expires in 10 minutes.

If you didn't request this, please ignore this message.
```

---

## 📧 **Email Template Features**

- **Professional Design**: songIQ branding with orange theme
- **Mobile Responsive**: Works on all devices
- **Clear Call-to-Action**: Prominent verification code display
- **Security Notes**: Reminds users not to share codes
- **Dual Verification**: Mentions both email and SMS verification

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. SMS Not Sending**
- Check Twilio credentials
- Verify phone number format (+1234567890)
- Check Twilio account status (trial accounts have limitations)

#### **2. Email Not Sending**
- Verify SendGrid API key
- Check email service configuration
- Review server logs for errors

#### **3. Verification Codes Not Working**
- Check if codes have expired (10 minutes)
- Verify code format (6 digits)
- Check server logs for validation errors

### **Debug Commands**
```bash
# Check environment variables
cd songiq/server
npm run test-verification

# Check server logs
tail -f logs/app.log

# Test individual services
npm run test-email
```

---

## 🚀 **Production Deployment**

### **1. Environment Variables**
Update production environment with real Twilio credentials:
```bash
TWILIO_ACCOUNT_SID=AC_production_sid_here
TWILIO_AUTH_TOKEN=production_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### **2. Twilio Production Setup**
1. Upgrade from trial account
2. Verify your business domain
3. Request higher sending limits
4. Set up webhook monitoring

### **3. Monitoring**
- Monitor verification success rates
- Track SMS delivery status
- Monitor email delivery rates
- Set up alerts for failures

---

## 💰 **Costs**

### **Twilio Pricing**
- **Trial Account**: Free (limited to verified numbers)
- **Production**: $0.0079 per SMS (US numbers)
- **International**: Varies by country

### **SendGrid Pricing**
- **Free Tier**: 100 emails/day
- **Paid Plans**: Starting at $14.95/month for 50k emails

---

## 📚 **Next Steps**

1. **Get Twilio Credentials** and update environment
2. **Test the system** with real phone numbers
3. **Customize SMS/Email templates** if needed
4. **Deploy to production** when ready
5. **Monitor and optimize** based on usage

---

## 🔗 **Useful Links**

- [Twilio Console](https://console.twilio.com/)
- [SendGrid Dashboard](https://app.sendgrid.com/)
- [Twilio SMS API Docs](https://www.twilio.com/docs/sms)
- [SendGrid API Docs](https://sendgrid.com/docs/API_Reference/)

---

## ✅ **Completion Checklist**

- [x] Install Twilio dependencies
- [x] Create verification service
- [x] Update User model
- [x] Create verification routes
- [x] Update registration flow
- [x] Create frontend verification page
- [x] Add verification route to App.tsx
- [x] Update environment templates
- [x] Create test script
- [ ] Get Twilio credentials
- [ ] Update environment variables
- [ ] Test SMS functionality
- [ ] Test email functionality
- [ ] Deploy to production

---

**🎉 Your verification system is ready! Just add your Twilio credentials and test it out.**
