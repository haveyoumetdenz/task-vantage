import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { auth } from '@/integrations/firebase/client'
import { confirmPasswordReset } from 'firebase/auth'
import { passwordSchema } from '@/utils/passwordSchema'

const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export const ResetPasswordWithCodeForm = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { toast } = useToast()
  const oobCode = searchParams.get('oobCode')
  const mode = searchParams.get('mode')

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    // Check if we have the required parameters from Firebase
    if (!oobCode || mode !== 'resetPassword') {
      // If no parameters, redirect to forgot password page after showing message
      if (!oobCode && !mode) {
        // User accessed page directly without parameters
        setError('Please use the password reset link from your email. If you don\'t have one, please request a new password reset.')
        setTimeout(() => {
          navigate('/forgot-password')
        }, 3000)
      } else {
        // Invalid or expired link
        setError('Invalid or expired reset link. Please request a new password reset.')
      }
      setIsValidating(false)
    } else {
      setIsValidating(false)
    }
  }, [oobCode, mode, navigate])

  const onSubmit = async (formData: ResetPasswordFormData) => {
    if (!oobCode) {
      setError('Invalid reset code. Please request a new password reset.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Use Firebase's confirmPasswordReset
      await confirmPasswordReset(auth, oobCode, formData.password)

      toast({
        title: 'Password updated successfully!',
        description: 'You can now log in with your new password.',
      })
      navigate('/login')
    } catch (error: any) {
      console.error('Password reset error:', error)
      let errorMessage = 'Failed to reset password. Please try again.'
      
      if (error.code === 'auth/expired-action-code') {
        errorMessage = 'The reset link has expired. Please request a new password reset.'
      } else if (error.code === 'auth/invalid-action-code') {
        errorMessage = 'Invalid reset link. Please request a new password reset.'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.'
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Validating reset link...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && !isLoading && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
              {!oobCode && !mode && (
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Go to Forgot Password
                  </Button>
                </div>
              )}
            </Alert>
          )}

          {!error && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your new password"
                          {...field}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <div className="text-xs text-muted-foreground space-y-1 mt-1">
                      <p className="font-medium">Password requirements:</p>
                      <ul className="list-disc list-inside space-y-0.5 ml-2">
                        <li>At least 8 characters</li>
                        <li>Contains at least one letter</li>
                        <li>Contains at least one number</li>
                      </ul>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your new password"
                          {...field}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

              <Button type="submit" className="w-full" disabled={isLoading || !!error}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => navigate('/login')}
                  className="text-sm"
                >
                  Back to Login
                </Button>
              </div>
            </form>
          </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}