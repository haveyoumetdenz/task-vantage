# Manual Firebase Rules Setup

## Quick Fix for Teams Query Error

The "Missing or insufficient permissions" error occurs because Firebase Security Rules need to be updated to allow reading teams without authentication.

### Option 1: Firebase Console (Recommended)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `spmproject-37e7a`
3. **Navigate to Firestore Database** → **Rules** tab
4. **Replace the existing rules** with the contents from `firestore.rules` file
5. **Click "Publish"**

### Option 2: Firebase CLI (If you have it installed)

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy the rules
firebase deploy --only firestore:rules
```

### Option 3: Quick Rules Update

If you want to quickly fix just the teams issue, replace your current Firestore rules with this minimal version:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow reading teams for signup
    match /teams/{teamId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow reading profiles for email checking
    match /profiles/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to manage their own data
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
    
    match /projects/{projectId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Expected Result

After updating the rules:
- ✅ Teams should load in the signup form
- ✅ Email checking should work
- ✅ No more "Missing or insufficient permissions" errors
- ✅ Signup form should show team dropdown options

### Troubleshooting

If you still get errors:
1. **Check the Firebase Console** to ensure rules were published
2. **Wait a few minutes** for rules to propagate
3. **Refresh your app** completely
4. **Check browser console** for any remaining errors
