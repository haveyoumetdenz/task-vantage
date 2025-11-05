# Missing User Story: UAA-COR-01

## Issue Identified
The User Management page is missing the ability for HR to create/invite new users.

## Expected Behavior (from testing strategy)
- HR should be able to click "Add User" button
- HR should fill in email and select role
- System should send invitation email
- User receives activation link and can activate account (UAA-COR-02)

## Current State
- ✅ User Management page exists
- ✅ Shows list of existing users
- ✅ Can manage existing user accounts (activate/deactivate)
- ❌ **Missing: "Add User" / "Invite User" button**
- ❌ **Missing: Invite user dialog/form**
- ❌ **Missing: Invitation email functionality**

## User Stories Related
- **UAA-COR-01**: HR creates account (invites user)
- **UAA-COR-02**: User activates account (via invitation link)

## Next Steps
1. Add "Add User" button to User Management page
2. Create InviteUserDialog component
3. Implement invitation functionality (Firebase Auth invite)
4. Add email sending (Firebase Functions or email service)
5. Create activation flow for invited users

