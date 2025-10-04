import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Shield, ShieldCheck, QrCode, Smartphone } from 'lucide-react'
// Removed Supabase import - using Firebase now

const mfaVerifySchema = z.object({
  code: z.string().length(6, 'Code must be exactly 6 digits').regex(/^\d+$/, 'Code must contain only numbers'),
})

type MFAVerifyFormData = z.infer<typeof mfaVerifySchema>

interface MFAFactor {
  id: string
  factor_type: string
  status: string
}

export const MFASetup = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [mfaFactors, setMfaFactors] = useState<MFAFactor[]>([])
  const [setupStep, setSetupStep] = useState<'setup' | 'verify' | 'complete'>('setup')
  const { enableMFA, verifyMFA, disableMFA } = useAuth()
  const { toast } = useToast()

  const form = useForm<MFAVerifyFormData>({
    resolver: zodResolver(mfaVerifySchema),
    defaultValues: {
      code: '',
    },
  })

  useEffect(() => {
    loadMFAFactors()
  }, [])

  const loadMFAFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) {
        console.error('Error loading MFA factors:', error)
      } else {
        setMfaFactors(data?.totp || [])
      }
    } catch (err) {
      console.error('Error loading MFA factors:', err)
    }
  }

  const handleEnableMFA = async () => {
    setIsLoading(true)
    setError(null)

    const { data, error } = await enableMFA()

    if (error) {
      setError(error.message || 'Failed to enable MFA. Please try again.')
    } else if (data) {
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setFactorId(data.id)
      setSetupStep('verify')

      // Create a challenge for verification
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: data.id,
      })

      if (challengeError) {
        setError('Failed to create verification challenge.')
      } else if (challengeData) {
        setChallengeId(challengeData.id)
      }
    }

    setIsLoading(false)
  }

  const handleVerifyMFA = async (data: MFAVerifyFormData) => {
    if (!factorId || !challengeId) {
      setError('Invalid setup state. Please try again.')
      return
    }

    setIsLoading(true)
    setError(null)

    const { error } = await verifyMFA(factorId, challengeId, data.code)

    if (error) {
      setError('Invalid code. Please check your authenticator app and try again.')
    } else {
      setSetupStep('complete')
      await loadMFAFactors()
      toast({
        title: 'MFA Enabled',
        description: 'Multi-factor authentication has been successfully enabled.',
      })
    }

    setIsLoading(false)
  }

  const handleDisableMFA = async (factorId: string) => {
    setIsLoading(true)
    setError(null)

    const { error } = await disableMFA(factorId)

    if (error) {
      setError('Failed to disable MFA. Please try again.')
    } else {
      await loadMFAFactors()
      setSetupStep('setup')
      setQrCode(null)
      setSecret(null)
      setFactorId(null)
      setChallengeId(null)
      form.reset()
      toast({
        title: 'MFA Disabled',
        description: 'Multi-factor authentication has been disabled.',
      })
    }

    setIsLoading(false)
  }

  const activeMFAFactors = mfaFactors.filter(factor => factor.status === 'verified')

  if (setupStep === 'complete' || activeMFAFactors.length > 0) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            MFA Enabled
          </CardTitle>
          <CardDescription>
            Your account is protected with multi-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeMFAFactors.map((factor) => (
            <div key={factor.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4" />
                <div>
                  <p className="font-medium">Authenticator App</p>
                  <p className="text-sm text-muted-foreground">TOTP</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Active</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisableMFA(factor.id)}
                  disabled={isLoading}
                >
                  Disable
                </Button>
              </div>
            </div>
          ))}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <p className="text-sm text-muted-foreground">
            You can disable MFA at any time, but we recommend keeping it enabled for better security.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (setupStep === 'verify') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Verify Setup
          </CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app and enter the 6-digit code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {qrCode && (
            <div className="flex justify-center">
              <img src={qrCode} alt="MFA QR Code" className="border rounded-lg" />
            </div>
          )}

          {secret && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Manual Entry Key:</p>
              <p className="text-sm font-mono break-all">{secret}</p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleVerifyMFA)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        {...field}
                        disabled={isLoading}
                        className="text-center text-lg tracking-widest"
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the 6-digit code from your authenticator app
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSetupStep('setup')
                    setQrCode(null)
                    setSecret(null)
                    form.reset()
                  }}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & Enable
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Multi-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account with MFA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <h4 className="font-medium">What you'll need:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>An authenticator app (Google Authenticator, Authy, etc.)</li>
            <li>Your mobile device to scan the QR code</li>
          </ul>
        </div>

        <Button onClick={handleEnableMFA} className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Set Up MFA
        </Button>

        <p className="text-xs text-muted-foreground">
          Once enabled, you'll need to enter a code from your authenticator app each time you sign in.
        </p>
      </CardContent>
    </Card>
  )
}