import { execSync } from 'child_process';

console.log('🚀 Deploying updated Firestore rules...');

try {
  // Deploy the rules
  execSync('firebase deploy --only firestore:rules', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ Firestore rules deployed successfully!');
  console.log('🔧 HR and Senior Management can now manage user accounts.');
  
} catch (error) {
  console.error('❌ Error deploying Firestore rules:', error.message);
  console.log('💡 Make sure you have Firebase CLI installed and are logged in:');
  console.log('   npm install -g firebase-tools');
  console.log('   firebase login');
  console.log('   firebase use your-project-id');
}
