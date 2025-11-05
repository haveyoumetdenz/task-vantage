# 🚀 Quick Start: E2E Tests

## What Are E2E Tests?

E2E (End-to-End) tests use **Playwright** to open a **real browser** and interact with your app like a real user:
- ✅ Opens Chrome browser automatically
- ✅ Clicks buttons, fills forms
- ✅ Navigates pages
- ✅ **You can watch it happen!**

## 🔒 Is Data Safe?

**YES!** All data goes to **Firestore Emulator** (local test database), NOT production!

---

## 🎬 Quick Start (3 Steps)

### Step 1: Start Firestore Emulator

**Terminal 1:**
```bash
npm run emulator:start
```

Wait for:
```
✔  firestore: Emulator started at http://127.0.0.1:8080
```

**Keep this terminal running!**

---

### Step 2: Build Your App

**Terminal 2:**
```bash
npm run build
```

This builds your app so Playwright can run it.

---

### Step 3: Run E2E Tests

**Still in Terminal 2:**
```bash
# Run all E2E tests (headless - no browser window)
npm run test:e2e

# OR - Watch the browser (recommended for first time!)
npm run test:e2e:headed
```

---

## 👀 Watch Tests Run (Recommended!)

To see the browser actually doing actions:

```bash
npm run test:e2e:headed
```

**What you'll see:**
1. 🌐 Browser window opens
2. 📝 Navigates to login page
3. ✏️ Types email/password
4. 🖱️ Clicks login button
5. 📋 Goes to Tasks page
6. ➕ Clicks "Create Task"
7. 📝 Fills in form
8. ✅ Task appears in list!

**All of this happens automatically, and you can watch it!**

---

## 📝 Available E2E Tests

### ✅ Create Task (TM-COR-01)
**File:** `e2e/tests/create-task.spec.ts`

**What it does:**
- Logs in
- Navigates to Tasks
- Creates a task
- Verifies it appears

**Run it:**
```bash
npm run test:e2e:headed e2e/tests/create-task.spec.ts
```

---

### ✅ Update Task Status (TM-COR-03)
**File:** `e2e/tests/update-task-status.spec.ts`

**What it does:**
- Creates/finds a task
- Opens task details
- Changes status (To Do → In Progress)
- Verifies update

**Run it:**
```bash
npm run test:e2e:headed e2e/tests/update-task-status.spec.ts
```

---

### ✅ Project Management (TGO-COR-01, TGO-COR-03, TGO-COR-04)
**File:** `e2e/tests/project-management.spec.ts`

**What it does:**
- Creates project
- Moves tasks to project
- Creates subtasks
- Verifies everything works

**Run it:**
```bash
npm run test:e2e:headed e2e/tests/project-management.spec.ts
```

---

### ✅ Recurring Tasks (TM-COR-05)
**File:** `e2e/tests/recurring-task.spec.ts`

**What it does:**
- Creates recurring task
- Verifies instances appear
- Tests recurrence logic

**Run it:**
```bash
npm run test:e2e:headed e2e/tests/recurring-task.spec.ts
```

---

## 🐛 Debug Tests

If a test fails, debug it interactively:

```bash
npm run test:e2e:debug
```

This opens Playwright's debug UI where you can:
- Step through tests line by line
- See what the browser sees
- Inspect elements
- Pause and resume

---

## 📊 View Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

This shows:
- Which tests passed/failed
- Screenshots of failures
- Videos of execution
- Debug traces

---

## 🆚 E2E vs Integration Tests

### Integration Tests
- ✅ Fast (no browser)
- ✅ Test data logic
- ✅ Run: `npm run test:emu`
- ❌ No UI interaction

### E2E Tests
- ✅ Real browser
- ✅ Test user workflows
- ✅ See actual UI
- ✅ Run: `npm run test:e2e`
- ❌ Slower (browser overhead)

**Use both!**
- Integration tests for backend logic
- E2E tests for user workflows

---

## 🚨 Troubleshooting

### "Connection refused" to Firestore
**Solution:** Make sure emulator is running:
```bash
npm run emulator:status
npm run emulator:start
```

### "Cannot find module @playwright/test"
**Solution:** Install Playwright:
```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

### Browser doesn't open
**Solution:** Use headed mode:
```bash
npm run test:e2e:headed
```

---

## 🎯 Summary

**To run E2E tests:**
1. Start emulator: `npm run emulator:start`
2. Build app: `npm run build`
3. Run tests: `npm run test:e2e:headed` (watch it!)

**That's it!** 🎉

