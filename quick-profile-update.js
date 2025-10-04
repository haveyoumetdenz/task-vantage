// Quick Profile Update Script
// Copy and paste this into your browser console

console.log('🚀 Starting profile update...');

// Check if user is logged in
const userId = window.auth?.currentUser?.uid;
if (!userId) {
  console.error('❌ No user logged in. Please log in first.');
} else {
  console.log('✅ User ID found:', userId);
  
  // Update profile function
  const updateProfile = async () => {
    try {
      // Import Firebase functions
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('./src/integrations/firebase/client.js');
      
      console.log('📝 Creating profile document...');
      
      const profileRef = doc(db, 'profiles', userId);
      const profileData = {
        userId: userId,
        email: 'denzel.toh.2022@scis.smu.edu.sg',
        fullName: 'Denzel Toh',
        role: 'Senior Management',
        teamId: 'engineering-1',
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(profileRef, profileData);
      
      console.log('✅ Profile updated successfully!');
      console.log('📊 Profile data:', profileData);
      console.log('🎉 You should now see the Team link in the sidebar!');
      console.log('🔄 Please refresh the page to see the changes.');
      
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      console.log('💡 Make sure you are logged in and the app is running.');
    }
  };

  // Run the update
  updateProfile();
}

