# 🔐 Specific Role-Based Access Control (RBAC) System

## 📋 **Overview**

This document outlines the specific role-based access control system with exact team hierarchy and role-based permissions as requested.

## 👥 **Role-Based Access Patterns**

### **Staff/HR**
- ✅ **Tasks**: See & edit only their own assigned tasks
- ✅ **Projects**: See & edit only their own projects
- ✅ **Scope**: Personal data only

### **Manager**
- ✅ **Tasks**: See My (own) + Team (their team only)
- ✅ **Projects**: See My (own) + Team (their team only)
- ✅ **Team Scope**: 
  - Manager in Eng 1 → sees Eng 1 (not HR)
  - Manager in Eng 2 → sees Eng 2 only
  - Manager in HR → sees HR only

### **Director**
- ✅ **Tasks**: See My + Team (their team + descendants)
- ✅ **Projects**: See My + Team (their team + descendants)
- ✅ **Team Scope**:
  - Director in Eng 1 → Eng 1 + Eng 2
  - Director in HR → HR only (no descendants)

### **Senior Management**
- ✅ **Tasks**: See across all teams (HR, Eng 1, Eng 2)
- ✅ **Projects**: See across all teams (HR, Eng 1, Eng 2)
- ✅ **Scope**: Company-wide access

## 🏗 **Team Hierarchy Structure**

```
Engineering 1 (Top-level)
├── Engineering 2 (Sub-team)
└── Other sub-teams...

HR (Top-level)
└── Other HR sub-teams...
```

## 🎯 **Task Creation Rules**

### **For Leaders (Manager/Director/Senior)**
- ✅ **Creator is auto-assigned** - Always included in assigneeIds
- ✅ **Can add assignees** - Only within teams they manage
- ✅ **Manager**: Can assign to their team only
- ✅ **Director**: Can assign to their team + descendants
- ✅ **Senior Management**: Can assign to any team

### **Assignment Logic**
```javascript
// When leader creates task
assigneeIds = [leaderId, ...selectedTeamMembers]

// Leader sees in "My" tab (because they're assigned)
// Team members see in "My" tab (because they're assigned)
// Leader sees in "Team" tab (because it's assigned to team members)
```

## 📅 **Calendar System**

### **My Calendar**
- ✅ **Shows**: Tasks assigned to me only
- ✅ **Purpose**: Personal task management
- ✅ **Scope**: All roles see their assigned tasks

### **Team Calendar (Leaders Only)**
- ✅ **Shows**: Tasks assigned to people in their scope
- ✅ **Toggle**: "Include my tasks" to avoid duplication
- ✅ **Scope**: 
  - Manager: Their team only
  - Director: Their team + descendants
  - Senior Management: All teams

### **Calendar Logic**
```javascript
// My Calendar
myTasks = tasks.filter(task => userIsAssignee(task.assigneeIds))

// Team Calendar (Leaders)
teamTasks = tasks.filter(task => 
  taskAssigneesInManagedScope(task.assigneeIds) && 
  !userIsAssignee(task.assigneeIds) // No double counting
)

// With "Include My Tasks" toggle
teamTasksWithMine = [...teamTasks, ...myTasks]
```

## 🔧 **Implementation Details**

### **Firebase Security Rules**

The system uses role-based access patterns:

```javascript
// Staff/HR: Only own assigned tasks
(role in ['Staff', 'HR'] && userIsAssignee(task.assigneeIds))

// Manager: Own + team tasks
(role == 'Manager' && (userIsAssignee(task.assigneeIds) || sameTeam(task.userId)))

// Director: Own + team + descendants
(role == 'Director' && (userIsAssignee(task.assigneeIds) || inManagedScope(task.userId)))

// Senior Management: All tasks
(role == 'Senior Management')
```

### **Access Patterns**

#### **Task Access Matrix**

| Role | Own Tasks | Team Tasks | Sub-team Tasks | Other Teams |
|------|-----------|------------|----------------|-------------|
| Staff | ✅ Assigned only | ❌ No | ❌ No | ❌ No |
| HR | ✅ Assigned only | ❌ No | ❌ No | ❌ No |
| Manager | ✅ Assigned only | ✅ Same team | ❌ No | ❌ No |
| Director | ✅ Assigned only | ✅ Team + descendants | ✅ Sub-teams | ❌ No |
| Senior Management | ✅ Assigned only | ✅ All teams | ✅ All teams | ✅ All teams |

#### **Project Access Matrix**

| Role | Own Projects | Team Projects | Sub-team Projects | Other Teams |
|------|--------------|----------------|-------------------|-------------|
| Staff | ✅ Own only | ❌ No | ❌ No | ❌ No |
| HR | ✅ Own only | ❌ No | ❌ No | ❌ No |
| Manager | ✅ Own only | ✅ Same team | ❌ No | ❌ No |
| Director | ✅ Own only | ✅ Team + descendants | ✅ Sub-teams | ❌ No |
| Senior Management | ✅ Own only | ✅ All teams | ✅ All teams | ✅ All teams |

## 🎯 **Use Cases**

### **Scenario 1: Manager in Engineering 1**
1. **Creates task** → Auto-assigned to manager
2. **Assigns team members** → Can only assign Engineering 1 members
3. **Sees in "My" tab** → Because they're assigned
4. **Sees in "Team" tab** → Because it's assigned to team members
5. **Cannot see** → Engineering 2 or HR tasks

### **Scenario 2: Director in Engineering 1**
1. **Creates task** → Auto-assigned to director
2. **Assigns team members** → Can assign Engineering 1 + Engineering 2 members
3. **Sees in "My" tab** → Because they're assigned
4. **Sees in "Team" tab** → Because it's assigned to team members
5. **Cannot see** → HR tasks

### **Scenario 3: Senior Management**
1. **Creates task** → Auto-assigned to senior management
2. **Assigns team members** → Can assign anyone (HR, Eng 1, Eng 2)
3. **Sees in "My" tab** → Because they're assigned
4. **Sees in "Team" tab** → Because it's assigned to team members
5. **Can see** → All company tasks

## 🔒 **Security Features**

### **Data Isolation**
- ✅ **Role-based boundaries** - Each role sees appropriate scope
- ✅ **Team hierarchy respected** - Parent teams can see child teams
- ✅ **Assignment-based access** - Only assigned users can see tasks
- ✅ **No cross-team access** - Managers can't see other teams

### **Navigation Logic**
- ✅ **Staff/HR**: Single view (My tasks only)
- ✅ **Manager**: Two tabs (My + Team)
- ✅ **Director**: Two tabs (My + Team + Sub-teams)
- ✅ **Senior Management**: Two tabs (My + All Teams)

## 🚀 **Deployment**

### **Step 1: Update Firebase Rules**
1. Go to Firebase Console → Firestore Database → Rules
2. Replace with the new `firestore.rules` content
3. Click "Publish"

### **Step 2: Update UI Components**
1. **Tasks Page** - Add role-based tabs
2. **Projects Page** - Add role-based tabs
3. **Calendar Page** - Add "Include My Tasks" toggle
4. **Navigation** - Update based on user role

### **Step 3: Test Access Control**
1. Create tasks as different roles
2. Test team hierarchy visibility
3. Verify assignment permissions
4. Test calendar functionality

## 📊 **Expected Results**

After implementing this specific RBAC system:

- ✅ **Staff/HR** see only their assigned tasks
- ✅ **Managers** see their team tasks only
- ✅ **Directors** see their team + sub-team tasks
- ✅ **Senior Management** see all company tasks
- ✅ **Team hierarchy respected** (Eng 1 → Eng 2)
- ✅ **Calendar separation** (My vs Team)
- ✅ **Toggle options** for full picture view

## 🔧 **UI Implementation**

### **Tasks Page Structure**
```
For Staff/HR:
└── My Tasks
    └── Assigned tasks only

For Manager:
├── My Tasks Tab
│   └── Assigned tasks only
└── Team Tasks Tab
    └── Team member tasks

For Director:
├── My Tasks Tab
│   └── Assigned tasks only
└── Team Tasks Tab
    └── Team + sub-team tasks

For Senior Management:
├── My Tasks Tab
│   └── Assigned tasks only
└── Team Tasks Tab
    └── All company tasks
```

### **Calendar Page Structure**
```
For Staff/HR:
└── My Calendar
    └── Assigned tasks only

For Leaders:
├── My Calendar
│   └── Assigned tasks only
└── Team Calendar
    ├── Team tasks (excluding own)
    ├── Toggle: "Include My Tasks"
    └── Team coordination
```

This specific RBAC system provides exactly the access control and navigation structure you requested! 🚀
