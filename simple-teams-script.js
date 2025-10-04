// Simple Teams Creation Script
// This uses the existing Firebase client that's already loaded in your app

console.log('🚀 Starting team creation...');

// Check if Firebase is available
if (typeof window !== 'undefined' && window.db) {
  console.log('✅ Firebase client found!');
  
  const addTeams = async () => {
    try {
      // Use the existing Firebase client
      const { doc, setDoc } = await import('firebase/firestore');
      const db = window.db; // Use the global db instance
      
      const userId = window.auth?.currentUser?.uid;
      if (!userId) {
        console.error('❌ No user logged in. Please log in first.');
        return;
      }

      console.log('📝 Adding teams to Firebase...');

      const teamsToAdd = [
        {
          id: 'engineering-1',
          name: 'Engineering 1',
          description: 'Main engineering team',
          parentTeamId: null,
          managerId: userId,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'engineering-2',
          name: 'Engineering 2',
          description: 'Sub-engineering team under Engineering 1',
          parentTeamId: 'engineering-1',
          managerId: userId,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'hr',
          name: 'HR',
          description: 'Human Resources team',
          parentTeamId: null,
          managerId: userId,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      for (const team of teamsToAdd) {
        const teamRef = doc(db, 'teams', team.id);
        await setDoc(teamRef, team, { merge: true });
        console.log(`✅ Team '${team.name}' added/updated successfully.`);
      }

      console.log('🎉 All teams processed successfully!');
      console.log('📊 Team structure created:');
      console.log('  - Engineering 1 (top-level)');
      console.log('    └── Engineering 2 (under Engineering 1)');
      console.log('  - HR (top-level)');
      console.log('🔄 Please refresh the Team Management page to see the updated structure.');

    } catch (error) {
      console.error('❌ Error adding teams:', error);
    }
  };

  addTeams();
} else {
  console.error('❌ Firebase client not found. Make sure you are on the app page and logged in.');
  console.log('💡 Try refreshing the page and running this script again.');
}

