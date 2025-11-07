import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { useFirebaseTeams } from '@/hooks/useFirebaseTeams'
import { useToast } from '@/hooks/use-toast'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/integrations/firebase/client'
import { fetchSignInMethodsForEmail } from 'firebase/auth'
import { auth } from '@/integrations/firebase/client'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { doc, updateDoc } from 'firebase/firestore'
import { passwordSchema } from '@/utils/passwordSchema'

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: passwordSchema,
  confirmPassword: z.string(),
  teamId: z.string().min(1, 'Please select a team'),
  role: z.string().min(1, 'Please select a role'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignUpFormData = z.infer<typeof signUpSchema>

export const SignUpForm = () => {
  const [searchParams] = useSearchParams()
  const invitationToken = searchParams.get('invitation')
  const navigate = useNavigate()
  
  const { toast } = useToast()
  
  // Redirect to login if no invitation token
  useEffect(() => {
    if (!invitationToken) {
      toast({
        title: "Signup requires invitation",
        description: "Please contact your administrator for an invitation link.",
        variant: "destructive",
      })
      navigate('/login')
    }
  }, [invitationToken, navigate, toast])
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailExists, setEmailExists] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(!!invitationToken)
  const [invitationData, setInvitationData] = useState<any>(null)
  const { teams, loading: teamsLoading } = useFirebaseTeams()
  
  // Debug teams loading
  useEffect(() => {
    console.log('Teams loading state:', { teams, teamsLoading, teamsCount: teams.length })
  }, [teams, teamsLoading])
  const { signUp } = useAuth()

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      teamId: '',
      role: '',
    },
  })

  // Load invitation data if token is present
  useEffect(() => {
    if (invitationToken) {
      loadInvitation(invitationToken)
    }
  }, [invitationToken])

  const loadInvitation = async (token: string) => {
    try {
      const invitationsRef = collection(db, 'invitations')
      const invitationQuery = query(invitationsRef, where('invitationToken', '==', token))
      const snapshot = await getDocs(invitationQuery)

      if (snapshot.empty) {
        setError('Invalid or expired invitation link. Please contact your administrator.')
        setIsLoadingInvitation(false)
        return
      }

      const invitation = snapshot.docs[0].data()
      
      // Check if invitation is expired
      if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
        setError('This invitation has expired. Please contact your administrator for a new invitation.')
        setIsLoadingInvitation(false)
        return
      }

      // Check if invitation is already used
      if (invitation.status === 'accepted') {
        setError('This invitation has already been used. Please sign in instead.')
        setIsLoadingInvitation(false)
        return
      }

      // Check if user already has a password set in Firebase Auth
      // If they do, they should sign in instead (skip activation/signup)
      try {
        const authMethods = await fetchSignInMethodsForEmail(auth, invitation.email?.toLowerCase() || '')
        if (authMethods.length > 0) {
          // User already has password set - redirect to login
          toast({
            title: 'Account Already Exists',
            description: 'You already have a password set. Please sign in instead.',
          })
          navigate('/login')
          return
        }
      } catch (authError: any) {
        // If check fails, continue with signup (user might not exist yet)
        console.log('Could not check if user exists in Auth:', authError.message)
      }

      // Pre-fill form with invitation data
      const fullName = invitation.fullName || ''
      const nameParts = fullName.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      form.setValue('email', invitation.email || '')
      form.setValue('firstName', firstName)
      form.setValue('lastName', lastName)
      form.setValue('role', invitation.role || 'Staff')
      form.setValue('teamId', invitation.teamId || '')

      // Disable email, role, and team fields since they're set by invitation
      setInvitationData(invitation)
      setIsLoadingInvitation(false)
    } catch (error: any) {
      console.error('Error loading invitation:', error)
      setError('Failed to load invitation. Please try again.')
      setIsLoadingInvitation(false)
    }
  }

  // Check if email exists in both Firestore and Firebase Auth
  const checkEmailExists = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailExists(null)
      return
    }

    setIsCheckingEmail(true)
    try {
      // Check Firestore profiles first
      const profilesQuery = await getDocs(query(collection(db, 'profiles'), where('email', '==', email)))
      const existsInProfiles = !profilesQuery.empty
      
      let existsInAuth = false
      try {
        // Try to check if email exists in Firebase Auth
        // This might fail with 400 if there are API issues, so handle gracefully
        const authMethods = await fetchSignInMethodsForEmail(auth, email)
        existsInAuth = authMethods.length > 0
      } catch (authError: any) {
        // If auth check fails (e.g., 400 error), don't fail the entire check
        // Just check profiles - if profile exists, assume email exists
        console.warn('Could not check Firebase Auth for email (may be API issue):', authError.message)
        // If profile exists, assume email exists in Auth too
        existsInAuth = existsInProfiles
      }
      
      // Email exists if it's in either Firestore or Firebase Auth
      const emailExists = existsInProfiles || existsInAuth
      setEmailExists(emailExists)
      
      console.log('Email check results:', {
        email,
        existsInProfiles,
        existsInAuth,
        emailExists
      })
    } catch (error) {
      console.error('Error checking email:', error)
      // Don't set emailExists to false on error - let user try
      setEmailExists(null)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  // Watch email field for changes
  const watchedEmail = form.watch('email')
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedEmail) {
        checkEmailExists(watchedEmail)
      }
    }, 500) // Debounce for 500ms

    return () => clearTimeout(timeoutId)
  }, [watchedEmail])

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    setError(null)

    // Check if teams are available
    if (teams.length === 0) {
      setError('No teams are available. Please contact your administrator to set up teams.')
      setIsLoading(false)
      return
    }

    try {
      // Check if user exists in Firebase Auth but not in profiles
      // This can happen if user was created via password reset email but hasn't completed signup
      let userExistsInAuth = false
      let userExistsInProfiles = false
      
      try {
        const [profilesQuery, authMethods] = await Promise.all([
          getDocs(query(collection(db, 'profiles'), where('email', '==', data.email.toLowerCase()))),
          fetchSignInMethodsForEmail(auth, data.email.toLowerCase())
        ])
        
        userExistsInProfiles = !profilesQuery.empty
        userExistsInAuth = authMethods.length > 0
      } catch (checkError) {
        console.error('Error checking email:', checkError)
      }

      // If user exists in Auth but not in profiles, they need to complete profile setup
      // But Firebase signup will fail with email-already-in-use, so we need to handle this differently
      if (userExistsInAuth && !userExistsInProfiles) {
        // User was created via password reset but hasn't completed profile
        // Try to sign in with password they just set, then create profile
        setError('This email is already registered in Firebase Auth. Please sign in with your password, or if you just set your password, try signing in instead.')
        setIsLoading(false)
        return
      }

      // If user exists in both Auth and profiles, redirect to login
      if (userExistsInAuth && userExistsInProfiles) {
        setError('This email is already registered. Please sign in instead.')
        setIsLoading(false)
        return
      }

      // If email exists check showed it exists, but not in Auth, double-check
      if (emailExists && !userExistsInAuth) {
        // Might be a stale check, try signup anyway
        console.log('Email exists check showed exists, but not in Auth - proceeding with signup')
      }

      const { error } = await signUp(
        data.email, 
        data.password, 
        data.firstName, 
        data.lastName, 
        data.teamId, 
        data.role
      )

      if (error) {
        // Handle specific Firebase Auth errors
        if (error.code === 'auth/email-already-in-use') {
          // User exists in Firebase Auth - suggest they sign in or reset password
          setError('This email is already registered. If you were invited, please sign in with your password. If you forgot your password, use the "Forgot Password" link.')
        } else if (error.code === 'auth/weak-password') {
          setError('Password is too weak. Please choose a stronger password.')
        } else if (error.code === 'auth/invalid-email') {
          setError('Please enter a valid email address.')
        } else {
          setError(error.message || 'An error occurred during sign up.')
        }
      } else {
        // Mark invitation as accepted if it exists
        if (invitationToken && invitationData) {
          try {
            const invitationsRef = collection(db, 'invitations')
            const invitationQuery = query(invitationsRef, where('invitationToken', '==', invitationToken))
            const snapshot = await getDocs(invitationQuery)
            
            if (!snapshot.empty) {
              const invitationDoc = snapshot.docs[0]
              await updateDoc(doc(db, 'invitations', invitationDoc.id), {
                status: 'accepted',
                acceptedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
            }
          } catch (inviteError) {
            console.error('Error updating invitation:', inviteError)
            // Don't fail the signup if invitation update fails
          }
        }

        toast({
          title: "Account Created",
          description: "Your account has been created successfully!",
        })
        navigate('/')
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign up.')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingInvitation ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading invitation...</span>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {invitationData && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-blue-800">
                      You've been invited by {invitationData.invitedByName || 'HR'}. 
                      Your email, role, and team have been pre-filled.
                    </AlertDescription>
                  </Alert>
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription className="flex flex-col gap-2">
                      <span>{error}</span>
                      {(error.includes('already registered') || error.includes('already in use')) && (
                        <div className="mt-2 flex flex-col gap-1">
                          <Link 
                            to="/login" 
                            className="text-sm underline hover:no-underline font-medium"
                          >
                            → Sign in instead
                          </Link>
                          <Link 
                            to="/forgot-password" 
                            className="text-sm underline hover:no-underline font-medium"
                          >
                            → Reset your password
                          </Link>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="First name"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Last name"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                          disabled={isLoading || !!invitationData}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {isCheckingEmail ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : emailExists === true ? (
                            <XCircle className="h-4 w-4 text-destructive" />
                          ) : emailExists === false ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : null}
                        </div>
                      </div>
                    </FormControl>
                    {invitationData && (
                      <p className="text-sm text-muted-foreground">
                        Email set by invitation
                      </p>
                    )}
                    {emailExists === true && !invitationData && (
                      <p className="text-sm text-destructive">
                        An account with this email already exists. Please sign in instead.
                      </p>
                    )}
                    {emailExists === true && invitationData && (
                      <p className="text-sm text-amber-600">
                        Email already registered. If you were invited, please sign in with your password.
                      </p>
                    )}
                    {emailExists === false && !invitationData && (
                      <p className="text-sm text-green-600">
                        Email is available
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          {...field}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
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
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          {...field}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
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

              <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || teamsLoading || !!invitationData}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={teamsLoading ? "Loading teams..." : "Select your team"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border z-50">
                        {teamsLoading ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Loading teams...
                          </div>
                        ) : teams.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No teams available. Please create teams first in Team Management.
                          </div>
                        ) : (
                          teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {invitationData && (
                      <p className="text-sm text-muted-foreground">
                        Team set by invitation
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || !!invitationData}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border z-50">
                        <SelectItem value="Staff">Staff</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Director">Director</SelectItem>
                        <SelectItem value="Senior Management">Senior Management</SelectItem>
                      </SelectContent>
                    </Select>
                    {invitationData && (
                      <p className="text-sm text-muted-foreground">
                        Role set by invitation
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || teamsLoading || teams.length === 0}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {teams.length === 0 ? 'No Teams Available' : 'Create Account'}
              </Button>

              <div className="text-center text-sm text-muted-foreground space-y-2">
                <div>
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </div>
                {teams.length === 0 && (
                  <div className="text-xs">
                    Need to create teams first?{' '}
                    <Link to="/team" className="text-primary hover:underline">
                      Go to Team Management
                    </Link>
                  </div>
                )}
              </div>
            </form>
          </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}