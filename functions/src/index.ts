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

    const db = getFirestore()
    let tasksDeleted = 0
    let tasksUnassigned = 0
    let projectsUnassigned = 0

    // 1. Handle tasks assigned to this user
    try {
      // Find all tasks where user is assigned
      const tasksQuery = await db.collection('tasks')
        .where('assigneeIds', 'array-contains', userId)
        .get()
      
      console.log(`📋 Found ${tasksQuery.size} tasks assigned to user ${userId}`)
      
      // Process each task
      const batch = db.batch()
      for (const taskDoc of tasksQuery.docs) {
        const taskData = taskDoc.data()
        const assigneeIds = taskData.assigneeIds || []
        
        // If task is only assigned to this user, delete it
        if (assigneeIds.length === 1 && assigneeIds[0] === userId) {
          batch.delete(taskDoc.ref)
          tasksDeleted++
          console.log(`🗑️ Deleting task ${taskDoc.id} (only assigned to deleted user)`)
        } else {
          // Remove user from assigneeIds
          const updatedAssigneeIds = assigneeIds.filter((id: string) => id !== userId)
          batch.update(taskDoc.ref, {
            assigneeIds: updatedAssigneeIds,
            updatedAt: new Date().toISOString()
          })
          tasksUnassigned++
          console.log(`👤 Unassigning user from task ${taskDoc.id}`)
        }
      }
      
      // Commit batch update
      if (tasksQuery.size > 0) {
        await batch.commit()
        console.log(`✅ Task cleanup completed: ${tasksDeleted} deleted, ${tasksUnassigned} unassigned`)
      }
    } catch (taskError: any) {
      console.error('❌ Error handling tasks:', taskError)
      // Continue with deletion even if task cleanup fails
    }

    // 2. Handle projects assigned to this user
    try {
      // Find all projects where user is assigned
      const projectsQuery = await db.collection('projects')
        .where('assigneeIds', 'array-contains', userId)
        .get()
      
      console.log(`📋 Found ${projectsQuery.size} projects assigned to user ${userId}`)
      
      // Process each project
      const batch = db.batch()
      for (const projectDoc of projectsQuery.docs) {
        const projectData = projectDoc.data()
        const assigneeIds = projectData.assigneeIds || []
        
        // Remove user from assigneeIds (don't delete projects - they may have other members)
        const updatedAssigneeIds = assigneeIds.filter((id: string) => id !== userId)
        if (updatedAssigneeIds.length !== assigneeIds.length) {
          batch.update(projectDoc.ref, {
            assigneeIds: updatedAssigneeIds,
            updatedAt: new Date().toISOString()
          })
          projectsUnassigned++
          console.log(`👤 Unassigning user from project ${projectDoc.id}`)
        }
      }
      
      // Commit batch update
      if (projectsQuery.size > 0) {
        await batch.commit()
        console.log(`✅ Project cleanup completed: ${projectsUnassigned} unassigned`)
      }
    } catch (projectError: any) {
      console.error('❌ Error handling projects:', projectError)
      // Continue with deletion even if project cleanup fails
    }

    // 3. Delete profile from Firestore
    await db.collection('profiles').doc(userId).delete()
    console.log('✅ Firestore profile deleted')

    // 4. Delete from Firebase Auth
    await getAuth().deleteUser(userId)
    console.log('✅ Firebase Auth account deleted')

    return {
      success: true,
      message: `User account deleted successfully. ${tasksDeleted} task(s) deleted, ${tasksUnassigned} task(s) unassigned, ${projectsUnassigned} project(s) unassigned.`,
      deletedBy: request.auth.uid,
      reason: reason || 'Account deleted by administrator',
      tasksDeleted,
      tasksUnassigned,
      projectsUnassigned
    }

  } catch (error) {
    console.error('❌ Error deleting user account:', error)
    throw new HttpsError('internal', `Failed to delete user account: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
})

