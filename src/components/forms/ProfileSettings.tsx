import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Calendar, Shield, Phone, MapPin, Briefcase } from 'lucide-react'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { useFirebaseProfile } from '@/hooks/useFirebaseProfile'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/integrations/firebase/client'
import { toast } from 'sonner'

interface ProfileFormData {
  fullName: string
  displayName: string
  bio: string
  phone: string
  location: string
  jobTitle: string
  department: string
}

export const ProfileSettings = () => {
  const { user } = useAuth()
  const { profile, loading: profileLoading } = useFirebaseProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    displayName: '',
    bio: '',
    phone: '',
    location: '',
    jobTitle: '',
    department: ''
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        location: profile.location || '',
        jobTitle: profile.jobTitle || '',
        department: profile.department || ''
      })
    }
  }, [profile])

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!user || !profile) return

    setIsSaving(true)
    try {
      const profileRef = doc(db, 'profiles', profile.userId)
      await updateDoc(profileRef, {
        ...formData,
        updatedAt: new Date().toISOString()
      })
      
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        location: profile.location || '',
        jobTitle: profile.jobTitle || '',
        department: profile.department || ''
      })
    }
    setIsEditing(false)
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-bold">Profile Settings</h2>
          <p className="text-muted-foreground">
            Manage your profile information and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSaving}
                size="sm"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} size="sm">
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Picture Section */}
      <Card className="border-2 border-border shadow-sm">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Picture
          </CardTitle>
          <CardDescription>
            Your profile picture appears across the application
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatarUrl} />
              <AvatarFallback className="text-lg">
                {profile?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Avatar</p>
              <p className="text-sm text-muted-foreground">
                Avatar upload coming soon...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="border-2 border-border shadow-sm">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Your basic profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              {isEditing ? (
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm px-3 py-2 bg-muted rounded-md">
                  <User className="h-4 w-4" />
                  {formData.fullName || 'No name set'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              {isEditing ? (
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="How you'd like to be called"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm px-3 py-2 bg-muted rounded-md">
                  <User className="h-4 w-4" />
                  {formData.displayName || 'No display name set'}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            {isEditing ? (
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            ) : (
              <div className="text-sm px-3 py-2 bg-muted rounded-md min-h-[60px]">
                {formData.bio || 'No bio provided'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="border-2 border-border shadow-sm">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
          <CardDescription>
            Your contact details and communication preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex items-center gap-2 text-sm px-3 py-2 bg-muted rounded-md">
              <Mail className="h-4 w-4" />
              {user?.email}
              <Badge variant="outline" className="ml-auto">
                {user?.emailVerified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            {isEditing ? (
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                type="tel"
              />
            ) : (
              <div className="flex items-center gap-2 text-sm px-3 py-2 bg-muted rounded-md">
                <Phone className="h-4 w-4" />
                {formData.phone || 'No phone number set'}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            {isEditing ? (
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
              />
            ) : (
              <div className="flex items-center gap-2 text-sm px-3 py-2 bg-muted rounded-md">
                <MapPin className="h-4 w-4" />
                {formData.location || 'No location set'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card className="border-2 border-border shadow-sm">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Professional Information
          </CardTitle>
          <CardDescription>
            Your work and professional details
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              {isEditing ? (
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  placeholder="Your job title"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm px-3 py-2 bg-muted rounded-md">
                  <Briefcase className="h-4 w-4" />
                  {formData.jobTitle || 'No job title set'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              {isEditing ? (
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="Your department"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm px-3 py-2 bg-muted rounded-md">
                  <Briefcase className="h-4 w-4" />
                  {formData.department || 'No department set'}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="border-2 border-border shadow-sm">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your account status and security information
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Member Since</Label>
              <div className="flex items-center gap-2 text-sm px-3 py-2 bg-muted rounded-md">
                <Calendar className="h-4 w-4" />
                {user?.metadata?.creationTime ? 
                  new Date(user.metadata.creationTime).toLocaleDateString() : 
                  'Unknown'
                }
              </div>
            </div>

            <div className="space-y-2">
              <Label>Account Status</Label>
              <div className="flex items-center gap-2 text-sm px-3 py-2 bg-muted rounded-md">
                <Shield className="h-4 w-4" />
                <span>Active</span>
                <Badge variant="default" className="ml-auto">
                  Verified
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
