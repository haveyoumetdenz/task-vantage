# 🔐 Role-Based Access Control (RBAC) System

## 📋 **Overview**

This document outlines the comprehensive role-based access control system for tasks and projects, implementing team hierarchy and assignment-based permissions.

## 🏗 **Team Hierarchy Structure**

```
Engineering 1 (Top-level)
├── Engineering 2 (Sub-team)
└── Other sub-teams...

HR (Top-level)
└── Other HR sub-teams...
```

## 👥 **Role Hierarchy**

1. **Senior Management** - Can see all company data
2. **Director** - Can see all company data  
3. **HR** - Can see all company data
4. **Manager** - Can see team and sub-team data
5. **Staff** - Can see own data and assigned tasks

## 🎯 **Access Control Rules**

### **Tasks Access**

#### **Own Tasks**
- ✅ **Created by you** - Full access (read/write)
- ✅ **Assigned to you** - Full access (read/write)

#### **Team Tasks**
- ✅ **Manager sees team member tasks** - Can view and edit
- ✅ **Team hierarchy respected** - Engineering 1 can see Engineering 2 tasks
- ✅ **Sub-team visibility** - Parent teams can see child team tasks
- ❌ **Reverse access denied** - Engineering 2 cannot see Engineering 1 tasks

#### **Assignment Rules**
- ✅ **Manager creates task** - Automatically assigned to manager
- ✅ **Manager assigns others** - Can assign team members
- ✅ **Manager stays assigned** - Always included in assigneeIds
- ✅ **Team calendar visibility** - Own tasks appear in team calendars

### **Projects Access**

#### **Own Projects**
- ✅ **Created by you** - Full access (read/write)

#### **Team Projects**
- ✅ **Manager sees team member projects** - Can view and edit
- ✅ **Team hierarchy respected** - Same as tasks
- ✅ **Sub-team visibility** - Parent teams can see child team projects

## 🔧 **Implementation Details**

### **Firebase Security Rules**

The system uses helper functions in Firestore Security Rules:

```javascript
// Get user's team hierarchy (parent teams)
function getUserTeamHierarchy(userId) {
  // Returns array of team IDs including parent teams
}

// Check if user can see team member's data
function canSeeTeamMemberData(viewerId, targetUserId) {
  // Returns true if viewer can see target's data
}
```

### **Access Patterns**

#### **Task Access Matrix**

| User Role | Own Tasks | Assigned Tasks | Team Tasks | Sub-team Tasks |
|-----------|-----------|----------------|------------|----------------|
| Staff | ✅ Full | ✅ Full | ❌ No | ❌ No |
| Manager | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| HR | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Director | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Senior Management | ✅ Full | ✅ Full | ✅ Full | ✅ Full |

#### **Project Access Matrix**

| User Role | Own Projects | Team Projects | Sub-team Projects |
|-----------|--------------|---------------|-------------------|
| Staff | ✅ Full | ❌ No | ❌ No |
| Manager | ✅ Full | ✅ Full | ✅ Full |
| HR | ✅ Full | ✅ Full | ✅ Full |
| Director | ✅ Full | ✅ Full | ✅ Full |
| Senior Management | ✅ Full | ✅ Full | ✅ Full |

## 🎯 **Use Cases**

### **Scenario 1: Manager Creates Task**
1. **Manager creates task** → Automatically assigned to manager
2. **Manager assigns team members** → Adds to assigneeIds
3. **Manager stays assigned** → Remains in assigneeIds
4. **Team members see task** → In their assigned tasks
5. **Manager sees all** → Own tasks + team tasks

### **Scenario 2: Team Hierarchy**
1. **Engineering 1 Manager** → Can see Engineering 2 tasks
2. **Engineering 2 Manager** → Cannot see Engineering 1 tasks
3. **HR Manager** → Can see all team tasks
4. **Senior Management** → Can see all company tasks

### **Scenario 3: Calendar Visibility**
1. **Own tasks** → Appear in personal calendar
2. **Assigned tasks** → Appear in personal calendar
3. **Team tasks** → Appear in team calendar (for managers)
4. **Sub-team tasks** → Appear in team calendar (for parent team managers)

## 🔒 **Security Features**

### **Data Isolation**
- ✅ **Team boundaries respected** - Cannot see other teams' data
- ✅ **Hierarchy enforced** - Parent teams can see child teams
- ✅ **Assignment-based access** - Only assigned users can see tasks
- ✅ **Role-based permissions** - Different access levels by role

### **Audit Trail**
- ✅ **User tracking** - All actions tied to user ID
- ✅ **Team context** - Actions include team information
- ✅ **Assignment history** - Track who was assigned what
- ✅ **Permission logging** - Security rule decisions logged

## 🚀 **Deployment**

### **Step 1: Update Firebase Rules**
1. Go to Firebase Console → Firestore Database → Rules
2. Replace with the new `firestore.rules` content
3. Click "Publish"

### **Step 2: Test Access Control**
1. Create tasks as different users
2. Test team hierarchy visibility
3. Verify assignment permissions
4. Check calendar visibility

### **Step 3: Monitor Performance**
1. Check Firestore usage
2. Monitor security rule performance
3. Verify team hierarchy queries
4. Test edge cases

## 📊 **Expected Results**

After implementing this RBAC system:

- ✅ **Managers see team tasks** in their dashboard
- ✅ **Team calendars show team tasks** for managers
- ✅ **Own tasks appear in team calendars** for visibility
- ✅ **Team hierarchy respected** (Engineering 1 → Engineering 2)
- ✅ **Assignment-based access** works correctly
- ✅ **Security boundaries** properly enforced

## 🔧 **Troubleshooting**

### **Common Issues**

1. **"Missing or insufficient permissions"**
   - Check if user has correct role
   - Verify team hierarchy setup
   - Ensure proper team assignments

2. **Tasks not showing in team calendar**
   - Verify manager role
   - Check team hierarchy
   - Ensure task has due date

3. **Cannot see sub-team tasks**
   - Verify parent team relationship
   - Check team hierarchy setup
   - Ensure proper role assignment

### **Debug Steps**

1. **Check user profile** - Verify role and teamId
2. **Check team hierarchy** - Verify parent-child relationships
3. **Check task assignments** - Verify assigneeIds
4. **Check security rules** - Verify rule deployment
5. **Check console logs** - Look for permission errors

This RBAC system provides comprehensive access control while maintaining team collaboration and hierarchy! 🚀
