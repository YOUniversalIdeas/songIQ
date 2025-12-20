# How to Add Predictions to the Marketplace

## 🎯 Overview

**Only administrators** can create prediction markets (predictions) that users can trade on. This guide explains how admins can add new predictions to the marketplace.

## 🔐 Access Requirements

- **Role Required**: `admin` or `superadmin`
- **Authentication**: Must be logged in with admin credentials
- Regular users can only **trade** on existing markets, not create new ones

## 🚀 Quick Start

### Method 1: Using the Admin Dashboard (Recommended)

**Note**: Market creation is only available in the Admin Dashboard, not on the public markets page.

1. **Navigate to Admin Dashboard**
   - Go to `http://localhost:3001/admin` (or your production URL)
   - Login as a superadmin user
   - Click on the **"Markets"** tab
   - Click the **"Create Market"** button in the top right
   - A modal will open with the market creation form

2. **Fill Out the Form**
   - **Title**: Clear, specific question (e.g., "Will 'Summer Vibes 2025' reach Top 10?")
   - **Description**: Detailed explanation of what the market predicts
   - **Category**: Choose from 7 categories:
     - 📊 Chart Position
     - 🎵 Streaming Numbers
     - 🏆 Awards
     - 📈 Genre Trends
     - ⭐ Artist Popularity
     - 🚀 Release Success
     - 💡 Other
   - **Outcomes**: Add 2-10 possible outcomes
     - Each outcome needs a name (required)
     - Optional description for clarity
   - **End Date**: When trading closes (must be in the future)
   - **Related Song ID**: (Optional) Link to a song in your database

3. **Submit**
   - Click "Create Market"
   - You'll be redirected to the new market page
   - The market is immediately active and ready for trading!

### Method 2: Using the API Directly

**Note**: Requires admin authentication token.

If you prefer to create markets programmatically:

```bash
POST /api/markets
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "title": "Will 'Summer Vibes 2025' reach Top 10?",
  "description": "This market predicts whether the song will reach the Billboard Top 10 chart.",
  "category": "chart_position",
  "outcomes": [
    {
      "name": "Yes, Top 10",
      "description": "The song reaches Top 10 on Billboard"
    },
    {
      "name": "No, not Top 10",
      "description": "The song does not reach Top 10"
    }
  ],
  "endDate": "2025-12-31T23:59:59.000Z",
  "relatedSongId": "optional-song-id"
}
```

## 📋 Required Fields

- **title**: String (max 200 characters)
- **description**: String (max 1000 characters)
- **category**: One of the 7 categories listed above
- **outcomes**: Array of 2-10 outcomes, each with:
  - `name`: String (required)
  - `description`: String (optional, defaults to name)
- **endDate**: ISO date string (must be in the future)

## ✅ Validation Rules

- **Admin role required** - Only `admin` or `superadmin` users can create markets
- Title and description are required
- Must have between 2 and 10 outcomes
- All outcome names must be unique
- End date must be in the future
- You must be authenticated with admin credentials

## 💡 Best Practices

### Writing Good Market Titles
- ✅ "Will 'Summer Vibes 2025' reach Top 10?"
- ✅ "Which artist will win Album of the Year at the 2025 Grammys?"
- ❌ "Song prediction" (too vague)
- ❌ "Music stuff" (not specific)

### Creating Clear Outcomes
- ✅ Mutually exclusive: "Yes" / "No"
- ✅ Complete coverage: Include all possible outcomes
- ✅ Specific: "Top 10" vs "Top 20" vs "Top 50"
- ❌ Overlapping: "Top 10" and "Top 20" (a song can be both)

### Setting End Dates
- Set dates that allow enough time for the outcome to be determined
- Consider when official data will be available
- Example: For Grammy predictions, set end date after the ceremony

### Categories
Choose the most appropriate category:
- **Chart Position**: Billboard, Spotify charts, etc.
- **Streaming Numbers**: Total streams, milestones
- **Awards**: Grammy, Billboard Music Awards, etc.
- **Genre Trends**: Genre popularity, mainstream adoption
- **Artist Popularity**: Monthly listeners, follower counts
- **Release Success**: Album releases, single releases
- **Other**: Anything that doesn't fit above

## 🎬 Example Markets

### Example 1: Chart Position
```json
{
  "title": "Will 'Summer Vibes 2025' reach Top 10 on Billboard Hot 100?",
  "description": "This market predicts whether the song will reach the Top 10 position on the Billboard Hot 100 chart by the end of 2025.",
  "category": "chart_position",
  "outcomes": [
    { "name": "Yes, Top 10", "description": "Reaches positions 1-10" },
    { "name": "No, not Top 10", "description": "Does not reach Top 10" }
  ],
  "endDate": "2025-12-31T23:59:59.000Z"
}
```

### Example 2: Awards
```json
{
  "title": "Who will win Album of the Year at the 2025 Grammys?",
  "description": "Predict the winner of the Album of the Year award at the 2025 Grammy Awards ceremony.",
  "category": "awards",
  "outcomes": [
    { "name": "Taylor Swift", "description": "Taylor Swift wins" },
    { "name": "Drake", "description": "Drake wins" },
    { "name": "Beyoncé", "description": "Beyoncé wins" },
    { "name": "Other Artist", "description": "Any other artist wins" }
  ],
  "endDate": "2025-02-10T23:59:59.000Z"
}
```

### Example 3: Streaming Numbers
```json
{
  "title": "Will 'Summer Vibes 2025' reach 1 billion streams in 2025?",
  "description": "This market predicts whether the song will reach 1 billion total streams across all platforms by December 31, 2025.",
  "category": "streaming_numbers",
  "outcomes": [
    { "name": "Yes, 1B+ streams", "description": "Reaches 1 billion or more" },
    { "name": "No, under 1B", "description": "Stays below 1 billion" }
  ],
  "endDate": "2025-12-31T23:59:59.000Z"
}
```

## 🔧 Troubleshooting

### "Admin access required" Error
- Make sure you're logged in with an admin account
- Check that your user role is `admin` or `superadmin`
- Verify your JWT token includes the correct role
- Contact a superadmin to promote your account if needed

### "Not authenticated" Error
- Make sure you're logged in
- Check that your JWT token is valid
- Try logging out and back in

### "Create Market" Button Not Showing
- Make sure you're in the Admin Dashboard (`/admin`), not the public markets page (`/markets`)
- Verify you're logged in as a superadmin user
- Check your user role in the database or user profile
- The "Create Market" button only appears in the Admin Dashboard → Markets tab

### "End date must be in the future" Error
- Check your system clock
- Ensure the date/time is set correctly
- Use ISO format: `YYYY-MM-DDTHH:mm:ss.sssZ`

### "Must have between 2 and 10 outcomes" Error
- Add at least 2 outcomes
- Remove outcomes if you have more than 10
- Make sure outcome names are filled in

### "Outcome names must be unique" Error
- Check for duplicate outcome names
- Case-insensitive matching (e.g., "Yes" and "yes" are duplicates)

## 📊 After Creating a Market

Once you create a market:

1. **It's immediately active** - Users can start trading
2. **Initial prices** - All outcomes start with equal probability
3. **Prices adjust** - As users trade, prices reflect market sentiment
4. **Resolution** - When the end date passes, admins can resolve the market

## 🎯 Next Steps

After creating markets:

1. **Share the market** - Share the market URL with users
2. **Monitor activity** - Watch trading volume and price movements
3. **Resolve when ready** - When the outcome is known, resolve the market (admin only)

## 📚 Related Documentation

- `PREDICTION_MARKETS_GUIDE.md` - Complete feature documentation
- `MARKETS_ADMIN_GUIDE.md` - How to resolve markets
- `PREDICTION_MARKETS_QUICKSTART.md` - Quick start guide

---

**Happy Market Creating! 📊🎵**

