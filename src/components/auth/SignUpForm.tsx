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
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react'

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  teamId: z.string().min(1, 'Please select a team'),
  role: z.string().min(1, 'Please select a role'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignUpFormData = z.infer<typeof signUpSchema>

export const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailExists, setEmailExists] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { teams, loading: teamsLoading } = useFirebaseTeams()
  
  // Debug teams loading
  useEffect(() => {
    console.log('Teams loading state:', { teams, teamsLoading, teamsCount: teams.length })
  }, [teams, teamsLoading])
  const { signUp } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

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

  // Check if email exists in both Firestore and Firebase Auth
  const checkEmailExists = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailExists(null)
      return
    }

    setIsCheckingEmail(true)
    try {
      // Check both Firestore profiles and Firebase Authentication
      const [profilesQuery, authMethods] = await Promise.all([
        getDocs(query(collection(db, 'profiles'), where('email', '==', email))),
        fetchSignInMethodsForEmail(auth, email)
      ])
      
      const existsInProfiles = !profilesQuery.empty
      const existsInAuth = authMethods.length > 0
      
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

    // Check if email already exists before proceeding
    if (emailExists) {
      setError('An account with this email already exists. Please use a different email or sign in.')
      setIsLoading(false)
      return
    }

    // Check if teams are available
    if (teams.length === 0) {
      setError('No teams are available. Please contact your administrator to set up teams.')
      setIsLoading(false)
      return
    }

    try {
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
          setError('This email is already registered. Please use a different email or try signing in.')
        } else if (error.code === 'auth/weak-password') {
          setError('Password is too weak. Please choose a stronger password.')
        } else if (error.code === 'auth/invalid-email') {
          setError('Please enter a valid email address.')
        } else {
          setError(error.message || 'An error occurred during sign up.')
        }
      } else {
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
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
                          disabled={isLoading}
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
                    {emailExists === true && (
                      <p className="text-sm text-destructive">
                        An account with this email already exists
                      </p>
                    )}
                    {emailExists === false && (
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || teamsLoading}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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
        </CardContent>
      </Card>
    </div>
  )
}