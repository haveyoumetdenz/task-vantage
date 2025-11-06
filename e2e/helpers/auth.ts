/**
 * Helper functions for E2E test authentication
 * 
 * Creates test users in Firebase Auth Emulator before tests run
 * Also creates user profiles in Firestore Emulator
 */

const AUTH_EMULATOR_HOST = '127.0.0.1:9099'
const AUTH_EMULATOR_URL = `http://${AUTH_EMULATOR_HOST}`
const FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
const FIRESTORE_EMULATOR_URL = `http://${FIRESTORE_EMULATOR_HOST}`
const PROJECT_ID = 'task-vantage-test'

/**
 * Create a user profile in Firestore Emulator
 * Uses Firestore REST API with proper timestamp format
 */
async function createUserProfile(userId: string, email: string, fullName: string, role: string = 'Staff'): Promise<void> {
  try {
    const now = new Date().toISOString()
    const firstName = fullName.split(' ')[0] || fullName
    const lastName = fullName.split(' ').slice(1).join(' ') || ''

    // Create profile in Firestore Emulator via REST API
    // Note: The app will also create the profile automatically when user logs in via useFirebaseProfile hook
    // This is just to ensure it exists before login
    const response = await fetch(`${FIRESTORE_EMULATOR_URL}/v1/projects/${PROJECT_ID}/databases/(default)/documents/profiles/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          userId: { stringValue: userId },
          email: { stringValue: email },
          fullName: { stringValue: fullName },
          firstName: { stringValue: firstName },
          lastName: { stringValue: lastName },
          role: { stringValue: role },
          status: { stringValue: 'active' },
          mfaEnabled: { booleanValue: false },
          createdAt: { timestampValue: now },
          updatedAt: { timestampValue: now }
        }
      }),
    })

    if (response.ok) {
      console.log(`✅ User profile created in Firestore: ${email}`)
    } else {
      const errorText = await response.text()
      // Profile might already exist, that's fine
      console.log(`ℹ️  User profile might already exist or couldn't be created: ${email}`, errorText)
      // The app will create it automatically when user logs in
    }
  } catch (error) {
    // Firestore Emulator might not be available, that's okay
    // The app will create the profile automatically when user logs in via useFirebaseProfile hook
    console.warn(`⚠️  Could not create user profile in Firestore (will be created on login):`, error)
  }
}

/**
 * Create a test user in Firebase Auth Emulator
 * Also creates user profile in Firestore Emulator
 * Returns the user's ID token if successful
 */
export async function createTestUser(email: string, password: string, fullName?: string, role: string = 'Staff'): Promise<string | null> {
  try {
    const response = await fetch(`${AUTH_EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=test-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      const userId = data.localId || data.uid
      const displayName = fullName || email.split('@')[0]
      
      console.log(`✅ Test user created in Auth: ${email}`)
      
      // Create user profile in Firestore
      if (userId) {
        await createUserProfile(userId, email, displayName, role)
      }
      
      return data.idToken || null
    } else {
      const errorData = await response.json()
      // If user already exists, try to sign in instead
      if (errorData.error?.message?.includes('EMAIL_EXISTS')) {
        console.log(`ℹ️  Test user already exists: ${email}, signing in...`)
        return await signInTestUser(email, password)
      } else {
        console.warn(`⚠️  Could not create test user ${email}:`, errorData)
        return null
      }
    }
  } catch (error) {
    console.warn(`⚠️  Auth Emulator not available or error creating user ${email}:`, error)
    return null
  }
}

/**
 * Sign in an existing test user in Firebase Auth Emulator
 */
export async function signInTestUser(email: string, password: string): Promise<string | null> {
  try {
    const response = await fetch(`${AUTH_EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=test-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return data.idToken || null
    } else {
      console.warn(`⚠️  Could not sign in test user ${email}`)
      return null
    }
  } catch (error) {
    console.warn(`⚠️  Error signing in test user ${email}:`, error)
    return null
  }
}

/**
 * Ensure a test user exists in Auth Emulator
 * Creates the user if they don't exist, or signs them in if they do
 * Also ensures user profile exists in Firestore
 */
export async function ensureTestUser(email: string, password: string, fullName?: string, role: string = 'Staff'): Promise<boolean> {
  try {
    const token = await createTestUser(email, password, fullName, role)
    return token !== null
  } catch (error) {
    console.warn(`⚠️  Error ensuring test user ${email}:`, error)
    return false
  }
}

/**
 * Test user credentials for E2E tests
 */
export const TEST_USERS = {
  test: {
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User',
    role: 'Staff' as const,
  },
  real: {
    email: 'denzel.toh.2022@scis.smu.edu.sg',
    password: 'password',
    fullName: 'Denzel Toh',
    role: 'Staff' as const,
  },
  staff: {
    email: 'denzel.toh@hotmail.com',
    password: 'password',
    fullName: 'Denzel Toh Staff',
    role: 'Staff' as const,
  },
}

