# Unit & Integration Testing Guide

This directory contains unit and integration tests for Task Vantage. For comprehensive testing documentation, see [TESTING.md](../../TESTING.md) in the root directory.

## Quick Start

### Unit Tests (No Emulator Required)

```bash
npm run test:run
```

### Integration Tests (Requires Emulator)

1. Start Firestore Emulator:
   ```bash
   npm run emulator:start
   ```

2. Run integration tests:
   ```bash
   npm run test:emu
   ```

## Test Structure

```
src/test/
├── setup.ts                    # Global test setup and mocks
├── emulatorDb.ts              # Emulator connection utilities
├── factories/                  # Test data factories
│   ├── taskFactory.ts
│   ├── projectFactory.ts
│   └── userFactory.ts
├── utils/                      # Test utilities
│   └── test-utils.tsx
└── __tests__/                  # Test files
    ├── *.test.ts              # Unit tests
    └── *.integration.emulator.test.ts  # Integration tests
```

## Test Categories

### Unit Tests

Test individual functions and utilities in isolation:
- Validation logic (`taskValidation.test.ts`, `projectValidation.test.ts`)
- Business logic calculations
- Data transformation utilities
- No external dependencies (mocked)

**Location:** `__tests__/*.test.ts`

### Integration Tests

Test database operations with Firestore Emulator:
- Task creation (TM-COR-01)
- Task status updates (TM-COR-03)
- Project creation (TGO-COR-01)
- Task-project associations (TGO-COR-03)
- Recurring tasks (TM-COR-05)
- Due date management (DST-COR-01)

**Location:** `__tests__/*.integration.emulator.test.ts`

**Requires:** Firestore Emulator running

## Writing Tests

### Test Naming Convention

Follow descriptive naming patterns:

```typescript
describe('Task Validation', () => {
  it('should validate task with all required fields', () => {})
  it('should reject task without title', () => {})
})
```

### Using Factories

Use factories for test data:

```typescript
import { createTaskData } from '@/test/factories/taskFactory'

const taskData = createTaskData({
  title: 'Test Task',
  status: 'todo',
  priority: 5
})
```

### Integration Test Example

```typescript
import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { createTaskEmu } from '@/services/tasks.emu'
import { clearCollection } from '@/test/emulatorDb'

describe('TM-COR-01: Create Task', () => {
  beforeAll(async () => {
    await checkEmulatorConnection()
  })

  beforeEach(async () => {
    await clearCollection('tasks')
  })

  it('should create task with all required fields', async () => {
    const taskData = {
      title: 'Test Task',
      status: 'todo',
      priority: 5,
      assigneeIds: []
    }
    
    const taskId = await createTaskEmu(taskData)
    expect(taskId).toBeTruthy()
  })
})
```

## Emulator Setup

### Starting Emulator

```bash
npm run emulator:start
```

### Emulator Management

- Stop: `npm run emulator:stop`
- Status: `npm run emulator:status`
- Restart: `npm run emulator:restart`

### Emulator Connection

Tests automatically connect to Firestore Emulator at `127.0.0.1:8080` when `FIRESTORE_EMULATOR_HOST` environment variable is set.

## Test Reports

### Console Output

All tests show results in terminal with pass/fail status.

### Coverage Report

Generate HTML coverage report:

```bash
npm run test:coverage
```

View report: `coverage/index.html`

## Troubleshooting

### Emulator Connection Issues

**Error:** `ECONNREFUSED 127.0.0.1:8080`

**Solution:** Ensure Firestore Emulator is running:
```bash
npm run emulator:start
```

### Permission Denied Errors

**Error:** `PERMISSION_DENIED` in integration tests

**Solution:**
1. Check `firestore.rules` file exists
2. Verify `firebase.json` has correct rules path
3. Restart emulator with explicit rules

### Test Timeouts

**Solution:** Increase timeout in test:
```typescript
test.setTimeout(60000) // 60 seconds
```

## Additional Resources

- [Main Testing Guide](../../TESTING.md) - Comprehensive testing documentation
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
