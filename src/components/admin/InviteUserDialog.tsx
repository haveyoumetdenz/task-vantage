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
import { db, auth, functions } from '@/integrations/firebase/client'
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { Eye, EyeOff } from 'lucide-react'

const inviteUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.enum(['Staff', 'Manager', 'Director', 'Senior Management']),
  teamId: z.string().min(1, 'Please select a team'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
      password: '',
      confirmPassword: '',
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
      setResult({ success: false, message: 'You must be logged in to create user accounts' })
      return
    }

    setIsSubmitting(true)
    setResult(null)

    try {
      // Call Cloud Function to create user with password
      const createUserWithPassword = httpsCallable(functions, 'createUserWithPassword')
      
      const result = await createUserWithPassword({
        email: data.email.toLowerCase(),
        password: data.password,
        fullName: data.fullName,
        role: data.role,
        teamId: data.teamId,
      })

      const response = result.data as { success: boolean; message: string; userId?: string; isNewUser?: boolean }

      if (response.success) {
        setResult({
          success: true,
          message: response.message || `User account ${response.isNewUser ? 'created' : 'updated'} successfully! The user can now log in with the password you set.`,
        })

        toast({
          title: 'Success',
          description: response.message || `User account ${response.isNewUser ? 'created' : 'updated'} successfully!`,
        })

        form.reset()
        onOpenChange(false)
      } else {
        setResult({
          success: false,
          message: response.message || 'Failed to create user account. Please try again.',
        })
      }

    } catch (error: any) {
      console.error('Error creating user account:', error)
      
      let errorMessage = 'Failed to create user account. Please try again.'
      
      if (error.code === 'functions/already-exists') {
        errorMessage = 'A user with this email already exists. The account has been updated with the new password and profile information.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setResult({
        success: false,
        message: errorMessage,
      })

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
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
            Create New User Account
          </DialogTitle>
          <DialogDescription>
            Create a new user account with email, password, role, and team. The user can log in immediately with the password you set.
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password (min 6 characters)"
                        {...field}
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm password"
                        {...field}
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
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

