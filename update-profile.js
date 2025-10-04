// Temporary script to update user profile
// Run this in the browser console to update your profile

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './src/integrations/firebase/client.js';

// Your user ID (you can get this from the browser console: window.auth.currentUser.uid)
const userId = 'w6QU63KzCccZNiXpdtGJtIdHtPz2'; // Replace with your actual user ID

const updateProfile = async () => {
  try {
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
    console.log('Profile updated successfully!');
    console.log('Profile data:', profileData);
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};

// Run the update
updateProfile();

