# Task Vantage - C4 Architecture Diagrams

This document provides detailed specifications for creating C1-C4 architecture diagrams for Task Vantage.

---

## C1: Context Diagram (System Context)

### Purpose
Shows the system and its relationships with external actors.

### Elements to Create

#### Actors (Person/User Icons)
1. **Staff**
   - Position: Top-left
   - Color: Blue (#2563EB)
   - Description: Individual contributors who create and manage their own tasks

2. **Managers**
   - Position: Top-center
   - Color: Blue (#2563EB)
   - Description: Team leaders who manage team tasks and approve requests

3. **Directors**
   - Position: Top-right
   - Color: Blue (#2563EB)
   - Description: Department heads who manage team hierarchy

4. **Senior Management**
   - Position: Right-center
   - Color: Blue (#2563EB)
   - Description: Organization leaders with full system access

5. **HR**
   - Position: Bottom-right
   - Color: Blue (#2563EB)
   - Description: Human Resources personnel managing user accounts

#### System (Rounded Rectangle)
- **Task Vantage System**
  - Position: Center
  - Color: Light Blue (#3B82F6)
  - Description: "Manages tasks, projects, teams, and organizational workflows"
  - Label: [Software System]

### Connections (Arrows with Labels)

1. **Staff → Task Vantage System**
   - Label: "HTTPS"
   - Description: "View tasks & projects, Create/update tasks, Apply for arrangements"

2. **Managers → Task Vantage System**
   - Label: "HTTPS"
   - Description: "View team schedule, Approve/reject requests, View department schedule"

3. **Directors → Task Vantage System**
   - Label: "HTTPS"
   - Description: "View team hierarchy, Manage multiple teams, View department reports"

4. **Senior Management → Task Vantage System**
   - Label: "HTTPS"
   - Description: "View all organization data, Access all reports"

5. **HR → Task Vantage System**
   - Label: "HTTPS"
   - Description: "Manage user accounts, View user reports"

### Draw.io Instructions
1. Create 5 person icons (blue) at the top/right/bottom
2. Create 1 large rounded rectangle (light blue) in center
3. Add arrows from each person to the system
4. Label each arrow with "HTTPS" and interaction descriptions

---

## C2: Container Diagram (Application Architecture)

### Purpose
Shows the high-level shape of the software architecture and the responsibilities of containers.

### Elements to Create

#### External Users (Person Icons - Outside Boundary)
1. **Staff** (Top-left, outside)
2. **Managers** (Top-center, outside)
3. **Directors** (Top-right, outside)
4. **Senior Management** (Right-center, outside)
5. **HR** (Bottom-right, outside)

#### System Boundary (Dashed Rectangle)
- Encloses all containers
- Label: "Task Vantage System"

#### Containers (Inside Boundary)

1. **Front-End Application**
   - Type: Rectangle (Dark Grey)
   - Position: Top-left (inside)
   - Container: `React/TypeScript/Vite`
   - Description: "Provides UI for task management, project tracking, and team collaboration"
   - Technology: HTML/JavaScript

2. **Firebase Authentication**
   - Type: Rectangle (Dark Grey)
   - Position: Top-right (inside)
   - Container: `Firebase Auth`
   - Description: "Handles user authentication and authorization"
   - Technology: Firebase Auth Service

3. **Firestore Database**
   - Type: Cylinder (Dark Grey)
   - Position: Bottom-left (inside)
   - Container: `Firestore`
   - Description: "Stores tasks, projects, teams, profiles, meetings data"
   - Technology: Firestore NoSQL Database

4. **Firebase Storage**
   - Type: Cylinder (Dark Grey)
   - Position: Bottom-center (inside)
   - Container: `Firebase Storage`
   - Description: "Stores file attachments and user avatars"
   - Technology: Firebase Storage Service

5. **Firebase Functions**
   - Type: Rectangle (Dark Grey)
   - Position: Bottom-right (inside)
   - Container: `Node.js/Cloud Functions`
   - Description: "Server-side operations (user deactivation, notifications)"
   - Technology: Firebase Cloud Functions

### Connections

1. **All Users → Front-End Application**
   - Label: "HTTPS"
   - Description: "View schedule, Manage tasks, Approve/reject requests"

2. **Front-End Application → Firebase Authentication**
   - Label: "API requests"
   - Description: "Authenticate users"

3. **Front-End Application → Firestore Database**
   - Label: "read/write"
   - Description: "CRUD operations"
   - Sub-label: `[Firebase SDK]`

4. **Front-End Application → Firebase Storage**
   - Label: "upload/download"
   - Description: "File operations"

5. **Front-End Application → Firebase Functions**
   - Label: "API requests"
   - Description: "Server-side operations"

### Draw.io Instructions
1. Draw dashed rectangle boundary
2. Place person icons outside boundary
3. Place 5 containers inside boundary:
   - 2 rectangles (Front-End, Functions)
   - 2 cylinders (Firestore, Storage)
   - 1 rectangle (Auth)
4. Connect users to Front-End
5. Connect Front-End to all Firebase services

---

## C3: Component Diagram (Frontend Application Components)

### Purpose
Shows how the Front-End Application is decomposed into components.

### Elements to Create

#### Container Boundary
- **Front-End Application** (Large dashed rectangle)
  - Container: `React/TypeScript/Vite`

#### Components (Inside Front-End Application)

1. **Authentication Component**
   - Type: Rectangle (Light Blue)
   - Position: Top-left
   - Component: `AuthProvider, LoginForm, SignUpForm`
   - Description: "Handles user authentication flow"
   - Technology: React Context/Hooks

2. **Task Management Component**
   - Type: Rectangle (Light Blue)
   - Position: Top-center
   - Component: `TaskService, TaskValidation, TaskCalendar`
   - Description: "Manages task CRUD operations, validation, and calendar view"
   - Technology: React Hooks, Validation Utils

3. **Project Management Component**
   - Type: Rectangle (Light Blue)
   - Position: Top-right
   - Component: `ProjectService, ProjectValidation, ProjectProgress`
   - Description: "Manages project CRUD operations and progress calculation"
   - Technology: React Hooks, Validation Utils

4. **Team Management Component**
   - Type: Rectangle (Light Blue)
   - Position: Bottom-left
   - Component: `TeamService, RBACService, TeamHierarchy`
   - Description: "Manages team structure, hierarchy, and role-based access"
   - Technology: React Hooks, RBAC Utils

5. **Reporting Component**
   - Type: Rectangle (Light Blue)
   - Position: Bottom-center
   - Component: `ReportGenerator, Analytics, PDFExport`
   - Description: "Generates reports and analytics"
   - Technology: React Hooks, PDF Utils

6. **Notification Component**
   - Type: Rectangle (Light Blue)
   - Position: Bottom-right
   - Component: `NotificationService, DeadlineNotifications`
   - Description: "Handles task deadline notifications and user notifications"
   - Technology: React Hooks, Firebase Listeners

#### External Services (Outside Container)

- **Firebase Auth** (Rectangle, External)
- **Firestore** (Cylinder, External)
- **Firebase Storage** (Cylinder, External)
- **Firebase Functions** (Rectangle, External)

### Connections

1. **Authentication Component → Firebase Auth**
   - Label: "authenticate"

2. **Task Management Component → Firestore**
   - Label: "read/write"
   - Description: "tasks collection"

3. **Project Management Component → Firestore**
   - Label: "read/write"
   - Description: "projects collection"

4. **Team Management Component → Firestore**
   - Label: "read/write"
   - Description: "teams, profiles collections"

5. **Reporting Component → Firestore**
   - Label: "read"
   - Description: "aggregate data"

6. **Reporting Component → PDF Export**
   - Label: "generate"
   - Description: "PDF files"

7. **Notification Component → Firestore**
   - Label: "read/write"
   - Description: "notifications collection"

### Draw.io Instructions
1. Draw large dashed rectangle (Front-End Application)
2. Place 6 component rectangles inside
3. Place external services outside
4. Connect components to their respective services

---

## C4: Code Diagram (Class/Module Structure)

### Purpose
Shows how a component is implemented as code.

### Focus: Task Management Component

#### Classes/Modules

1. **TaskValidation Class**
   - Type: Rectangle (Light Blue)
   - Position: Top-left
   - Attributes: None (pure functions)
   - Methods:
     - `validateTaskData(data)`
     - `validateTaskTitle(title)`
     - `validateTaskPriority(priority)`
     - `validateTaskStatus(status)`
     - `sanitizeTaskData(data)`
   - Technology: TypeScript

2. **TaskService Class** (via useFirebaseTasks hook)
   - Type: Rectangle (Light Blue)
   - Position: Top-center
   - Attributes:
     - `tasks[]`
     - `loading: boolean`
     - `error: Error | null`
   - Methods:
     - `createTask(data)`
     - `updateTask(id, data)`
     - `deleteTask(id)`
     - `getTasks()`
     - `getTaskById(id)`
   - Technology: React Hook, Firebase SDK

3. **RecurrenceValidation Class**
   - Type: Rectangle (Light Blue)
   - Position: Top-right
   - Attributes: None (pure functions)
   - Methods:
     - `validateRecurrenceConfig(config)`
     - `calculateRecurringInstances(config)`
     - `generateRecurrenceDates(config)`
   - Technology: TypeScript

4. **TaskCalendar Class** (Component)
   - Type: Rectangle (Light Blue)
   - Position: Bottom-center
   - Attributes:
     - `tasks[]`
     - `selectedDate: Date`
   - Methods:
     - `renderCalendar()`
     - `handleDateSelect(date)`
     - `filterTasksByDate(date)`
   - Technology: React Component

#### Database (External)

- **Firestore Database** (Cylinder, External)
  - Collections: `tasks`, `task_instances`, `notifications`

### Connections

1. **TaskValidation → TaskService**
   - Label: "validates input"
   - Direction: Before create/update

2. **TaskService → Firestore (tasks collection)**
   - Label: "CRUD operations"
   - Description: `addDoc, updateDoc, deleteDoc, getDoc`

3. **RecurrenceValidation → TaskService**
   - Label: "validates recurrence config"
   - Direction: Before creating recurring tasks

4. **TaskCalendar → TaskService**
   - Label: "fetches tasks"
   - Direction: Uses tasks data

5. **TaskService → Firestore (notifications collection)**
   - Label: "creates notifications"
   - Description: "On task creation/deadline"

### Draw.io Instructions
1. Draw 4 component rectangles for classes
2. Draw external database cylinder
3. Show method names inside each class
4. Connect with labeled arrows showing relationships

---

## Additional Diagrams

### Project Management Component (C4)

#### Classes/Modules

1. **ProjectValidation Class**
   - Methods:
     - `validateProjectData(data)`
     - `calculateProjectProgress(tasks)`
     - `determineProjectStatus(project)`
     - `sanitizeProjectData(data)`

2. **ProjectService Class** (via useFirebaseProjects hook)
   - Attributes: `projects[]`, `loading`, `error`
   - Methods:
     - `createProject(data)`
     - `updateProject(id, data)`
     - `deleteProject(id)`
     - `getProjects()`
     - `getProjectById(id)`

3. **ProjectProgress Class**
   - Methods:
     - `calculateProgress(tasks)`
     - `updateProgress(projectId, progress)`

### Team Management Component (C4)

#### Classes/Modules

1. **RBACService Class** (via useFirebaseRBAC hook)
   - Attributes: `userRole`, `teamHierarchy`, `permissions`
   - Methods:
     - `getManagedTeams(userId)`
     - `canViewTask(userId, task)`
     - `canManageTeam(userId, teamId)`
     - `getTeamDescendants(teamId)`
     - `checkPermission(userId, action, resource)`

2. **TeamService Class** (via useFirebaseTeams hook)
   - Methods:
     - `createTeam(data)`
     - `updateTeam(id, data)`
     - `getTeams()`
     - `getTeamHierarchy()`

---

## Draw.io Setup Instructions

### Step 1: Access Draw.io
1. Go to https://app.diagrams.net/ (or draw.io)
2. Create new diagram
3. Choose "Blank Diagram"

### Step 2: Import C4 Stencil (Optional but Recommended)
1. Go to: https://github.com/C4-PlantUML/C4-PlantUML
2. Download C4 shapes
3. In Draw.io: File → Open → Select C4 shapes file
4. Or manually create shapes using standard shapes

### Step 3: Create Shapes
- **Person/User**: Use "Person" shape from shapes panel
- **System**: Use "Rectangle" with rounded corners
- **Container**: Use "Rectangle" (different colors for distinction)
- **Database**: Use "Cylinder" shape
- **Component**: Use "Rectangle" (lighter colors)

### Step 4: Color Scheme
- **Actors**: Blue (#2563EB)
- **System**: Light Blue (#3B82F6)
- **Containers**: Dark Grey (#374151)
- **Components**: Light Blue (#60A5FA)
- **Database**: Dark Grey (#374151)

### Step 5: Labels
- Use text boxes for descriptions
- Place labels on arrows
- Use different font sizes for hierarchy

### Step 6: Export
- File → Export → PNG/SVG
- Recommended resolution: 300 DPI for documentation

---

## Quick Reference: Element Sizes

### C1 Context Diagram
- Person icons: 60x60px
- System rectangle: 400x200px
- Arrow thickness: 2px

### C2 Container Diagram
- Person icons: 50x50px
- System boundary: 800x600px
- Containers: 200x150px
- Database cylinders: 150x100px
- Arrow thickness: 2px

### C3 Component Diagram
- Container boundary: 900x700px
- Components: 250x150px
- External services: 200x120px
- Arrow thickness: 1.5px

### C4 Code Diagram
- Classes: 300x200px
- Database: 200x150px
- Arrow thickness: 1.5px
- Show method names inside classes

---

## Summary

This document provides:
- ✅ Detailed specifications for C1-C4 diagrams
- ✅ Element positions, colors, and descriptions
- ✅ Connection details with labels
- ✅ Draw.io step-by-step instructions
- ✅ Color scheme and sizing guidelines

Use this document as a reference when creating your visual diagrams in Draw.io or any other diagramming tool.

