# RBAC Hierarchy Implementation

## Team Structure
```
Team 1 (Root)
└── Team 2
    └── Team 3
```

## Roles & Permissions Matrix

| Role               | Tasks/Projects Access      | Team Management          | Can Reassign Tasks |
|-------------------|----------------------------|--------------------------|-------------------|
| Staff             | Own assigned only          | None                     | No                |
| HR                | Own assigned only          | All teams                | No                |
| Manager           | Own + team members         | Own team only            | Within own team   |
| Director          | Own + team + descendants   | Own team + descendants   | Within hierarchy  |
| Senior Management | All teams                  | All teams                | All teams         |

## Database Schema

### Teams Table
- `id`: UUID primary key
- `name`: Team name
- `parent_team_id`: References parent team (NULL for root)
- `manager_user_id`: Team manager
- `created_at`, `updated_at`: Timestamps

### Profiles Table (Enhanced)
- `user_id`: References auth.users
- `role`: app_role enum
- `team_id`: References teams table
- `full_name`, `avatar_url`: User info
- `status`: user_status enum

### Helper Functions
- `get_team_descendants(team_uuid)`: Returns all descendant teams
- `get_managed_teams(user_uuid)`: Returns teams manageable by user based on role

## UI Components

### Tasks Page
- **Staff/HR**: Single view showing only assigned tasks
- **Manager+**: Tabs for "My Work" vs "Team Work"
- Role-based filtering and permissions

### Team Management Page
- Organization hierarchy display
- Role-based add member buttons
- Nested team structure visualization

## Security Implementation

### Row Level Security (RLS)
- Tasks: Users see own + assigned + team hierarchy based on role
- Projects: Team-based access with hierarchy support
- Teams: Full visibility for org chart, management based on role

### Permission Enforcement
- Client-side: UI restrictions and role-based rendering
- Server-side: RLS policies and function-based access control
- Audit logging: All reassignments and team changes tracked

## Adding New Teams

To add teams in the future:
1. Insert into `teams` table with appropriate `parent_team_id`
2. Update user profiles to assign to new teams
3. RLS policies automatically handle hierarchy permissions

## Testing Acceptance Criteria

- A1: Staff can only see assigned tasks ✓
- A2: Manager sees own + team work tabs ✓  
- A3: Director sees team + descendants ✓
- A4: Senior Management sees all teams ✓
- A5: Org chart shows hierarchy ✓
- A6: Add-member buttons follow RBAC ✓
- A7: Unauthorized access returns 403 ✓
- A8: Current user assigned as Senior Management ✓