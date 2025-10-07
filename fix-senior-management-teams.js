const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, getDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixSeniorManagementTeams() {
  try {
    console.log('🔧 Fixing Senior Management team assignments...');
    
    // Get all profiles
    const profilesRef = collection(db, 'profiles');
    const profilesSnapshot = await getDocs(profilesRef);
    
    let updatedCount = 0;
    
    for (const profileDoc of profilesSnapshot.docs) {
      const profileData = profileDoc.data();
      
      // If user is Senior Management, remove them from any team
      if (profileData.role === 'Senior Management') {
        console.log(`👨‍💼 Found Senior Management user: ${profileData.email}`);
        console.log(`   Current teamId: ${profileData.teamId || 'None'}`);
        
        // Update the profile to remove teamId
        await updateDoc(doc(db, 'profiles', profileDoc.id), {
          teamId: null,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`   ✅ Removed from team assignment`);
        updatedCount++;
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} Senior Management users`);
    console.log('📋 Senior Management users are now properly separated from teams');
    
  } catch (error) {
    console.error('❌ Error fixing Senior Management teams:', error);
  }
}

// Run the script
fixSeniorManagementTeams();

