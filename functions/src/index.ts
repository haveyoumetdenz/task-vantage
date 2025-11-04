import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin SDK
initializeApp()

// Cloud Function to disable user account (deactivation)
export const disableUserAccount = onCall(async (request) => {
  try {
    // Check if user is authenticated
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated')
    }

    const { userId, reason, disabledBy } = request.data

    if (!userId) {
      throw new HttpsError('invalid-argument', 'User ID is required')
    }

    // Check if the requesting user has permission to disable accounts
    const callerProfile = await getFirestore()
      .collection('profiles')
      .doc(request.auth.uid)
      .get()

    if (!callerProfile.exists) {
      throw new HttpsError('permission-denied', 'Caller profile not found')
    }

    const callerData = callerProfile.data()
    const isHR = callerData?.role === 'HR' || 
                 (callerData?.role === 'Manager' && callerData?.teamId === 'hr')
    const isSeniorManagement = callerData?.role === 'Senior Management'

    if (!isHR && !isSeniorManagement) {
      throw new HttpsError('permission-denied', 'Only HR and Senior Management can disable accounts')
    }

    console.log('🔒 Disabling user account:', userId, 'by:', request.auth.uid)

    // Disable the Firebase Auth account
    await getAuth().updateUser(userId, {
      disabled: true
    })
    console.log('✅ Firebase Auth account disabled')

    return {
      success: true,
      message: 'User account disabled successfully',
      disabledBy: request.auth.uid,
      reason: reason || 'Account disabled by administrator'
    }

  } catch (error) {
    console.error('❌ Error disabling user account:', error)
    throw new HttpsError('internal', `Failed to disable user account: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
})

// Cloud Function to reactivate user account
export const reactivateUserAccount = onCall(async (request) => {
  try {
    // Check if user is authenticated
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated')
    }

    const { userId, reason, reactivatedBy } = request.data

    if (!userId) {
      throw new HttpsError('invalid-argument', 'User ID is required')
    }

    // Check if the requesting user has permission to reactivate accounts
    const callerProfile = await getFirestore()
      .collection('profiles')
      .doc(request.auth.uid)
      .get()

    if (!callerProfile.exists) {
      throw new HttpsError('permission-denied', 'Caller profile not found')
    }

    const callerData = callerProfile.data()
    const isHR = callerData?.role === 'HR' || 
                 (callerData?.role === 'Manager' && callerData?.teamId === 'hr')
    const isSeniorManagement = callerData?.role === 'Senior Management'

    if (!isHR && !isSeniorManagement) {
      throw new HttpsError('permission-denied', 'Only HR and Senior Management can reactivate accounts')
    }

    console.log('🔄 Reactivating user account:', userId, 'by:', request.auth.uid)

    // Re-enable the Firebase Auth account
    await getAuth().updateUser(userId, {
      disabled: false
    })
    console.log('✅ Firebase Auth account reactivated')

    return {
      success: true,
      message: 'User account reactivated successfully',
      reactivatedBy: request.auth.uid,
      reason: reason || 'Account reactivated by administrator'
    }

  } catch (error) {
    console.error('❌ Error reactivating user account:', error)
    throw new HttpsError('internal', `Failed to reactivate user account: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
})

// Cloud Function to delete user account completely
export const deleteUserAccount = onCall(async (request) => {
  try {
    // Check if user is authenticated
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated')
    }

    const { userId, reason, deletedBy } = request.data

    if (!userId) {
      throw new HttpsError('invalid-argument', 'User ID is required')
    }

    // Check if the requesting user has permission to delete accounts
    // This should be HR or Senior Management only
    const callerProfile = await getFirestore()
      .collection('profiles')
      .doc(request.auth.uid)
      .get()

    if (!callerProfile.exists) {
      throw new HttpsError('permission-denied', 'Caller profile not found')
    }

    const callerData = callerProfile.data()
    const isHR = callerData?.role === 'HR' || 
                 (callerData?.role === 'Manager' && callerData?.teamId === 'hr')
    const isSeniorManagement = callerData?.role === 'Senior Management'

    if (!isHR && !isSeniorManagement) {
      throw new HttpsError('permission-denied', 'Only HR and Senior Management can delete accounts')
    }

    console.log('🗑️ Deleting user account:', userId, 'by:', request.auth.uid)

    // Delete from Firestore first
    await getFirestore().collection('profiles').doc(userId).delete()
    console.log('✅ Firestore profile deleted')

    // Delete from Firebase Auth
    await getAuth().deleteUser(userId)
    console.log('✅ Firebase Auth account deleted')

    return {
      success: true,
      message: 'User account deleted successfully',
      deletedBy: request.auth.uid,
      reason: reason || 'Account deleted by administrator'
    }

  } catch (error) {
    console.error('❌ Error deleting user account:', error)
    throw new HttpsError('internal', `Failed to delete user account: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
})
