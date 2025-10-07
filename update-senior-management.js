// Simple script to update Senior Management user profile
// Run this in the browser console on your Firebase project

console.log('🔧 Updating Senior Management user profile...');

// This script should be run in the Firebase Console or with proper Firebase credentials
// For now, let's create a manual update script

const updateSeniorManagementProfile = async () => {
  try {
    // You would need to run this in your Firebase project
    // This is a template for the update operation
    
    console.log('📝 To fix the Senior Management team assignment:');
    console.log('1. Go to your Firebase Console');
    console.log('2. Navigate to Firestore Database');
    console.log('3. Find the profiles collection');
    console.log('4. Find the user with email: denzel.toh.2022@scis.smu.edu.sg');
    console.log('5. Update the document to set teamId: null');
    console.log('6. Or run this Firebase CLI command:');
    console.log('');
    console.log('firebase firestore:update /profiles/{USER_ID} --data \'{"teamId": null}\'');
    console.log('');
    console.log('✅ This will properly separate Senior Management from any team');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

updateSeniorManagementProfile();

