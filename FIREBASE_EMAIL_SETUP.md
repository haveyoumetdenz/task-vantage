# Firebase Email Setup for User Invitations

## Current Implementation

I've updated the invitation system to use **Firebase Auth's password reset email** functionality. Here's how it works:

### How It Works Now

1. **HR Creates Invitation:**
   - HR fills in email, name, role, team
   - System calls Firebase Function `createUserAndSendInvitation`

2. **Firebase Function:**
   - Creates user account in Firebase Auth with temporary password
   - Creates user profile in Firestore
   - Generates password reset link
   - **TODO**: Actually send the email via email service

3. **User Receives Email:**
   - User receives password reset email from Firebase
   - Email contains link to set their password
   - User clicks link and sets password
   - User can now log in

### Current Status

✅ **User account is created** in Firebase Auth  
✅ **Password reset link is generated**  
⚠️ **Email is NOT automatically sent yet** (needs email service configuration)

### To Enable Automatic Email Sending

You have two options:

#### Option 1: Use Firebase's Built-in Email (Recommended)

Firebase Auth can send password reset emails automatically. To enable this:

1. **Configure Firebase Email Templates:**
   - Go to Firebase Console → Authentication → Templates
   - Customize the "Password reset" email template
   - Add invitation text explaining they were invited

2. **Send Password Reset Email:**
   - After creating the user, call `sendPasswordResetEmail` from client SDK
   - Or use an email service to send the generated link

#### Option 2: Use Email Service (More Control)

1. **Install Email Service:**
   ```bash
   cd functions
   npm install nodemailer
   # OR
   npm install @sendgrid/mail
   ```

2. **Configure Email Service:**
   - Set up SMTP credentials or API keys
   - Add to environment variables

3. **Send Email in Function:**
   - Use nodemailer or SendGrid to send invitation email
   - Include the password reset link in the email

### Quick Fix: Send Email via Client

For now, you can send the password reset email from the client after user creation:

```typescript
// In InviteUserDialog.tsx, after user is created:
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/integrations/firebase/client'

await sendPasswordResetEmail(auth, email.toLowerCase(), {
  url: `${window.location.origin}/reset-password`,
  handleCodeInApp: false,
})
```

This will use Firebase's built-in email service to send the password reset email automatically.

---

**Next Steps:**
1. Update `InviteUserDialog.tsx` to send password reset email after user creation
2. OR configure email service in Firebase Functions
3. Test the email delivery

