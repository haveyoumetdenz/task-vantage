# E2E Testing with Playwright

## 🎭 What Are E2E Tests?

E2E (End-to-End) tests open a **real browser** and interact with your application just like a real user would:
- ✅ Opens Chrome/Firefox/Safari
- ✅ Clicks buttons, fills forms, navigates pages
- ✅ Sees the actual UI and interactions
- ✅ Tests complete user journeys

## 🔒 Is Data Entered into the Database?

**Yes, but it goes to the Firestore Emulator, NOT your production database!**

### How It Works:
1. **Firestore Emulator** runs locally (port 8080)
2. **Your app** connects to the emulator during E2E tests
3. **Playwright** opens a browser and interacts with your app
4. **All data** (tasks, projects, etc.) goes to the emulator
5. **Production database** is completely safe ✅

---

## 🚀 Quick Start

### Step 1: Start Firestore Emulator

```bash
# In Terminal 1
firebase emulators:start --only firestore
```

Keep this terminal running! The emulator must be running during tests.

### Step 2: Build Your App

```bash
# In Terminal 2
npm run build
```

### Step 3: Run E2E Tests

```bash
# Playwright will automatically:
# 1. Start the preview server (npm run preview)
# 2. Open a browser
# 3. Run the tests
# 4. Show you what's happening
npm run test:e2e
```

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
- Everything happening in real-time!

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
- Pause and resume execution

---

## 📝 Current E2E Tests

### ✅ TM-COR-01: Create Task
**File:** `e2e/tests/create-task.spec.ts`

**What it tests:**
- User logs in
- Navigates to Tasks page
- Clicks "Create Task" button
- Fills in task form
- Submits form
- Verifies task appears in list

**What you'll see:**
- Browser opens
- Login page loads
- User types email/password
- Clicks login
- Tasks page loads
- Dialog opens
- Form gets filled
- Task appears in list!

---

### ✅ TM-COR-03: Change Task Status
**File:** `e2e/tests/update-task-status.spec.ts`

**What it tests:**
- User creates or finds a task
- Opens task details
- Changes status from "To Do" to "In Progress"
- Verifies status updates
- Verifies success message appears

**What you'll see:**
- Task card appears
- User clicks on task
- Status dropdown changes
- Save button clicked
- Success message appears
- Status updates in list!

---

## 🔧 Configuration

### playwright.config.ts

The configuration file (`playwright.config.ts`) sets up:
- **Base URL:** `http://localhost:4173` (Vite preview server)
- **Browser:** Chromium (can add Firefox, Safari)
- **Screenshots:** Taken on failure
- **Videos:** Recorded on failure
- **Emulator:** Automatically configured to use Firestore Emulator

### Environment Variables

The config automatically sets:
```bash
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
USE_FIREBASE_EMULATOR=true
```

This ensures your app connects to the emulator, not production!

---

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

This shows:
- Which tests passed/failed
- Screenshots of failures
- Videos of test execution
- Trace files for debugging

---

## 🎯 Example: What Happens During a Test

Let's trace through `create-task.spec.ts`:

```typescript
test('should create a task through the UI', async ({ page }) => {
  // 1. Browser opens and navigates to /login
  await page.goto('/login')
  
  // 2. You'll see the login form appear
  await page.fill('[name="email"]', 'test@example.com')
  // Email field gets filled in the browser
  
  await page.fill('[name="password"]', 'password123')
  // Password field gets filled
  
  await page.click('button[type="submit"]')
  // Submit button gets clicked - you'll see it happen!
  
  // 3. App navigates to Tasks page
  await page.goto('/tasks')
  // Browser navigates to /tasks
  
  // 4. Create Task button gets clicked
  await page.click('button:has-text("Create Task")')
  // Dialog opens - you'll see it!
  
  // 5. Form gets filled
  await page.fill('[name="title"]', 'E2E Test Task')
  // Title field gets filled
  
  // 6. Submit button clicked
  await page.click('button:has-text("Create")')
  // Task gets created - data goes to Firestore Emulator!
  
  // 7. Verify task appears
  await expect(page.locator('text=E2E Test Task')).toBeVisible()
  // Task appears in the list - you'll see it!
})
```

**All of this happens in a real browser, and you can watch it!**

---

## 🆚 E2E Tests vs Integration Tests

### Integration Tests (Vitest + Firestore Emulator)
- ✅ Fast (no browser)
- ✅ Test backend logic
- ✅ Test data validation
- ❌ No UI interaction
- ❌ No real user experience

### E2E Tests (Playwright + Browser)
- ✅ Real browser interaction
- ✅ Test complete user journeys
- ✅ See actual UI behavior
- ✅ Test user experience
- ❌ Slower (browser overhead)
- ❌ More complex setup

**Use both:**
- **Integration Tests** for backend/data logic
- **E2E Tests** for user workflows

---

## 🎨 Tips for Writing E2E Tests

### 1. Use Data Attributes
Add `data-testid` to your components:

```tsx
<button data-testid="create-task-button">Create Task</button>
```

Then in tests:
```typescript
await page.click('[data-testid="create-task-button"]')
```

### 2. Wait for Elements
Always wait for elements to appear:

```typescript
await page.waitForSelector('[name="title"]', { timeout: 5000 })
await page.fill('[name="title"]', 'Task Title')
```

### 3. Use Text Selectors Sparingly
Text can change, but if needed:
```typescript
await page.click('text=Create Task')
```

### 4. Take Screenshots
Playwright automatically takes screenshots on failure, but you can also:
```typescript
await page.screenshot({ path: 'screenshot.png' })
```

---

## 🚨 Troubleshooting

### "Connection refused" to Firestore Emulator
**Solution:** Make sure Firestore Emulator is running:
```bash
firebase emulators:start --only firestore
```

### "Cannot find module @playwright/test"
**Solution:** Install Playwright:
```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

### Tests are slow
**Solution:** 
- Use `headed: false` for faster runs
- Run specific tests: `npx playwright test e2e/tests/create-task.spec.ts`
- Use `--workers=1` to run sequentially

### Browser doesn't open
**Solution:** Use headed mode:
```bash
npm run test:e2e:headed
```

---

## 📚 Next Steps

1. ✅ Run existing E2E tests
2. [ ] Add more E2E tests for other user stories
3. [ ] Create page objects for reusable components
4. [ ] Add test fixtures for authentication
5. [ ] Integrate into CI/CD pipeline

---

## 🔗 Related Documentation

- [Playwright Documentation](https://playwright.dev/)
- [E2E Testing Setup Guide](../E2E_TESTING_SETUP.md)
- [Comprehensive Testing Strategy](../COMPREHENSIVE_TESTING_STRATEGY.md)

---

**Happy Testing! 🎉**

