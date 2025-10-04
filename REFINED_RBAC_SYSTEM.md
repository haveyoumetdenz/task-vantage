# 🔐 Refined Role-Based Access Control (RBAC) System

## 📋 **Overview**

This document outlines the refined role-based access control system with clear **Own** vs **Team** distinctions and proper tab-based navigation for managers.

## 🎯 **Core Definitions**

### **Own Items**
- **Tasks**: Current user is an assignee (regardless of team)
- **Projects**: Current user is a project member or creator (optional project membership)

### **Team Items**
- **Tasks**: Assignees belong to teams you manage (including your own team), and you are NOT an assignee (no double counting)
- **Projects**: Project creators/members belong to teams you manage, and you are NOT a member

## 👥 **Role-Based Navigation**

### **For Managers/Directors/Senior Management**
- ✅ **Two Tabs**: "My" and "Team"
- ✅ **My Tab**: Your assigned tasks/projects only
- ✅ **Team Tab**: Everything assigned to others in your managed scope

### **For Staff**
- ✅ **Single View**: Only "My" items (assigned tasks/projects)

## 🏗 **Team Hierarchy Rules**

### **Engineering 1 (Parent Team)**
- ✅ **Can see**: Engineering 2 tasks and projects
- ✅ **Cannot see**: Other parent team data (HR, etc.)

### **Engineering 2 (Sub-team)**
- ❌ **Cannot see**: Engineering 1 tasks and projects
- ✅ **Can see**: Only own team data

### **HR (Parent Team)**
- ✅ **Can see**: HR sub-teams (if any)
- ❌ **Cannot see**: Engineering teams

## 🎯 **Task Creation Rules**

### **Manager Creates Task**
1. **Manager is auto-assigned** → Always included in assigneeIds
2. **Manager can add team members** → From their managed teams
3. **Director/Senior can add from descendants** → Can assign to sub-teams
4. **No double counting** → Manager sees in "My" tab, not "Team" tab

### **Assignment Logic**
```javascript
// When manager creates task
assigneeIds = [managerId, ...selectedTeamMembers]

// Manager sees in "My" tab (because they're assigned)
// Team members see in "My" tab (because they're assigned)
// Manager sees in "Team" tab (because it's assigned to team members)
```

## 📅 **Calendar System**

### **My Calendar**
- ✅ **Shows**: Your assigned tasks only
- ✅ **Purpose**: Personal task management
- ✅ **Scope**: All tasks where you're an assignee

### **Team Calendar**
- ✅ **Shows**: Your team's tasks (including yours)
- ✅ **Purpose**: Team oversight and coordination
- ✅ **Toggle Option**: "Include My Tasks" to avoid duplication
- ✅ **Scope**: All tasks assigned to your managed teams

### **Calendar Logic**
```javascript
// My Calendar
myTasks = tasks.filter(task => userIsAssignee(task.assigneeIds))

// Team Calendar
teamTasks = tasks.filter(task => 
  taskAssigneesBelongToManagedTeams(task.assigneeIds) && 
  !userIsAssignee(task.assigneeIds) // No double counting
)

// With "Include My Tasks" toggle
teamTasksWithMine = [...teamTasks, ...myTasks]
```

## 🔧 **Implementation Details**

### **Firebase Security Rules**

The system uses refined helper functions:

```javascript
// Check if user is assignee
function isAssignee(userId, assigneeIds) {
  return assigneeIds != null && userId in assigneeIds;
}

// Check if user can see team member's data
function canSeeTeamMemberData(viewerId, targetUserId) {
  // Returns true if viewer can see target's data
  // Respects team hierarchy
}
```

### **Access Patterns**

#### **Task Access Matrix**

| User Role | Own Tasks | Team Tasks | Sub-team Tasks |
|-----------|-----------|------------|----------------|
| Staff | ✅ Assigned only | ❌ No | ❌ No |
| Manager | ✅ Assigned only | ✅ Team only | ❌ No |
| Director | ✅ Assigned only | ✅ Team + Sub-teams | ✅ Sub-teams |
| Senior Management | ✅ Assigned only | ✅ All teams | ✅ All teams |

#### **Project Access Matrix**

| User Role | Own Projects | Team Projects | Sub-team Projects |
|-----------|--------------|---------------|-------------------|
| Staff | ✅ Own only | ❌ No | ❌ No |
| Manager | ✅ Own only | ✅ Team only | ❌ No |
| Director | ✅ Own only | ✅ Team + Sub-teams | ✅ Sub-teams |
| Senior Management | ✅ Own only | ✅ All teams | ✅ All teams |

## 🎯 **Use Cases**

### **Scenario 1: Manager Creates Task**
1. **Manager creates task** → Auto-assigned to manager
2. **Manager assigns team members** → Adds to assigneeIds
3. **Manager sees in "My" tab** → Because they're assigned
4. **Team members see in "My" tab** → Because they're assigned
5. **Manager sees in "Team" tab** → Because it's assigned to team members

### **Scenario 2: Team Hierarchy**
1. **Engineering 1 Manager** → Can see Engineering 2 tasks in "Team" tab
2. **Engineering 2 Manager** → Cannot see Engineering 1 tasks
3. **Director** → Can see all descendant team tasks
4. **Senior Management** → Can see all company tasks

### **Scenario 3: Calendar Navigation**
1. **My Calendar** → Shows assigned tasks only
2. **Team Calendar** → Shows team tasks (excluding own to avoid duplication)
3. **Toggle Option** → "Include My Tasks" to show full picture
4. **Manager View** → Sees both personal and team tasks

## 🔒 **Security Features**

### **Data Isolation**
- ✅ **Own vs Team distinction** - Clear separation of personal vs team data
- ✅ **No double counting** - Own items don't appear in Team tab
- ✅ **Team hierarchy enforced** - Parent teams can see child teams
- ✅ **Assignment-based access** - Only assigned users can see tasks

### **Navigation Logic**
- ✅ **Tab-based interface** - Clear separation of concerns
- ✅ **Role-based tabs** - Managers get "My" and "Team" tabs
- ✅ **Staff single view** - Only "My" items for staff
- ✅ **Calendar separation** - Personal vs team calendars

## 🚀 **Deployment**

### **Step 1: Update Firebase Rules**
1. Go to Firebase Console → Firestore Database → Rules
2. Replace with the new `firestore.rules` content
3. Click "Publish"

### **Step 2: Update UI Components**
1. **Tasks Page** - Add "My" and "Team" tabs for managers
2. **Projects Page** - Add "My" and "Team" tabs for managers
3. **Calendar Page** - Add "Include My Tasks" toggle
4. **Navigation** - Update based on user role

### **Step 3: Test Access Control**
1. Create tasks as different users
2. Test "My" vs "Team" tab separation
3. Verify calendar functionality
4. Test team hierarchy visibility

## 📊 **Expected Results**

After implementing this refined RBAC system:

- ✅ **Clear Own vs Team separation** in all interfaces
- ✅ **Tab-based navigation** for managers
- ✅ **No double counting** of tasks/projects
- ✅ **Team hierarchy respected** (Engineering 1 → Engineering 2)
- ✅ **Calendar separation** (My vs Team)
- ✅ **Toggle options** for full picture view

## 🔧 **UI Implementation**

### **Tasks Page Structure**
```
For Managers/Directors/Senior:
├── My Tasks Tab
│   ├── Assigned tasks only
│   └── Personal task management
└── Team Tasks Tab
    ├── Team member tasks
    └── Team oversight

For Staff:
└── My Tasks
    └── Assigned tasks only
```

### **Calendar Page Structure**
```
├── My Calendar
│   ├── Assigned tasks only
│   └── Personal scheduling
└── Team Calendar
    ├── Team tasks (excluding own)
    ├── Toggle: "Include My Tasks"
    └── Team coordination
```

This refined RBAC system provides exactly the access control and navigation structure you requested! 🚀
