// Debug script to check tasks in Firebase
// Run this in the browser console on your Firebase project

console.log('🔍 Debugging Tasks in Firebase...');

// Check if there are any tasks in the database
const checkTasks = async () => {
  try {
    // This would need to be run in the browser with Firebase initialized
    console.log('To debug tasks:');
    console.log('1. Go to Firebase Console → Firestore Database');
    console.log('2. Check the "tasks" collection');
    console.log('3. Look for tasks created by Test 1 (dentkq@hotmail.com)');
    console.log('4. Verify the task has userId matching Test 1\'s user ID');
    
    console.log('\n📋 Manual Steps:');
    console.log('1. Go to Firebase Console');
    console.log('2. Navigate to Firestore Database');
    console.log('3. Check the "tasks" collection');
    console.log('4. Look for any tasks created by Test 1');
    console.log('5. If no tasks exist, create a test task as Test 1');
    
    console.log('\n🔧 Firestore Rules Update:');
    console.log('1. Go to Firebase Console → Firestore Database → Rules');
    console.log('2. Replace the Director rule with:');
    console.log('   get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role == "Director" ||');
    console.log('3. Click "Publish"');
    
  } catch (error) {
    console.error('Error:', error);
  }
};

checkTasks();

