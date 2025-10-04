// Run this in the browser console to update your profile
// Make sure you're logged in first

// Get the current user ID
const userId = window.auth?.currentUser?.uid;
if (!userId) {
  console.error('No user logged in. Please log in first.');
} else {
  console.log('Current user ID:', userId);
  
  // Update your profile to Senior Management
  const updateProfile = async () => {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('./src/integrations/firebase/client.js');
      
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
      console.log('Profile data:', profileData);
      console.log('You should now be able to access the team management page.');
    } catch (error) {
      console.error('❌ Error updating profile:', error);
    }
  };

  // Run the update
  updateProfile();
}

