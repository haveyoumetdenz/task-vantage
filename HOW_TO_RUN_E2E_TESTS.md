# How to Run E2E Tests (Browser Automation)

## 🎭 What Are E2E Tests?

E2E (End-to-End) tests use **Playwright** to open a **real browser** and interact with your application like a real user would:

- ✅ Opens Chrome browser
- ✅ Clicks buttons, fills forms
- ✅ Navigates between pages
- ✅ Creates tasks, updates projects
- ✅ **You can watch it happen!**

## 🔒 Is Data Going to Production Database?

**NO!** All data goes to **Firestore Emulator** (local test database).

### How It Works:
1. **Firestore Emulator** runs on your machine (port 8080)
2. Your app connects to the emulator during tests
3. Playwright opens a browser and interacts with your app
4. All data (tasks, projects, etc.) goes to the emulator
5. **Production database is completely safe** ✅

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start Firestore Emulator

Open **Terminal 1** and run:

```bash
firebase emulators:start --only firestore
```

**Keep this terminal running!** The emulator must stay running during tests.

You should see:
```
✔  firestore: Emulator started at http://127.0.0.1:8080
```

### Step 2: Build Your App

Open **Terminal 2** and run:

```bash
npm run build
```

This builds your app so Playwright can run it.

### Step 3: Run E2E Tests

Still in **Terminal 2**, run:

```bash
npm run test:e2e
```

**What happens:**
1. Playwright starts the preview server (`npm run preview`)
2. Browser opens (Chrome)
3. Tests run automatically
4. You'll see the browser perform actions!

---

## 👀 Watch Tests Run (See the Browser)

To see the browser actually doing the actions:

```bash
npm run test:e2e:headed
```

This opens a **visible browser window** so you can watch:
- Pages loading
- Forms being filled
- Buttons being clicked
- Tasks being created
- Everything in real-time!

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

## 📝 What Tests Are Available?

### ✅ Create Task (TM-COR-01)
**File:** `e2e/tests/create-task.spec.ts`

**What it does:**
1. Opens browser → Goes to login page
2. Logs in as test user
3. Navigates to Tasks page
4. Clicks "Create Task" button
5. Fills in task form (title, priority)
6. Submits form
7. Verifies task appears in list

**Watch it:**
```bash
npm run test:e2e:headed e2e/tests/create-task.spec.ts
```

### ✅ Update Task Status (TM-COR-03)
**File:** `e2e/tests/update-task-status.spec.ts`

**What it does:**
1. Creates or finds a task
2. Opens task details
3. Changes status (To Do → In Progress)
4. Saves changes
5. Verifies status updated

---

## 🎬 Example: Running Your First Test

```bash
# Terminal 1: Start Emulator
firebase emulators:start --only firestore

# Terminal 2: Build and Run
npm run build
npm run test:e2e:headed e2e/tests/create-task.spec.ts
```

**What you'll see:**
1. Browser window opens
2. Navigates to login page
3. Email/password fields get filled
4. Login button clicked
5. App navigates to Tasks page
6. "Create Task" button clicked
7. Dialog opens
8. Form gets filled
9. Submit button clicked
10. Task appears in list!

**All of this happens automatically, and you can watch it!**

---

## 🔧 Configuration

### Environment Setup

The `playwright.config.ts` automatically:
- Starts the preview server
- Points app to Firestore Emulator (`127.0.0.1:8080`)
- Configures browser settings
- Takes screenshots on failure

### Running Specific Tests

```bash
# Run one test file
npx playwright test e2e/tests/create-task.spec.ts

# Run one test
npx playwright test e2e/tests/create-task.spec.ts -g "should create a task"

# Run with UI mode
npx playwright test --ui
```

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

### Integration Tests (Current)
- Fast (no browser)
- Test data logic
- Use Firestore Emulator
- Run: `npm run test:emu`

### E2E Tests (New!)
- Real browser
- Test user workflows
- Use Firestore Emulator
- Run: `npm run test:e2e`

**Both use the emulator, but E2E tests use a real browser!**

---

## 🚨 Troubleshooting

### Problem: "Connection refused" to Firestore
**Solution:** Make sure emulator is running:
```bash
firebase emulators:start --only firestore
```

### Problem: "Cannot find module @playwright/test"
**Solution:** Install Playwright:
```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

### Problem: Browser doesn't open
**Solution:** Use headed mode:
```bash
npm run test:e2e:headed
```

### Problem: Tests are slow
**Solution:** 
- Run specific tests
- Use `--workers=1` for sequential execution
- Close other apps

---

## 📚 Next Steps

1. ✅ Run existing E2E tests
2. [ ] Add more E2E tests for other user stories
3. [ ] Create page objects for reusable code
4. [ ] Add authentication fixtures
5. [ ] Integrate into CI/CD

---

## 🎯 Summary

**E2E Tests:**
- ✅ Open real browser
- ✅ Interact with real UI
- ✅ Test complete user journeys
- ✅ Use Firestore Emulator (safe!)
- ✅ You can watch them run!

**To run:**
1. Start Firestore Emulator
2. Build app
3. Run `npm run test:e2e`

**That's it!** 🎉

