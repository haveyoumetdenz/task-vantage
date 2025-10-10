import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { AlertTriangle, UserX, Trash2, UserCheck, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { deactivateUserAccount, permanentlyDeleteUserAccount, reactivateUserAccount, getAccountStatus } from '@/utils/accountManagement'
import { useFirebaseProfile } from '@/hooks/useFirebaseProfile'

const accountManagementSchema = z.object({
  action: z.enum(['deactivate', 'reactivate', 'delete']),
  reason: z.string().min(1, 'Reason is required'),
  confirmAction: z.boolean().refine(val => val === true, 'You must confirm this action'),
})

type AccountManagementFormData = z.infer<typeof accountManagementSchema>

interface AccountManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetUserId: string
  targetUserName: string
  targetUserEmail: string
}

export const AccountManagementDialog = ({
  open,
  onOpenChange,
  targetUserId,
  targetUserName,
  targetUserEmail
}: AccountManagementDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accountStatus, setAccountStatus] = useState<any>(null)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const { profile } = useFirebaseProfile()

  const form = useForm<AccountManagementFormData>({
    resolver: zodResolver(accountManagementSchema),
    defaultValues: {
      action: 'deactivate',
      reason: '',
      confirmAction: false,
    },
  })

  // Load account status when dialog opens
  React.useEffect(() => {
    if (open && targetUserId) {
      loadAccountStatus()
    }
  }, [open, targetUserId])

  const loadAccountStatus = async () => {
    try {
      const status = await getAccountStatus(targetUserId)
      setAccountStatus(status)
    } catch (error) {
      console.error('Error loading account status:', error)
    }
  }

  const onSubmit = async (data: AccountManagementFormData) => {
    if (!profile?.userId) {
      setResult({ success: false, message: 'You must be logged in to perform this action' })
      return
    }

    setIsSubmitting(true)
    setResult(null)

    try {
      let result

      switch (data.action) {
        case 'deactivate':
          result = await deactivateUserAccount({
            userId: targetUserId,
            reason: data.reason,
            deactivatedBy: profile.userId,
            keepTasksAndProjects: true
          })
          break

        case 'reactivate':
          result = await reactivateUserAccount(targetUserId, profile.userId)
          break

        case 'delete':
          result = await permanentlyDeleteUserAccount({
            userId: targetUserId,
            reason: data.reason,
            deactivatedBy: profile.userId
          })
          break

        default:
          result = { success: false, message: 'Invalid action' }
      }

      setResult(result)

      if (result.success) {
        // Reload account status
        await loadAccountStatus()
        // Reset form
        form.reset()
      }

    } catch (error) {
      console.error('Error performing account action:', error)
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'deactivate': return <UserX className="h-4 w-4" />
      case 'reactivate': return <UserCheck className="h-4 w-4" />
      case 'delete': return <Trash2 className="h-4 w-4" />
      default: return null
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'deactivate': return 'text-orange-600'
      case 'reactivate': return 'text-green-600'
      case 'delete': return 'text-red-600'
      default: return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Account Management
          </DialogTitle>
          <DialogDescription>
            Manage account for <strong>{targetUserName}</strong> ({targetUserEmail})
          </DialogDescription>
        </DialogHeader>

        {/* Account Status */}
        {accountStatus && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Current Status</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Active:</strong> {accountStatus.isActive ? 'Yes' : 'No'}</p>
              {accountStatus.deactivatedAt && (
                <p><strong>Deactivated:</strong> {new Date(accountStatus.deactivatedAt).toLocaleString()}</p>
              )}
              {accountStatus.deactivationReason && (
                <p><strong>Reason:</strong> {accountStatus.deactivationReason}</p>
              )}
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="deactivate">
                        <div className="flex items-center gap-2">
                          <UserX className="h-4 w-4" />
                          Deactivate Account
                        </div>
                      </SelectItem>
                      <SelectItem value="reactivate">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          Reactivate Account
                        </div>
                      </SelectItem>
                      <SelectItem value="delete">
                        <div className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Permanently Delete Account
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter reason for this action..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmAction"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I confirm this action and understand the consequences
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {form.watch('action') === 'delete' && 
                        'This will permanently delete the account and cannot be undone.'
                      }
                      {form.watch('action') === 'deactivate' && 
                        'This will deactivate the account and unassign the user from all tasks and projects.'
                      }
                      {form.watch('action') === 'reactivate' && 
                        'This will reactivate the account and allow the user to log in again.'
                      }
                    </p>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Result Alert */}
            {result && (
              <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {result.message}
                </AlertDescription>
              </Alert>
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
                disabled={isSubmitting}
                className={getActionColor(form.watch('action'))}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  getActionIcon(form.watch('action'))
                )}
                {isSubmitting ? 'Processing...' : `Confirm ${form.watch('action')}`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
