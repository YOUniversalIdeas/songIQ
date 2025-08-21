#!/bin/bash

# songIQ SSH Key Setup Script
# This script helps you set up SSH keys for passwordless deployment

echo "🔑 Setting up SSH keys for songIQ deployment..."
echo ""

# Display the public key
echo "📋 Your public SSH key:"
echo "----------------------------------------"
cat ~/.ssh/songiq_deploy_key.pub
echo "----------------------------------------"
echo ""

echo "📝 Instructions:"
echo "1. SSH into your GoDaddy server:"
echo "   ssh rthadmin@64.202.184.174"
echo "   Password: EBE1zag.zrc.fby_pzj"
echo ""
echo "2. Run these commands on the server:"
echo "   mkdir -p ~/.ssh"
echo "   chmod 700 ~/.ssh"
echo "   echo \"$(cat ~/.ssh/songiq_deploy_key.pub)\" >> ~/.ssh/authorized_keys"
echo "   chmod 600 ~/.ssh/authorized_keys"
echo ""
echo "3. Test the connection:"
echo "   ssh -i ~/.ssh/songiq_deploy_key rthadmin@64.202.184.174"
echo ""
echo "4. If successful, update your deployment scripts to use this key"
echo ""

echo "✅ SSH key setup instructions completed!"
echo "   Follow the steps above to complete the setup on your server."
