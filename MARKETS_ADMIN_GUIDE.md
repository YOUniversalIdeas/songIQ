# Prediction Markets - Admin Guide

## 🔐 Access

The Markets Admin panel is available only to **superadmin** users in the Admin Dashboard.

**Access URL**: `http://localhost:3001/admin` → Click **"Markets"** tab

## 🎯 Features

### 1. **Market Overview**
View all prediction markets with real-time statistics:
- **Total Markets**: Count of all markets
- **Active Markets**: Currently trading markets
- **Resolved Markets**: Completed and paid out
- **Total Volume**: Sum of all trading activity

### 2. **Market Filtering**
Filter markets by status:
- **All** - View every market
- **Active** - Currently open for trading
- **Closed** - Ended but not yet resolved
- **Resolved** - Winner determined, payouts complete
- **Cancelled** - Market was cancelled

### 3. **Market Resolution** 🏆
When a market's end date passes, resolve it:

**Steps**:
1. Find the market in the list (status shows "Resolve" button)
2. Click **"Resolve"**
3. Select the winning outcome
4. Confirm

**What Happens**:
- Winning shares pay out $1.00 each
- Losing shares pay out $0.00
- User positions are finalized
- Market status changes to "Resolved"

### 4. **Market Details Table**
For each market, view:
- **Title & Description**
- **Status Badge** (color-coded)
- **Total Volume** (trading activity)
- **End Date** (when trading closes)
- **Action Buttons** (resolve/view)

## 📊 Market Statuses

| Status | Color | Meaning |
|--------|-------|---------|
| **Active** | 🟢 Green | Trading is open |
| **Closed** | ⚪ Gray | Trading ended, awaiting resolution |
| **Resolved** | 🔵 Blue | Winner determined, payouts complete |
| **Cancelled** | 🔴 Red | Market was cancelled |

## 🎬 Resolving a Market

### When to Resolve
- Market end date has passed
- Real-world outcome is known and verifiable
- You have admin/superadmin privileges

### Resolution Process

```
1. Check real-world outcome
   ↓
2. Login as superadmin
   ↓
3. Go to Admin → Markets tab
   ↓
4. Find market (shows "Resolve" button)
   ↓
5. Click "Resolve"
   ↓
6. Review outcomes and probabilities
   ↓
7. Select winning outcome
   ↓
8. System automatically:
   - Pays winners $1.00/share
   - Updates all positions
   - Marks market as resolved
```

### Example Resolution

**Market**: "Will Drake release album in 2025?"
- **End Date**: Dec 31, 2025
- **Outcomes**:
  - "Yes, in 2025" (45% probability)
  - "No, not in 2025" (55% probability)

**If Drake releases album**:
1. Click "Resolve"
2. Select "Yes, in 2025"
3. All "Yes" shares get $1.00 each
4. All "No" shares get $0.00

**Users with "Yes" shares profit!**

## 💰 Financial Impact

When you resolve a market:

**Winners**:
- Each share → $1.00 payout
- Profit = ($1.00 - purchase_price) × shares

**Losers**:
- Each share → $0.00 payout
- Loss = purchase_price × shares

**Example**:
- User bought 10 shares of "Yes" @ $0.45 each
- Total cost: $4.50 + fees
- Market resolves to "Yes"
- Payout: 10 × $1.00 = $10.00
- **Profit: ~$5.50** ✅

## 🚨 Important Notes

### Before Resolving
- ✅ Verify the real-world outcome
- ✅ Check all outcome descriptions
- ✅ Ensure end date has passed
- ⚠️ Resolution is **irreversible**

### Best Practices
1. **Wait for official confirmation** of real-world outcomes
2. **Document your decision** (screenshots, links)
3. **Resolve promptly** after outcomes are known
4. **Be consistent** with resolution criteria

### Resolution Criteria Examples

**Chart Position Markets**:
- Use official Billboard/chart data
- Wait for final week's results
- Screenshot chart position as proof

**Award Markets**:
- Wait for official ceremony
- Use official winner announcements
- Verify from multiple sources

**Streaming Number Markets**:
- Use official Spotify/platform data
- Wait until full period completes
- Round to whole numbers

**Release Date Markets**:
- Official release date only (not leaks)
- Use artist/label announcements
- Time zone: Market creator's description

## 🛡️ Access Control

### Role Requirements
- **Regular Users**: Cannot access admin panel
- **Admins**: Can view markets (TODO: adjust as needed)
- **Superadmins**: Full access to resolve markets

### Checking Your Role
```javascript
// In browser console
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.role); // Should be 'superadmin'
```

## 📈 Market Statistics

The admin panel shows:

1. **Total Markets**: All-time market count
2. **Active Markets**: Currently trading
3. **Resolved Markets**: Completed
4. **Total Volume**: Sum of all trades across all markets

Use these to monitor:
- Platform growth
- Trading activity
- Resolution efficiency
- User engagement

## 🔧 Troubleshooting

### "Resolve" Button Not Showing
- Check if market end date has passed
- Verify market status is "active"
- Ensure you're logged in as superadmin

### Resolution Fails
- Check authentication token
- Verify network connection
- Ensure outcome ID is valid
- Check browser console for errors

### Can't Access Admin Panel
- Verify superadmin role in database
- Clear browser cache and re-login
- Check `/admin` route is working

## 🎯 Future Enhancements

Potential admin features to add:
- [ ] Edit market details
- [ ] Cancel markets
- [ ] Extend end dates
- [ ] View detailed trade history
- [ ] Export market data
- [ ] Dispute resolution system
- [ ] Automated resolution (API integration)
- [ ] Market creation wizard
- [ ] Bulk operations
- [ ] Analytics dashboard

## 📞 Support

For issues or questions:
1. Check this guide
2. Review `PREDICTION_MARKETS_GUIDE.md`
3. Check browser console for errors
4. Verify API is running (`http://localhost:5001/api/health`)

---

**Admin Panel**: http://localhost:3001/admin → Markets tab  
**API Endpoint**: `POST /api/markets/:id/resolve`  
**Required Role**: superadmin

**Last Updated**: November 2025  
**Version**: 1.0.0

