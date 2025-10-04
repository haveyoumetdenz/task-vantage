// Direct teams creation script
// Run this in browser console after the app loads

console.log('🚀 Creating teams directly...');

// Wait for Firebase to be available
const waitForFirebase = () => {
  return new Promise((resolve) => {
    const checkFirebase = () => {
      if (window.db && window.auth) {
        resolve();
      } else {
        setTimeout(checkFirebase, 100);
      }
    };
    checkFirebase();
  });
};

const createTeams = async () => {
  await waitForFirebase();
  
  const userId = window.auth?.currentUser?.uid;
  if (!userId) {
    console.error('❌ No user logged in. Please log in first.');
    return;
  }

  try {
    const { doc, setDoc } = await import('firebase/firestore');
    const db = window.db;

    const teamsToCreate = [
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

    console.log('📝 Creating teams...');

    for (const team of teamsToCreate) {
      const teamRef = doc(db, 'teams', team.id);
      await setDoc(teamRef, team, { merge: true });
      console.log(`✅ Team '${team.name}' created/updated`);
    }

    console.log('🎉 All teams created successfully!');
    console.log('📊 Team structure:');
    console.log('  - Engineering 1 (top-level)');
    console.log('    └── Engineering 2 (under Engineering 1)');
    console.log('  - HR (top-level)');
    console.log('🔄 Refresh the signup page to see the teams in the dropdown');

  } catch (error) {
    console.error('❌ Error creating teams:', error);
  }
};

createTeams();
