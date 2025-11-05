# 🔧 SSH Troubleshooting - Fix Connection Now

## 🎯 **SSH Connection Issues - Let's Fix This**

**Server:** 64.202.184.174  
**Username:** rthadmin  
**Domain:** songiq.ai  

---

## 🔍 **STEP 1: What Error Are You Getting?**

### **Common Errors & Solutions:**

#### **A. "Connection timed out" or "No route to host"**

**Try this:**
```bash
# Test if server is reachable
ping 64.202.184.174

# If ping works, try SSH with timeout
ssh -o ConnectTimeout=60 rthadmin@64.202.184.174
```

---

#### **B. "Permission denied (publickey,password)"**

**Try these commands in order:**

```bash
# Method 1: Force password authentication
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no rthadmin@64.202.184.174

# Method 2: Interactive keyboard
ssh -o PreferredAuthentications=keyboard-interactive,password rthadmin@64.202.184.174

# Method 3: Verbose to see what's happening
ssh -v rthadmin@64.202.184.174
```

---

#### **C. "Connection refused"**

**Possible solutions:**
```bash
# Try alternate SSH port (if configured)
ssh -p 2222 rthadmin@64.202.184.174

# Or standard port with verbose
ssh -v -p 22 rthadmin@64.202.184.174
```

---

#### **D. SSH hangs/freezes with no response**

**Try this:**
```bash
# Add ServerAliveInterval to keep connection alive
ssh -o ServerAliveInterval=60 rthadmin@64.202.184.174

# Or with specific auth
ssh -o PreferredAuthentications=password -o ServerAliveInterval=60 rthadmin@64.202.184.174
```

---

## 🚀 **QUICK FIX COMMANDS**

### **Try These In Order:**

**1. Basic SSH (simplest):**
```bash
ssh rthadmin@64.202.184.174
```

**2. Force password auth:**
```bash
ssh -o PreferredAuthentications=password rthadmin@64.202.184.174
```

**3. Verbose mode (to see errors):**
```bash
ssh -v rthadmin@64.202.184.174
```

**4. Full options:**
```bash
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no -o ConnectTimeout=60 rthadmin@64.202.184.174
```

---

## 🌐 **ALTERNATIVE: WEB-BASED ACCESS**

If SSH still doesn't work, try these alternatives:

### **Option 1: Hosting Provider Control Panel**

Most hosting providers have web-based terminal access:

1. Log into your hosting control panel (GoDaddy, DigitalOcean, etc.)
2. Look for:
   - "Terminal"
   - "SSH/Shell Access"
   - "Console"
   - "Command Line"
3. Open web terminal
4. Run deployment commands from there

### **Option 2: Use Hosting Provider's Deployment Tools**

Many hosts have deployment features:
- Git deploy hooks
- File manager with terminal
- Web-based command execution

---

## 🔑 **CREDENTIAL CHECK**

### **Verify Your Credentials:**

**Username:** rthadmin ✅  
**Server:** 64.202.184.174 ✅  
**Port:** 22 (default) or check if different  
**Password:** (you should have this)  

### **If You Don't Have Password:**

1. **Check your password manager**
2. **Check hosting provider account** (password reset option)
3. **Contact hosting support** for password reset

---

## 🛠️ **DIAGNOSTIC TESTS**

### **Run These to Diagnose:**

```bash
# Test 1: Can you reach the server?
ping 64.202.184.174

# Test 2: Is SSH port open?
nc -zv 64.202.184.174 22

# Test 3: What's the SSH version?
ssh -V

# Test 4: Verbose SSH connection
ssh -vvv rthadmin@64.202.184.174 2>&1 | head -50
```

---

## 💡 **WHAT TO TRY RIGHT NOW**

### **Recommended Order:**

**1. Try this first (most likely to work):**
```bash
ssh -o PreferredAuthentications=password rthadmin@64.202.184.174
```

**2. If that fails, try with verbose:**
```bash
ssh -vv rthadmin@64.202.184.174
```

**Copy the output and I can help diagnose!**

**3. If all SSH fails:**
- Check your hosting provider's control panel for web terminal
- Look for "SSH/Shell Access" in the menu
- Use that to run deployment commands

---

## 🎯 **DEPLOYMENT WITHOUT SSH**

### **If You Have Web Terminal Access:**

Once you get terminal access (web-based or SSH), run:

```bash
cd /var/www/songiq && \
git pull origin main && \
cd songiq/server && npm install && \
cd ../client && npm install && npm run build && \
cd /var/www/songiq/songiq/server && pm2 restart songiq-server && \
cd /var/www/songiq/songiq/client && pm2 restart songiq-client && \
pm2 status
```

---

## 📞 **NEED HELP?**

**Share with me:**

1. What command you're running
2. What error message you see
3. Output of: `ssh -v rthadmin@64.202.184.174`

And I'll help you fix it!

---

## 🎊 **REMEMBER**

**Your code is ready! (commit: c6c4792)**

All we need is terminal access to run the deployment. Once we solve the SSH issue, deployment takes only 3-5 minutes!

**Let's get you connected and deploy those 51 amazing features!** 🚀

