# Invitation Email Setup

## Current Status

**Email sending is NOT currently implemented.** When you create an invitation, the system:
1. ✅ Creates the invitation in Firestore
2. ✅ Generates an invitation link
3. ⚠️ **Shows the link for you to copy and send manually**
4. ❌ Does NOT automatically send emails

## How to Use Invitations

1. **Create Invitation:**
   - Go to User Management
   - Click "Invite User"
   - Fill in email, name, role, and team
   - Click "Invite User"

2. **Copy Invitation Link:**
   - After creating, a dialog shows the invitation link
   - Click "Copy Link" button
   - The link is copied to your clipboard

3. **Send Invitation:**
   - Open your email client
   - Send an email to the invited user
   - Paste the invitation link in the email
   - Example email:
     ```
     Subject: You've been invited to join Task Vantage
     
     Hello [Name],
     
     You've been invited to join Task Vantage as a [Role].
     
     Click the link below to create your account:
     [INVITATION LINK]
     
     This invitation will expire in 7 days.
     ```

## To Implement Automatic Email Sending

### Option 1: Firebase Functions (Recommended)

1. **Install nodemailer in functions:**
   ```bash
   cd functions
   npm install nodemailer
   ```

2. **Update `functions/src/index.ts`:**
   - Add actual email sending using nodemailer or SendGrid
   - Configure SMTP or email service credentials
   - Send email with invitation link

3. **Deploy function:**
   ```bash
   firebase deploy --only functions:sendInvitationEmail
   ```

### Option 2: Firebase Extensions

Install Firebase Extensions like:
- SendGrid Email
- Mailgun
- Resend

### Option 3: Third-Party Email Service

Use services like:
- SendGrid API
- Mailgun API
- Resend API
- AWS SES

## Current Behavior

- ✅ Invitation is created in Firestore
- ✅ Invitation link is generated
- ✅ Link is displayed with copy button
- ❌ Email is NOT sent automatically
- ✅ You need to copy the link and send it manually

---

**Note:** The "successfully sent" message is misleading - it should say "Invitation created" instead. The code has been updated to always show the invitation link for manual sending.

