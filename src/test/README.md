# Testing Guide for Task Vantage

This document explains the testing approach used in the Task Vantage project, following Python unittest style patterns adapted for React and Vitest.

## Testing Philosophy

Our testing approach is inspired by Python's unittest framework, providing:
- **Descriptive test names**: Clear, readable test descriptions
- **Helper methods**: Reusable test data factories
- **Setup methods**: Consistent test environment setup
- **Comprehensive coverage**: Happy path, validation, edge cases, and error handling

## Test Structure

### Directory Organization

```
src/test/
├── setup.ts                 # Global test setup and mocks
├── utils/
│   └── test-utils.tsx        # Custom render function with providers
├── factories/
│   ├── taskFactory.ts        # Task data factories
│   ├── projectFactory.ts     # Project data factories
│   └── userFactory.ts        # User data factories
└── __tests__/
    ├── hooks/                # Hook unit tests
    ├── components/           # Component integration tests
    └── pages/               # Page E2E-style tests
```

### Test Categories

1. **Unit Tests** (`hooks/`): Test individual hooks and their logic
2. **Integration Tests** (`components/`): Test component behavior and interactions
3. **E2E Tests** (`pages/`): Test complete user workflows

## Writing Tests

### Test Naming Convention

Follow Python unittest's descriptive naming pattern:

```typescript
// Python unittest style
def test_zone_rule_base_fare_off_peak_no_discounts(self):
    pass

// Our adapted style
it('should create task with all required fields', () => {
  // test implementation
})
```

### Test Structure

Each test file follows this pattern:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFirebaseTasks } from '@/hooks/useFirebaseTasks'
import { createTaskData } from '@/test/factories/taskFactory'

describe('useFirebaseTasks - TM-COR-01 (Create Task)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup mocks
  })

  describe('Task Creation', () => {
    it('should create task with all required fields', async () => {
      // Test implementation
    })
  })
})
```

### Helper Methods (Factories)

Use factories to create test data, similar to Python's `_journey()` pattern:

```typescript
// Python unittest style
def _journey(self):
    return {
        'origin': 'Zone 1',
        'destination': 'Zone 2',
        'time': '09:00'
    }

// Our adapted style
const _createTaskData = (overrides = {}) => {
  return createTaskData({
    title: 'Test Task',
    status: 'todo',
    priority: 1,
    ...overrides,
  })
}
```

## Test Factories

### Task Factory

```typescript
import { createTaskData, createRecurringTaskData } from '@/test/factories/taskFactory'

// Basic task
const task = createTaskData({
  title: 'Custom Task',
  priority: 5,
})

// Recurring task
const recurringTask = createRecurringTaskData({
  title: 'Daily Standup',
  recurrenceConfig: {
    frequency: 'daily',
    interval: 1,
    endCondition: 'after',
    endValue: 7,
  },
})
```

### Project Factory

```typescript
import { createProjectData } from '@/test/factories/projectFactory'

const project = createProjectData({
  title: 'Custom Project',
  status: 'active',
  progress: 50,
})
```

### User Factory

```typescript
import { createUserData, createManagerUser } from '@/test/factories/userFactory'

const user = createUserData({
  role: 'Manager',
  teamId: 'team-123',
})
```

## Mocking Strategy

### Firebase Mocks

```typescript
// Mock Firebase functions
const mockAddDoc = vi.fn()
const mockUpdateDoc = vi.fn()
const mockDeleteDoc = vi.fn()

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ id: 'tasks' })),
  addDoc: () => mockAddDoc(),
  updateDoc: () => mockUpdateDoc(),
  deleteDoc: () => mockDeleteDoc(),
}))
```

### Hook Mocks

```typescript
vi.mock('@/hooks/useFirebaseTasks', () => ({
  useFirebaseTasks: () => ({
    tasks: [],
    loading: false,
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  }),
}))
```

## Test Examples

### Hook Tests

```typescript
describe('useFirebaseTasks - TM-COR-01 (Create Task)', () => {
  it('should create task with all required fields', async () => {
    const { result } = renderHook(() => useFirebaseTasks())
    
    const taskData = createTaskData({
      title: 'Test Task',
      description: 'Test description',
      priority: 3,
    })

    await act(async () => {
      await result.current.createTask(taskData)
    })

    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        title: 'Test Task',
        description: 'Test description',
        priority: 3,
      })
    )
  })
})
```

### Component Tests

```typescript
describe('CreateTaskDialog - TM-COR-01 (Create Task)', () => {
  it('should render all required form fields', () => {
    render(<CreateTaskDialog open={true} onSave={vi.fn()} />)

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
  })
})
```

### Page Tests

```typescript
describe('Tasks Page - TM-COR-01 (Create Task)', () => {
  it('should display created task in list after creation', async () => {
    const user = userEvent.setup()
    render(<Tasks />)

    const createButton = screen.getByRole('button', { name: /create task/i })
    await user.click(createButton)

    // Fill form and submit
    const titleInput = screen.getByLabelText(/title/i)
    await user.type(titleInput, 'New Task')

    const submitButton = screen.getByRole('button', { name: /create task/i })
    await user.click(submitButton)

    // Verify task appears in list
    expect(screen.getByText('New Task')).toBeInTheDocument()
  })
})
```

## Running Tests

### Available Scripts

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests once (for CI)
npm run test:run

# Run tests with coverage
npm run test:coverage
```

### Test Commands

```bash
# Run specific test file
npm test useFirebaseTasks.test.ts

# Run tests matching pattern
npm test -- --grep "Create Task"

# Run tests in specific directory
npm test src/test/__tests__/hooks/
```

## Best Practices

### 1. Test Organization

- Group related tests using `describe` blocks
- Use descriptive test names that explain the scenario
- Follow the AAA pattern: Arrange, Act, Assert

### 2. Mock Management

- Clear mocks between tests using `beforeEach`
- Use specific mocks for each test case
- Mock external dependencies, not the code under test

### 3. Data Management

- Use factories for consistent test data
- Override specific fields when needed
- Keep test data minimal and focused

### 4. Assertions

- Use specific matchers (`toBe`, `toHaveBeenCalledWith`)
- Test both positive and negative cases
- Verify error handling and edge cases

### 5. Async Testing

- Use `waitFor` for async operations
- Use `act` for state updates
- Handle loading states appropriately

## Coverage Goals

- **Hooks**: 90%+ coverage for business logic
- **Components**: 80%+ coverage for user interactions
- **Pages**: 70%+ coverage for critical user flows

## Debugging Tests

### Common Issues

1. **Mock not working**: Check import paths and mock setup
2. **Async operations**: Use `waitFor` and `act` appropriately
3. **Component not rendering**: Check provider setup in test-utils
4. **Firebase errors**: Verify mock implementations

### Debug Commands

```bash
# Run tests with verbose output
npm test -- --reporter=verbose

# Run single test with debug info
npm test -- --grep "specific test name" --reporter=verbose
```

## Contributing

When adding new tests:

1. Follow the existing naming conventions
2. Use appropriate factories for test data
3. Mock external dependencies
4. Test both happy path and error cases
5. Update this documentation if needed

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [User Event](https://testing-library.com/docs/user-event/intro/)




