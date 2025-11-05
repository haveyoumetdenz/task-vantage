# How to Run Tests

Quick guide for running all test types in Task Vantage.

---

## 🚀 Quick Start

### Option 1: Unit Tests Only (Fastest - No Setup Required)

```bash
npm run test:run
```

**What it does:**
- Runs all unit tests (362 tests)
- No emulator needed
- Tests validation logic only
- **Result:** All tests should pass ✅

---

### Option 2: Unit + Integration Tests (Requires Emulator)

#### Step 1: Start Firestore Emulator

**Terminal 1:**
```bash
firebase emulators:start --only firestore
```

**Keep this terminal running!** You should see:
```
✔  firestore: Emulator started at http://127.0.0.1:8080
```

#### Step 2: Run Tests

**Terminal 2:**
```bash
# Run unit tests
npm run test:run

# Run integration tests
npm run test:emu
```

---

### Option 3: All Tests Including E2E (Full Setup)

#### Step 1: Start Firestore Emulator

**Terminal 1:**
```bash
firebase emulators:start --only firestore
```

**Keep this terminal running!**

#### Step 2: Build App

**Terminal 2:**
```bash
npm run build
```

#### Step 3: Run All Tests

**Terminal 2 (continued):**
```bash
# Unit tests
npm run test:run

# Integration tests
npm run test:emu

# E2E tests (browser automation)
npm run test:e2e
```

---

## 📋 Available Test Commands

| Command | What It Runs | Emulator Needed? | Build Needed? |
|---------|--------------|------------------|---------------|
| `npm run test:run` | Unit tests | ❌ No | ❌ No |
| `npm run test:emu` | Integration tests | ✅ Yes | ❌ No |
| `npm run test:e2e` | E2E tests (browser) | ✅ Yes | ✅ Yes |
| `npm run test:coverage` | Unit tests with coverage | ❌ No | ❌ No |
| `npm run test:ui` | Interactive test UI | ❌ No | ❌ No |
| `npm run test:watch` | Watch mode | ❌ No | ❌ No |

---

## 🎯 Test Types Explained

### Unit Tests (`npm run test:run`)
- **What:** Tests validation logic and utility functions
- **Speed:** Very fast (~1-2 seconds)
- **Setup:** None required
- **Tests:** 362 tests
- **Example:** Tests email validation, password validation, task status transitions

### Integration Tests (`npm run test:emu`)
- **What:** Tests Firestore operations with real emulator
- **Speed:** Fast (~5-10 seconds)
- **Setup:** Firestore Emulator must be running
- **Tests:** 7 test suites
- **Example:** Tests creating tasks in Firestore, reading them back

### E2E Tests (`npm run test:e2e`)
- **What:** Tests complete user workflows in real browser
- **Speed:** Slower (~30-60 seconds)
- **Setup:** Firestore Emulator + App build required
- **Tests:** 4 test suites
- **Example:** Tests user logging in, creating task, seeing it in list

---

## 🐛 Troubleshooting

### Problem: "Connection refused" to Firestore Emulator

**Solution:** Make sure Firestore Emulator is running:
```bash
firebase emulators:start --only firestore
```

Check that you see:
```
✔  firestore: Emulator started at http://127.0.0.1:8080
```

### Problem: "Cannot find module @playwright/test"

**Solution:** Install Playwright:
```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

### Problem: E2E tests fail with "Cannot connect to localhost:4173"

**Solution:** Make sure you built the app:
```bash
npm run build
```

The E2E tests automatically start the preview server, but you need to build first.

### Problem: Tests are slow

**Solution:** 
- Run specific tests: `npm run test:run src/test/__tests__/taskValidation.test.ts`
- Run in watch mode: `npm run test:watch`
- Use test UI: `npm run test:ui`

---

## 📊 View Test Results

### Unit Tests
```bash
npm run test:run
```

Output shows:
```
✓ src/test/__tests__/taskValidation.test.ts (36 tests) 8ms
✓ src/test/__tests__/authValidation.test.ts (30 tests) 6ms
...
Test Files  29 passed (29)
Tests  362 passed (362)
```

### Integration Tests
```bash
npm run test:emu
```

Output shows:
```
✓ src/test/__tests__/tasks.integration.emulator.test.ts (2 tests)
✓ src/test/__tests__/subtasks.integration.emulator.test.ts (5 tests)
...
```

### E2E Tests
```bash
npm run test:e2e
```

Output shows:
```
Running 4 tests using 1 worker
✓ e2e/tests/create-task.spec.ts (2 tests)
✓ e2e/tests/update-task-status.spec.ts (1 test)
...
```

### View E2E Test Report
```bash
npx playwright show-report
```

Opens HTML report with:
- Test results
- Screenshots of failures
- Videos of test execution

---

## 🎬 Watch Tests Run (Headed Mode)

To see the browser actually doing the actions:

```bash
npm run test:e2e:headed
```

This opens a visible browser window so you can watch:
- Pages loading
- Forms being filled
- Buttons being clicked
- Tasks being created

---

## 🔍 Debug Tests

### Debug Unit Tests
```bash
npm run test:ui
```

Opens interactive test UI where you can:
- See all tests
- Run specific tests
- See test results in real-time

### Debug E2E Tests
```bash
npm run test:e2e:debug
```

Opens Playwright's debug UI where you can:
- Step through tests line by line
- See what the browser sees
- Inspect elements
- Pause and resume execution

---

## 📈 Test Coverage

To see test coverage:

```bash
npm run test:coverage
```

This generates:
- Coverage report in terminal
- HTML report in `coverage/` folder
- Coverage thresholds: 80% for branches, functions, lines, statements

---

## ✅ Expected Results

### Unit Tests
- **Status:** ✅ All passing
- **Tests:** 362 tests
- **Time:** ~1-2 seconds
- **Result:** All tests should pass

### Integration Tests
- **Status:** ✅ All passing (when emulator running)
- **Tests:** 7 test suites
- **Time:** ~5-10 seconds
- **Result:** All tests should pass

### E2E Tests
- **Status:** ✅ All passing (when emulator + build ready)
- **Tests:** 4 test suites
- **Time:** ~30-60 seconds
- **Result:** All tests should pass

---

## 🎯 Quick Reference

### Run Everything (Recommended)
```bash
# Terminal 1
firebase emulators:start --only firestore

# Terminal 2
npm run build
npm run test:run
npm run test:emu
npm run test:e2e
```

### Run Just Unit Tests (Fastest)
```bash
npm run test:run
```

### Run Just Integration Tests
```bash
# Terminal 1
firebase emulators:start --only firestore

# Terminal 2
npm run test:emu
```

### Run Just E2E Tests
```bash
# Terminal 1
firebase emulators:start --only firestore

# Terminal 2
npm run build
npm run test:e2e
```

---

**That's it! Happy testing! 🎉**

