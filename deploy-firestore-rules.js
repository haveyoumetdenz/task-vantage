// Script to deploy Firestore rules
// Run this in your terminal: node deploy-firestore-rules.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Firestore Security Rules...');

try {
  // Check if Firebase CLI is installed
  try {
    execSync('firebase --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Firebase CLI not found. Please install it first:');
    console.error('npm install -g firebase-tools');
    process.exit(1);
  }

  // Check if user is logged in
  try {
    execSync('firebase projects:list', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Not logged in to Firebase. Please run:');
    console.error('firebase login');
    process.exit(1);
  }

  // Deploy the rules
  console.log('📝 Deploying rules from firestore.rules...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  
  console.log('✅ Firestore rules deployed successfully!');
  console.log('🔄 Refresh your app to see the changes.');
  
} catch (error) {
  console.error('❌ Error deploying rules:', error.message);
  console.log('\n📋 Manual steps:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('2. Select your project: spmproject-37e7a');
  console.log('3. Go to Firestore Database → Rules');
  console.log('4. Copy the contents of firestore.rules file');
  console.log('5. Paste and publish the rules');
}
