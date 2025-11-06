# Teams Setup Instructions

## Quick Setup (Recommended)

### Option 1: Use the Team Management Page
1. **Login to your app** (make sure you're logged in as Senior Management)
2. **Go to Team Management** - Click "Team" in the sidebar
3. **Click "Create Team Structure"** button at the top right
4. **Wait for success message** - Teams will be created automatically
5. **Go back to Signup page** - Teams should now be available in the dropdown

### Option 2: Use Browser Console (Alternative)
1. **Open your app** in the browser
2. **Open Developer Tools** (F12) → Console tab
3. **Copy and paste** the code from `create-teams-direct.js`
4. **Press Enter** to run the script
5. **Check console** for success messages

## What Teams Will Be Created

- **Engineering 1** (top-level team)
  - **Engineering 2** (sub-team under Engineering 1)
- **HR** (top-level team)

## Troubleshooting

### If "No Teams Available" still shows:
1. **Check console** for any error messages
2. **Refresh the page** after creating teams
3. **Make sure you're logged in** as Senior Management
4. **Check Firebase console** to see if teams were created

### If you get permission errors:
1. **Make sure you're logged in** first
2. **Check your user role** is Senior Management
3. **Try the Team Management page** instead of console script

## Expected Result

After creating teams, the signup form should show:
- ✅ **Engineering 1** in the Team dropdown
- ✅ **Engineering 2** in the Team dropdown  
- ✅ **HR** in the Team dropdown
- ✅ **"Create Account" button** becomes enabled
