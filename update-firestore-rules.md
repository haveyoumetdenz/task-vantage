# Update Firestore Rules

Since Firebase CLI is not installed, you'll need to update the Firestore rules manually:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Firestore Database > Rules
4. Replace the existing rules with the content from `firestore.rules`
5. Click "Publish"

The new rules include permissions for the `recurringOverrides` collection which is needed for the virtual instance system.