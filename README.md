# Task Flow

A modern, full-stack task management application with team collaboration, project tracking, and analytics capabilities. Built with React, TypeScript, Firebase, and a comprehensive testing suite.

## Features

- **Task Management**: Create, assign, and track tasks with priorities, due dates, and statuses
- **Project Management**: Organize tasks into projects with progress tracking
- **Team Collaboration**: Role-based access control with team hierarchy support
- **Recurring Tasks**: Create tasks that repeat on a schedule
- **Calendar View**: Visual calendar interface for task and project deadlines
- **Analytics & Reports**: Generate team performance reports and analytics
- **Real-time Updates**: Live synchronization across all clients
- **Notifications**: Task assignment and deadline notifications
- **Activity Logs**: Track changes and comments on tasks and projects

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** (comes with Node.js)
- **Firebase CLI** - Install globally: `npm install -g firebase-tools`

## Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd spm-taskflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Install Firebase CLI: `npm install -g firebase-tools`
   - Login to Firebase: `firebase login`
   - Initialize Firebase (if not already done): `firebase init`

## Environment Setup

The application uses Firebase for backend services. For local development with emulators:

1. **Start Firebase Emulators**
   ```bash
   npm run emulator:start
   ```
   This starts:
   - Firestore Emulator on port 8080
   - Auth Emulator on port 9099

2. **Environment Variables**
   The application automatically connects to emulators when running in development mode.

## Running the Application

### Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

The preview server will be available at `http://localhost:4173`

## Testing

The project includes comprehensive testing with unit, integration, and E2E tests. See [TESTING.md](./TESTING.md) for detailed testing documentation.

### Quick Test Commands

- **Unit Tests**: `npm run test:run`
- **Integration Tests**: `npm run test:emu` (requires emulator)
- **E2E Tests**: `npm run test:e2e` (requires emulator)
- **Coverage**: `npm run test:coverage`

## Firebase Emulators

### Start Emulators

```bash
npm run emulator:start
```

### Emulator Management

- **Stop emulators**: `npm run emulator:stop`
- **Check status**: `npm run emulator:status`
- **Restart**: `npm run emulator:restart`

### Emulator UI

Access the Firebase Emulator UI at `http://localhost:4000` (if configured)

## Project Structure

```
spm-taskflow/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── auth/       # Authentication components
│   │   ├── calendar/   # Calendar components
│   │   ├── forms/      # Form components
│   │   ├── layout/     # Layout components
│   │   ├── reports/    # Analytics components
│   │   ├── tasks/      # Task-specific components
│   │   └── ui/         # Base UI components
│   ├── contexts/       # React contexts
│   ├── hooks/         # Custom hooks (Firebase data management)
│   ├── integrations/  # External service integrations
│   ├── pages/         # Page components
│   ├── services/      # Service layer
│   ├── test/          # Test utilities and setup
│   └── utils/         # Utility functions
├── e2e/               # E2E tests (Playwright)
├── functions/         # Firebase Cloud Functions
├── public/            # Static assets
└── scripts/           # Utility scripts
```

## Technology Stack

- **Frontend**: React 18.3.1, TypeScript 5.8.3, Vite 5.4.19
- **UI**: Tailwind CSS, Radix UI, Shadcn/ui
- **Backend**: Firebase 12.3.0 (Firestore, Auth, Functions)
- **State Management**: TanStack Query, React Context
- **Forms**: React Hook Form, Zod validation
- **Testing**: Vitest, Playwright, React Testing Library
- **Build Tool**: Vite with SWC compiler

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build

### Testing
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run test:emu` - Run integration tests (requires emulator)
- `npm run test:e2e` - Run E2E tests
- `npm run test:e2e:report` - View E2E test report

### Emulators
- `npm run emulator:start` - Start Firebase emulators
- `npm run emulator:stop` - Stop emulators
- `npm run emulator:status` - Check emulator status
- `npm run emulator:restart` - Restart emulators

### Code Quality
- `npm run lint` - Run ESLint

## Deployment

### Firebase Hosting

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy --only hosting
   ```

### Firebase Functions

Deploy Cloud Functions:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm run test:run && npm run test:emu`
4. Commit your changes
5. Push to your branch
6. Create a Pull Request

## Documentation

- [Testing Guide](./TESTING.md) - Comprehensive testing documentation
- [Architecture Diagrams](./C4_ARCHITECTURE_DIAGRAMS.md) - System architecture
- [RBAC System](./RBAC_SYSTEM.md) - Role-based access control
- [Tech Stack Overview](./TECH_STACK_OVERVIEW.md) - Detailed technology stack

## License

This project is private and proprietary.
