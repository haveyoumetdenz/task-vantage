# TaskFlow Organizational Structure

## Updated Hierarchy (Based on User Requirements)

```
🏢 SENIOR MANAGEMENT (Not in any team - oversees everyone)
├── Can see all teams and tasks across the organization
├── Has access to all data and reports
└── Not assigned to any specific team

📊 ENGINEERING 1 (Director Level)
├── Highest Role: Director
├── Can see: Engineering 1 + Engineering 2 (sub-team)
├── Roles: Staff, Manager, Director
└── Reports to: Senior Management

📊 ENGINEERING 2 (Manager Level)  
├── Highest Role: Manager
├── Can see: Engineering 2 only
├── Roles: Staff, Manager
├── Reports to: Engineering 1 Director
└── Sub-team of: Engineering 1

👥 HR (Director Level)
├── Highest Role: Director  
├── Can see: HR team only
├── Roles: Staff, Manager, Director
└── Reports to: Senior Management
```

## Role-Based Access Control (RBAC)

### **Senior Management**
- **Team Assignment**: None (not in any specific team)
- **Visibility**: All teams (Engineering 1, Engineering 2, HR)
- **Permissions**: Full access to all tasks, projects, and reports
- **Can Manage**: All users and teams

### **Director (Engineering 1)**
- **Team Assignment**: Engineering 1
- **Visibility**: Engineering 1 + Engineering 2 (sub-team)
- **Permissions**: Manage Engineering 1 and Engineering 2
- **Can Manage**: Staff and Managers in their teams

### **Director (HR)**
- **Team Assignment**: HR
- **Visibility**: HR team only
- **Permissions**: Manage HR team
- **Can Manage**: Staff and Managers in HR

### **Manager (Engineering 2)**
- **Team Assignment**: Engineering 2
- **Visibility**: Engineering 2 only
- **Permissions**: Manage Engineering 2 team
- **Can Manage**: Staff in Engineering 2

### **Manager (Engineering 1)**
- **Team Assignment**: Engineering 1
- **Visibility**: Engineering 1 only
- **Permissions**: Manage Engineering 1 team
- **Can Manage**: Staff in Engineering 1

### **Manager (HR)**
- **Team Assignment**: HR
- **Visibility**: HR team only
- **Permissions**: Manage HR team
- **Can Manage**: Staff in HR

### **Staff**
- **Team Assignment**: Any team (Engineering 1, Engineering 2, or HR)
- **Visibility**: Own tasks + other staff in same team
- **Permissions**: View and edit own tasks
- **Can Manage**: None

## Team Role Limits

| Team | Highest Role | Allowed Roles |
|------|-------------|---------------|
| Engineering 1 | Director | Staff, Manager, Director |
| Engineering 2 | Manager | Staff, Manager |
| HR | Director | Staff, Manager, Director |
| Senior Management | Senior Management | Senior Management (separate) |

## Key Features

✅ **Senior Management**: Not in any team, can see everyone  
✅ **Engineering 2**: Highest role is Manager (reports to Engineering 1)  
✅ **Engineering 1**: Highest role is Director (can see Engineering 2)  
✅ **HR**: Highest role is Director (independent team)  
✅ **Proper Hierarchy**: Clear reporting structure and permissions  
✅ **Role Validation**: System prevents invalid role assignments to teams  

## Implementation Status

- ✅ RBAC logic updated
- ✅ Team hierarchy implemented  
- ✅ Role validation functions added
- ✅ Team assignment rules defined
- ✅ Visibility permissions configured
- ✅ Senior Management properly separated from teams
- ⚠️ **Action Required**: Update existing Senior Management user profile to remove teamId

## Manual Fix Required

**For the user `denzel.toh.2022@scis.smu.edu.sg` (Senior Management):**

1. **Go to Firebase Console** → Firestore Database
2. **Find the profiles collection**
3. **Locate the user with email**: `denzel.toh.2022@scis.smu.edu.sg`
4. **Update the document** to set `teamId: null`
5. **Save the changes**

**Alternative - Firebase CLI:**
```bash
firebase firestore:update /profiles/{USER_ID} --data '{"teamId": null}'
```

This will properly separate Senior Management from any team assignment.