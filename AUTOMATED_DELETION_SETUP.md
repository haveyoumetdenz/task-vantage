# 🔧 Automated Account Deletion Setup

## Overview
This guide shows how to set up automated account deletion that removes both Firestore profiles and Firebase Auth accounts.

## 🚀 Setup Steps

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2. Initialize Firebase Functions
```bash
firebase init functions
# Select TypeScript
# Select your project
```

### 3. Install Dependencies
```bash
cd functions
npm install firebase-admin firebase-functions
npm install -D typescript @types/node
```

### 4. Deploy Cloud Functions
```bash
firebase deploy --only functions
```

### 5. Update Account Management Dialog
Replace the `permanentlyDeleteUserAccount` call with `completelyDeleteUserAccount` in the AccountManagementDialog component.

## 🔧 How It Works

### Client-Side (User Management)
1. User clicks "Permanently Delete Account"
2. System calls `completelyDeleteUserAccount()`
3. Function deactivates account and unassigns from tasks/projects
4. Function calls Cloud Function `deleteUserAccount`

### Cloud Function (Server-Side)
1. Validates that caller is HR or Senior Management
2. Deletes Firestore profile document
3. Deletes Firebase Auth account
4. Returns success/failure response

## 🛡️ Security Features

- **Role-based access**: Only HR and Senior Management can delete accounts
- **Authentication required**: Must be logged in to call the function
- **Audit trail**: Logs who deleted which account and why
- **Error handling**: Proper error messages and rollback

## 📊 Benefits

- ✅ **Fully automated**: No manual steps required
- ✅ **Complete deletion**: Removes both profile and auth account
- ✅ **Secure**: Role-based permissions
- ✅ **Auditable**: Full audit trail
- ✅ **Immediate**: User cannot log in after deletion

## 🔍 Testing

After deployment, test the automated deletion:

1. Go to User Management
2. Click "Manage Account" on any user
3. Select "Permanently Delete Account"
4. Provide reason and confirm
5. User should be completely deleted (cannot log in)

## 🚨 Important Notes

- **Irreversible**: Once deleted, accounts cannot be recovered
- **Requires deployment**: Cloud Functions must be deployed first
- **Admin privileges**: Cloud Function has admin privileges to delete auth accounts
- **Cost**: Cloud Functions have usage costs (minimal for account deletion)

## 🔧 Troubleshooting

### Function not found
- Ensure Cloud Functions are deployed: `firebase deploy --only functions`
- Check Firebase Console → Functions to see deployed functions

### Permission denied
- Ensure user has HR or Senior Management role
- Check Firestore rules are updated

### Auth account not deleted
- Check Cloud Function logs in Firebase Console
- Ensure service account has proper permissions

