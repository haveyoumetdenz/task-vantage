# 🔧 Quick Firestore Rules Update

## The Problem
The virtual instances are stuck loading because the Firestore rules don't allow access to the `recurringOverrides` collection.

## The Solution
Update your Firestore rules to include permissions for the `recurringOverrides` collection.

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules**

### Step 2: Add the Missing Rule
Add this rule to your existing rules (before the closing `}`):

```javascript
// Recurring Overrides - Virtual instance overrides
match /recurringOverrides/{overrideId} {
  allow read, write: if request.auth != null;
}
```

### Step 3: Publish
Click **"Publish"** to save the rules.

## What This Fixes
- ✅ Virtual instances will load properly
- ✅ You can modify individual instances
- ✅ Changes will be saved to Firestore
- ✅ Calendar integration will work

## Test It
After updating the rules:
1. Refresh the `/virtual-instance-demo` page
2. You should see virtual instances instead of "Loading instances..."
3. You can edit individual instances
4. Changes will persist across page reloads


