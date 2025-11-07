/**
 * Script to permanently set a user to Senior Management role
 * This ensures the role persists even if updated through other means
 * 
 * Usage: node scripts/set-user-to-senior-management.js <email>
 * Example: node scripts/set-user-to-senior-management.js denzel.toh.2022@scis.smu.edu.sg
 */

const admin = require('firebase-admin')
const path = require('path')

// Initialize Firebase Admin SDK
try {
  // Try to use service account if available
  const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'))
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
} catch (error) {
  // If no service account, use default credentials (for emulator or GCP)
  try {
    admin.initializeApp()
  } catch (initError) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', initError.message)
    console.error('Please ensure you have either:')
    console.error('1. A serviceAccountKey.json file in the project root, or')
    console.error('2. Firebase Admin SDK credentials configured (for GCP)')
    process.exit(1)
  }
}

const db = admin.firestore()
const auth = admin.auth()

async function setUserToSeniorManagement(email) {
  try {
    console.log('🔧 Setting user to Senior Management:', email)
    
    // 1. Find user in Firestore profiles
    const profilesRef = db.collection('profiles')
    const emailQuery = await profilesRef.where('email', '==', email.toLowerCase()).get()
    
    if (emailQuery.empty) {
      console.error('❌ User not found in Firestore profiles:', email)
      return { success: false, message: 'User not found in Firestore profiles' }
    }
    
    const userDoc = emailQuery.docs[0]
    const userId = userDoc.id
    const userData = userDoc.data()
    
    console.log('🔍 Found user:', {
      userId,
      email: userData.email,
      currentRole: userData.role,
      currentTeamId: userData.teamId
    })
    
    // 2. Ensure Senior Management team exists
    const teamId = 'senior-management'
    const teamRef = db.collection('teams').doc(teamId)
    const teamDoc = await teamRef.get()
    
    if (!teamDoc.exists()) {
      console.log('📋 Creating Senior Management team...')
      await teamRef.set({
        id: teamId,
        name: 'Senior Management',
        description: 'Senior Management team - oversees all teams',
        parentTeamId: null,
        managerId: userId,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      console.log('✅ Senior Management team created')
    } else {
      console.log('ℹ️ Senior Management team already exists')
    }
    
    // 3. Update user profile with Senior Management role and team
    const userRef = db.collection('profiles').doc(userId)
    await userRef.update({
      role: 'Senior Management',
      teamId: teamId, // Always set to senior-management team
      updatedAt: new Date().toISOString(),
      // Add a flag to prevent accidental overwrites
      _seniorManagementSet: true,
      _seniorManagementSetAt: new Date().toISOString(),
    })
    
    console.log('✅ User profile updated to Senior Management')
    
    // 4. Verify the update
    const updatedDoc = await userRef.get()
    const updatedData = updatedDoc.data()
    
    console.log('✅ Verification:', {
      userId,
      email: updatedData.email,
      role: updatedData.role,
      teamId: updatedData.teamId,
      _seniorManagementSet: updatedData._seniorManagementSet
    })
    
    return {
      success: true,
      message: `User ${email} successfully set to Senior Management`,
      userId,
      teamId
    }
    
  } catch (error) {
    console.error('❌ Error setting user to Senior Management:', error)
    return {
      success: false,
      message: `Failed to set user: ${error.message || 'Unknown error'}`
    }
  }
}

// Main execution
const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.error('Usage: node scripts/set-user-to-senior-management.js <email>')
  console.error('Example: node scripts/set-user-to-senior-management.js denzel.toh.2022@scis.smu.edu.sg')
  process.exit(1)
}

setUserToSeniorManagement(email)
  .then((result) => {
    if (result.success) {
      console.log('✅', result.message)
      process.exit(0)
    } else {
      console.error('❌', result.message)
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })

