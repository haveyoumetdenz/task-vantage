// Script to add teams to Firebase
// Copy and paste this into your browser console

console.log('🚀 Starting team creation...');

const userId = window.auth?.currentUser?.uid;
if (!userId) {
  console.error('❌ No user logged in. Please log in first.');
} else {
  console.log('✅ User ID found:', userId);

  const addTeams = async () => {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('./src/integrations/firebase/client.js');

      // Define the teams with the structure you want
      const teamsToAdd = [
        {
          id: 'engineering-1',
          name: 'Engineering 1',
          description: 'Main engineering team',
          parentTeamId: null, // Top-level team
          managerId: userId, // You as the manager
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'engineering-2',
          name: 'Engineering 2',
          description: 'Sub-engineering team under Engineering 1',
          parentTeamId: 'engineering-1', // Under Engineering 1
          managerId: userId, // You as the manager
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'hr',
          name: 'HR',
          description: 'Human Resources team',
          parentTeamId: null, // Top-level team
          managerId: userId, // You as the manager
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      console.log('📝 Adding teams to Firebase...');

      for (const team of teamsToAdd) {
        const teamRef = doc(db, 'teams', team.id);
        await setDoc(teamRef, team, { merge: true }); // Use merge to update if exists, create if not
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
      console.log('💡 Make sure you are logged in and the app is running.');
    }
  };

  // Run the update
  addTeams();
}

