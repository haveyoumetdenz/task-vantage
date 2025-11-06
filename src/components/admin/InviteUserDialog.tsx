import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { UserPlus, Loader2, CheckCircle, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useFirebaseTeams } from '@/hooks/useFirebaseTeams'
import { useFirebaseRBAC } from '@/hooks/useFirebaseRBAC'
import { db, auth } from '@/integrations/firebase/client'
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth'

const inviteUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.enum(['Staff', 'Manager', 'Director', 'Senior Management']),
  teamId: z.string().min(1, 'Please select a team'),
})

type InviteUserFormData = z.infer<typeof inviteUserSchema>

interface InviteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const InviteUserDialog = ({
  open,
  onOpenChange,
}: InviteUserDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; invitationLink?: string } | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailExists, setEmailExists] = useState<boolean | null>(null)
  const { teams, loading: teamsLoading } = useFirebaseTeams()
  const { profile } = useFirebaseRBAC()
  const { user } = useAuth()
  const { toast } = useToast()

  const form = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: '',
      fullName: '',
      role: 'Staff',
      teamId: '',
    },
  })

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      form.reset()
      setResult(null)
      setEmailExists(null)
    }
  }, [open, form])

  // Check if email exists as user types
  const checkEmailExists = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailExists(null)
      return
    }

    setIsCheckingEmail(true)
    try {
      // Check Firestore profiles
      const profilesRef = collection(db, 'profiles')
      const emailQuery = query(profilesRef, where('email', '==', email.toLowerCase()))
      const emailSnapshot = await getDocs(emailQuery)
      const existsInProfiles = !emailSnapshot.empty

      // Check Firebase Auth
      let existsInAuth = false
      try {
        const authMethods = await fetchSignInMethodsForEmail(auth, email.toLowerCase())
        existsInAuth = authMethods.length > 0
      } catch (authError: any) {
        // If auth check fails (e.g., 400 error), assume user doesn't exist in Auth
        console.log('Could not check Firebase Auth for email:', authError.message)
        existsInAuth = false
      }

      const exists = existsInProfiles || existsInAuth
      setEmailExists(exists)

      if (exists) {
        form.setError('email', {
          type: 'manual',
          message: 'A user with this email already exists. Please use a different email.',
        })
      } else {
        form.clearErrors('email')
      }
    } catch (error) {
      console.error('Error checking email:', error)
      setEmailExists(null)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  // Watch email field for changes
  const watchedEmail = form.watch('email')
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedEmail) {
        checkEmailExists(watchedEmail)
      } else {
        setEmailExists(null)
        form.clearErrors('email')
      }
    }, 500) // Debounce for 500ms

    return () => clearTimeout(timeoutId)
  }, [watchedEmail])

  const onSubmit = async (data: InviteUserFormData) => {
    if (!user || !profile?.userId) {
      setResult({ success: false, message: 'You must be logged in to invite users' })
      return
    }

    // Check if email exists before submitting
    if (emailExists === true) {
      setResult({
        success: false,
        message: 'A user with this email already exists. Please use a different email address.',
      })
      return
    }

    // Double-check if email exists (in case validation didn't run)
    setIsSubmitting(true)
    setResult(null)

    try {
      // Check if user already exists in profiles
      const profilesRef = collection(db, 'profiles')
      const emailQuery = query(profilesRef, where('email', '==', data.email.toLowerCase()))
      const emailSnapshot = await getDocs(emailQuery)
      const existsInProfiles = !emailSnapshot.empty

      // Check Firebase Auth
      let existsInAuth = false
      try {
        const authMethods = await fetchSignInMethodsForEmail(auth, data.email.toLowerCase())
        existsInAuth = authMethods.length > 0
      } catch (authError: any) {
        // If auth check fails, assume user doesn't exist in Auth
        console.log('Could not check Firebase Auth for email:', authError.message)
        existsInAuth = false
      }

      const userExists = existsInProfiles || existsInAuth

      // If user already exists, prevent invitation
      if (userExists) {
        setResult({
          success: false,
          message: 'A user with this email already exists. Please use a different email address.',
        })
        form.setError('email', {
          type: 'manual',
          message: 'A user with this email already exists.',
        })
        setIsSubmitting(false)
        return
      }

      // If user doesn't exist, create new invitation and send signup email
      // Mark any old pending invitations as expired (allow re-sending)
      const invitationsRef = collection(db, 'invitations')
      const invitationQuery = query(
        invitationsRef,
        where('email', '==', data.email.toLowerCase()),
        where('status', '==', 'pending')
      )
      const oldInvitations = await getDocs(invitationQuery)
      
      // Mark old pending invitations as expired (allow re-sending)
      const updatePromises = oldInvitations.docs.map(invDoc => 
        updateDoc(doc(db, 'invitations', invDoc.id), {
          status: 'expired',
          updatedAt: new Date().toISOString(),
        })
      )
      await Promise.all(updatePromises)

      // Generate new invitation token
      const invitationToken = crypto.randomUUID()
      const invitationId = crypto.randomUUID()

      // Create new invitation document
      const invitationData = {
        id: invitationId,
        email: data.email.toLowerCase(),
        fullName: data.fullName,
        role: data.role,
        teamId: data.teamId,
        invitedBy: profile.userId,
        invitedByName: profile.fullName || user.email || 'HR',
        invitationToken,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await addDoc(collection(db, 'invitations'), invitationData)

      const invitationLink = `${window.location.origin}/signup?invitation=${invitationToken}`

      // Send invitation email via Firebase Auth
      // Try to send password reset email - this will work if user exists in Firebase Auth
      try {
        await sendPasswordResetEmail(auth, data.email.toLowerCase(), {
          url: `${window.location.origin}/signup?invitation=${invitationToken}`,
          handleCodeInApp: false,
        })

        // Email sent successfully via Firebase Auth
        setResult({
          success: true,
          message: `Invitation email sent to ${data.email}! They will receive an email to set their password.`,
        })

        toast({
          title: 'Invitation Sent',
          description: `Invitation email sent to ${data.email}. They will receive an email to set their password.`,
        })

        form.reset()
        setIsSubmitting(false)
      } catch (authError: any) {
        // User doesn't exist in Firebase Auth yet - show invitation link for manual sending
        // This is expected for new users who haven't signed up yet
        console.log('User not in Firebase Auth yet, showing invitation link:', authError)
        
        setResult({
          success: true,
          message: `Invitation created for ${data.email}! Copy the link below and send it manually:`,
          invitationLink,
        })

        toast({
          title: 'Invitation Created',
          description: `Invitation created! Copy the link and send it to ${data.email} manually.`,
        })

        form.reset()
        setIsSubmitting(false)
      }

    } catch (error: any) {
      console.error('Error inviting user:', error)
      setResult({
        success: false,
        message: error.message || 'Failed to create invitation. Please try again.',
      })
      setIsSubmitting(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter teams based on role (if needed)
  const availableTeams = teams.filter(team => team.status === 'active')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite New User
          </DialogTitle>
          <DialogDescription>
            Create an invitation for a new user. They will receive an email with a signup link.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value.toLowerCase())
                          setEmailExists(null) // Reset email exists state when user types
                        }}
                        className={emailExists === true ? 'border-red-500 focus-visible:ring-red-500' : ''}
                      />
                      {isCheckingEmail && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  {emailExists === true && (
                    <p className="text-sm text-red-600 mt-1">
                      A user with this email already exists. Please use a different email address.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Staff">Staff</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Director">Director</SelectItem>
                      <SelectItem value="Senior Management">Senior Management</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={teamsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={teamsLoading ? 'Loading teams...' : 'Select team'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTeams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Result Alert */}
            {result && (
              <div className={`p-4 rounded-md border ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-2">
                    <span className={result.success ? 'text-green-800' : 'text-red-800'}>
                      {result.message}
                    </span>
                    {result.invitationLink && (
                      <div className="mt-3 p-4 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
                        <p className="text-sm font-semibold text-gray-700 mb-2">📧 Invitation Link:</p>
                        <div className="flex items-center gap-2">
                          <Input
                            value={result.invitationLink}
                            readOnly
                            className="text-xs font-mono bg-gray-50 border-gray-300"
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(result.invitationLink!)
                              toast({
                                title: '✅ Copied!',
                                description: 'Invitation link copied to clipboard',
                              })
                            }}
                            className="shrink-0"
                          >
                            📋 Copy Link
                          </Button>
                        </div>
                        <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs text-blue-800 font-medium mb-1">⚠️ Email Not Configured</p>
                          <p className="text-xs text-blue-700">
                            Copy the link above and send it manually to <strong>{form.getValues('email')}</strong> via email.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || teamsLoading || emailExists === true || isCheckingEmail}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Invitation...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite User
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

