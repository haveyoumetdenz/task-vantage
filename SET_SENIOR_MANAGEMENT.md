# Setting User to Senior Management

## Option 1: Using Browser Console (Easiest)

1. Open your application in the browser
2. Open the browser console (F12 or Cmd+Option+I)
3. Run this command:

```javascript
await updateUserToSeniorManagement('denzel.toh.2022@scis.smu.edu.sg')
```

This will:
- Find the user by email
- Create the Senior Management team if it doesn't exist
- Set the user's role to "Senior Management"
- Set the user's teamId to "senior-management"
- Add a `_seniorManagementSet` flag to prevent accidental overwrites

## Option 2: Using Node.js Script

If you have Firebase Admin SDK set up:

```bash
node scripts/set-user-to-senior-management.js denzel.toh.2022@scis.smu.edu.sg
```

## Protection Against Overwrites

The system now includes protection to prevent the Senior Management role from being overwritten:

1. **`_seniorManagementSet` flag**: When a user is set to Senior Management, a flag is added to their profile
2. **Cloud Function protection**: The `createUserWithPassword` Cloud Function now checks for this flag and preserves the Senior Management role even if HR tries to update the account through the InviteUserDialog

## Verification

After setting the user to Senior Management, verify in Firebase Console:
- Go to Firestore → `profiles` collection
- Find the user document
- Check that:
  - `role` = "Senior Management"
  - `teamId` = "senior-management"
  - `_seniorManagementSet` = true

