import React from 'react'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { useFirebaseProfile } from '@/hooks/useFirebaseProfile'
import { useFirebaseRBAC } from '@/hooks/useFirebaseRBAC'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/integrations/firebase/client'

export default function ProfileDebug() {
  const { user } = useAuth()
  const { profile, loading: profileLoading } = useFirebaseProfile()
  const { canManageUsers, canViewTeamWork } = useFirebaseRBAC()

  const updateProfile = async () => {
    if (!user) return

    try {
      const profileRef = doc(db, 'profiles', user.uid)
      const profileData = {
        userId: user.uid,
        email: 'denzel.toh.2022@scis.smu.edu.sg',
        fullName: 'Denzel Toh',
        role: 'Senior Management',
        teamId: 'engineering-1',
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await setDoc(profileRef, profileData)
      console.log('✅ Profile updated successfully!')
      alert('Profile updated! Please refresh the page.')
    } catch (error) {
      console.error('❌ Error updating profile:', error)
      alert('Error updating profile: ' + error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Profile Debug</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>User ID:</strong> {user?.uid || 'Not logged in'}</p>
          <p><strong>Email:</strong> {user?.email || 'No email'}</p>
          <p><strong>Display Name:</strong> {user?.displayName || 'No display name'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Loading:</strong> {profileLoading ? 'Yes' : 'No'}</p>
          <p><strong>Profile:</strong> {profile ? 'Exists' : 'Not found'}</p>
          {profile && (
            <>
              <p><strong>Role:</strong> {profile.role}</p>
              <p><strong>Team ID:</strong> {profile.teamId || 'None'}</p>
              <p><strong>Status:</strong> {profile.status}</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Can Manage Users:</strong> {canManageUsers ? 'Yes' : 'No'}</p>
          <p><strong>Can View Team Work:</strong> {canViewTeamWork ? 'Yes' : 'No'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={updateProfile} className="w-full">
            Update Profile to Senior Management
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            This will create/update your profile with Senior Management role
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

