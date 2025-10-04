# Organizational Structure & RBAC System

## Current User Profile Update
**User:** denzel.toh.2022@scis.smu.edu.sg  
**Role:** Senior Management  
**Team:** Engineering 1  
**Status:** Active  

## Role-Based Access Control (RBAC) System

### Available Roles:
1. **Staff** - Basic user
2. **Manager** - Team management
3. **HR** - Human resources
4. **Director** - Department management
5. **Senior Management** - Full system access

### Permission Matrix:

| Feature | Staff | Manager | HR | Director | Senior Management |
|---------|-------|---------|----|---------|-------------------|
| **View Own Tasks** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Team Tasks** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **View All Tasks** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Manage Users** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Manage Teams** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **View Reports** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Create Projects** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Assign Tasks** | ❌ | ✅ | ✅ | ✅ | ✅ |

## Team Structure

### Engineering 1 Team
- **Team ID:** engineering-1
- **Manager:** Denzel Toh (Senior Management)
- **Members:** 
  - Denzel Toh (Senior Management) - denzel.toh.2022@scis.smu.edu.sg

### Team Hierarchy
```
Engineering 1
├── Denzel Toh (Senior Management)
└── [Other team members will appear here]
```

## Firebase Collections Structure

### Profiles Collection
```javascript
{
  id: "user-id",
  userId: "firebase-auth-uid",
  email: "user@example.com",
  fullName: "User Name",
  role: "Senior Management",
  teamId: "engineering-1",
  status: "active",
  mfaEnabled: false,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Teams Collection (Future)
```javascript
{
  id: "engineering-1",
  name: "Engineering 1",
  description: "Engineering team",
  managerId: "user-id",
  parentTeamId: null,
  status: "active",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

## Current System Status

### ✅ Working Features:
- User authentication (Firebase Auth)
- Task management (CRUD operations)
- Project management (CRUD operations)
- Team member viewing
- Reports and analytics
- Role-based access control

### 🔧 Team Management Features:
- View team members by team
- Update member status (active/deactivated)
- Update member roles
- Update member team assignments
- Real-time team member updates

### 📊 Analytics Features:
- Task completion rates
- Project statistics
- Team productivity metrics
- Activity trends (30-day history)

## Next Steps for Full Team Management:

1. **Create Teams Collection** - Add teams to Firestore
2. **Team Hierarchy** - Implement parent-child team relationships
3. **Team Invitations** - Allow managers to invite new members
4. **Team Permissions** - Granular permissions within teams
5. **Team Analytics** - Team-specific performance metrics

## Access Instructions:

1. **To update your profile:** Run the update script in browser console
2. **To view team page:** Navigate to `/team` (should work with Senior Management role)
3. **To manage users:** Use the dropdown menus on team member cards
4. **To view reports:** Navigate to `/reports` for analytics

