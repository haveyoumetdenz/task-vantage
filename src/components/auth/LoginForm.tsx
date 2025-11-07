import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { toast } from 'sonner'
import { MFALoginDialog } from './MFALoginDialog'

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type AuthFormData = z.infer<typeof authSchema>

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMFALoading, setIsMFALoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mfaError, setMfaError] = useState<string | null>(null)
  const [showMFA, setShowMFA] = useState(false)
  const [mfaSession, setMfaSession] = useState<any>(null)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true)
    setError(null)
    setMfaError(null)

    const { error } = await signIn(data.email, data.password)

    if (error) {
      // Check for Firebase error codes
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setError('Incorrect credentials')
      } else if (error.message?.includes('MFA challenge required')) {
        // Check if user has MFA enabled
        try {
          const { data: mfaData } = await supabase.auth.mfa.listFactors()
          if (mfaData?.totp && mfaData.totp.length > 0) {
            const factor = mfaData.totp[0]
            const { data: challengeData } = await supabase.auth.mfa.challenge({
              factorId: factor.id,
            })
            if (challengeData) {
              setMfaSession({ factorId: factor.id, challengeId: challengeData.id })
              setShowMFA(true)
            }
          }
        } catch (mfaError) {
          console.error('MFA error:', mfaError)
          setError('MFA verification failed. Please try again.')
        }
      } else if (error.message?.includes('Invalid login credentials')) {
        setError('Incorrect credentials')
      } else {
        setError(error.message || 'An error occurred during sign in.')
      }
    } else {
      navigate('/')
    }

    setIsLoading(false)
  }

  const handleMFAVerify = async (code: string) => {
    if (!mfaSession) return

    setIsMFALoading(true)
    setMfaError(null)

    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId: mfaSession.factorId,
        challengeId: mfaSession.challengeId,
        code,
      })

      if (error) {
        setMfaError('Invalid code. Please check your authenticator app and try again.')
      } else {
        setShowMFA(false)
        navigate('/')
      }
    } catch (error) {
      setMfaError('MFA verification failed. Please try again.')
    } finally {
      setIsMFALoading(false)
    }
  }


  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Simple navigation header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">TaskManager</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-2">
              {/* Signup link removed - users must be invited */}
            </nav>
          </div>
        </div>
      </header>
      
      {/* Login form */}
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign In
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
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

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>

              <div className="text-center space-y-2">
                <Link
                  to="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot your password?
                </Link>
                {/* Signup link removed - users must be invited */}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      </div>

      <MFALoginDialog
        open={showMFA}
        onVerify={handleMFAVerify}
        isLoading={isMFALoading}
        error={mfaError}
      />
    </div>
  )
}