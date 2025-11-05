# Test Failures - Analysis & Fixes

## 🔍 Issues Found

### 1. **Unit Tests: 3 Failures**

#### a) Notifications Test - Query Issue
**Error:** `expected 5 to be 2`
**Cause:** Previous test data not cleared between tests
**Fix:** Added `await clearNotifications()` at start of test

#### b) Projects Test - Timeout
**Error:** `Test timed out in 10000ms`
**Cause:** Query getting all tasks instead of filtering by projectId
**Fix:** Use `query()` with `where()` clause instead of `getDocs()` then filter

#### c) Task Status Test - Task Not Found
**Error:** `Task not found`
**Cause:** Task not fully created before reading
**Fix:** Added wait and existence check before update

---

### 2. **Integration Tests: PERMISSION_DENIED**

**Error:** `7 PERMISSION_DENIED: Permission denied on resource project demo-task-vantage`
**Cause:** Firestore Emulator rules not being loaded/applied correctly
**Status:** Emulator is running but rules aren't being applied

**Possible Causes:**
1. Rules file not being loaded on emulator start
2. Emulator needs to be restarted with rules explicitly loaded
3. Project ID mismatch

**Fixes Applied:**
- Added `--import=./.firebase-emulator-data --export-on-exit` to emulator start command
- Ensured `firestore.rules` has permissive rules: `allow read, write: if true`
- Verified `firebase.json` has correct rules path

---

### 3. **E2E Tests: Timeout Errors**

**Error:** `page.waitForURL: Timeout 10000ms exceeded`
**Cause:** App not navigating to expected routes, likely:
1. Authentication not working in test environment
2. App not connecting to Firestore Emulator correctly
3. Routes not matching expected patterns

**Fixes Needed:**
- Check if app is configured to use emulator in E2E tests
- Verify authentication setup in test environment
- Update route patterns or increase timeout

---

## ✅ Fixes Applied

### 1. Fixed Notifications Test
```typescript
it('should query notifications by userId', async () => {
  // Clear notifications first to ensure clean state
  await clearNotifications()
  // ... rest of test
})
```

### 2. Fixed Projects Test
```typescript
// Use query with where clause instead of get all then filter
const q1 = query(collection(db, 'tasks'), where('projectId', '==', projectId))
const snap1 = await getDocs(q1)
```

### 3. Fixed Task Status Test
```typescript
// Wait and verify task exists before updating
await new Promise(resolve => setTimeout(resolve, 100))
const beforeUpdate = await getTaskByIdEmu(taskId)
expect(beforeUpdate.exists).toBe(true)
```

### 4. Updated Emulator Start Command
```json
"emulator:start": "firebase emulators:start --only firestore --project demo-task-vantage --import=./.firebase-emulator-data --export-on-exit"
```

---

## 🚀 Next Steps

### To Fix PERMISSION_DENIED:

1. **Restart Emulator:**
   ```bash
   npm run emulator:stop
   npm run emulator:start
   ```

2. **Verify Rules are Loaded:**
   - Check emulator UI: http://localhost:4000
   - Verify rules show: `allow read, write: if true`

3. **If Still Failing:**
   - Check if emulator needs to be started with explicit rules flag
   - Verify `firestore.rules` file exists and is valid
   - Check emulator logs for rule loading errors

### To Fix E2E Tests:

1. **Check App Configuration:**
   - Verify `FIRESTORE_EMULATOR_HOST` is set in Playwright config
   - Check if app initializes Firebase with emulator connection

2. **Update Test Routes:**
   - Check actual routes in app
   - Update route patterns or remove authentication requirement for tests

3. **Increase Timeouts:**
   - If app is slow to load, increase timeout values

---

## 📊 Test Status Summary

| Test Type | Status | Issues | Fixes Applied |
|-----------|--------|--------|---------------|
| **Unit Tests** | ⚠️ 3 failures | Data cleanup, query logic | ✅ Fixed |
| **Integration Tests** | ❌ PERMISSION_DENIED | Rules not loading | 🔄 Needs restart |
| **E2E Tests** | ❌ Timeouts | Navigation issues | 🔄 Needs investigation |

---

## 🎯 Verification Steps

After fixes:

1. **Unit Tests:**
   ```bash
   npm run test:run
   ```
   Should show: All tests passing

2. **Integration Tests:**
   ```bash
   npm run emulator:stop
   npm run emulator:start  # Wait for ready
   npm run test:emu
   ```
   Should show: No PERMISSION_DENIED errors

3. **E2E Tests:**
   ```bash
   npm run build
   npm run test:e2e
   ```
   Should show: Tests passing or different errors (not timeouts)

