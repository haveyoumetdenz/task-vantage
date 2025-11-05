# E2E Tests - Emulator Connection Fix

## ✅ Problem Fixed

E2E tests were failing because the app was **not connecting to the Firestore Emulator** during tests. Instead, tests were hitting the **production Firebase database**, which caused:
- Timeouts (production is slower)
- Permission errors
- Data pollution risks
- Test failures

## 🔧 Solution Applied

### 1. Updated Firebase Client (`src/integrations/firebase/client.ts`)
- Added automatic emulator detection via environment variables
- Connects to Firestore Emulator when `USE_FIREBASE_EMULATOR=true`
- Uses test project ID (`task-vantage-test`) when emulator is enabled
- Handles Auth and Storage emulators (if needed later)

### 2. Updated Playwright Config (`playwright.config.ts`)
- Added `VITE_USE_FIREBASE_EMULATOR` and `VITE_FIRESTORE_EMULATOR_HOST` environment variables
- These are passed to the Vite preview server during E2E tests

## 🎯 Why Use Emulator for E2E Tests?

### ✅ **Advantages of Emulator:**
1. **No Cost** - Free to run unlimited tests
2. **No Data Pollution** - Tests don't affect production data
3. **Isolated Tests** - Each test run starts fresh
4. **Faster** - Local emulator is faster than cloud requests (once configured)
5. **Safe** - Can test destructive operations without risk
6. **Offline** - Works without internet connection

### ❌ **Disadvantages of Production Firebase:**
1. **Cost** - Every read/write costs money
2. **Data Pollution** - Tests create real data that needs cleanup
3. **Slow** - Network latency for every operation
4. **Risk** - Could accidentally delete/modify production data
5. **Flaky** - Network issues can cause test failures

## 🚀 How to Run E2E Tests Now

### Prerequisites:
1. **Start Firestore Emulator** (in one terminal):
   ```bash
   npm run emulator:start
   ```
   Wait for: `✔  firestore: Firestore Emulator started at http://127.0.0.1:8080`

2. **Build the app** (in another terminal):
   ```bash
   npm run build
   ```

3. **Run E2E tests**:
   ```bash
   npm run test:e2e
   ```

## 📋 Complete Test Workflow

### Terminal 1 - Start Emulator:
```bash
npm run emulator:start
```

### Terminal 2 - Run All Tests:
```bash
# Unit tests (no emulator needed)
npm run test:run

# Integration tests (needs emulator)
npm run test:emu

# E2E tests (needs emulator + build)
npm run build
npm run test:e2e
```

## 🔍 How It Works

1. **Playwright** starts the Vite preview server with environment variables:
   - `VITE_USE_FIREBASE_EMULATOR=true`
   - `VITE_FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`

2. **Vite** passes these to the app during build/preview

3. **Firebase Client** (`src/integrations/firebase/client.ts`) detects the environment variables and:
   - Uses test project ID (`task-vantage-test`)
   - Connects to Firestore Emulator at `127.0.0.1:8080`
   - All database operations go to the emulator (not production)

4. **Tests** run against the emulator, creating/modifying test data safely

## ✅ Verification

When E2E tests start, you should see in the browser console:
```
✅ Connected to Firestore Emulator at 127.0.0.1:8080
```

## 🎉 Result

- **E2E tests now use the emulator** (not production)
- **No cost** for running tests
- **No data pollution** in production
- **Faster and more reliable** tests
- **Safe to run destructive tests**

## 📝 Notes

- The emulator MUST be running before E2E tests
- If tests fail, check that the emulator is running: `npm run emulator:status`
- The emulator connection is automatic - no code changes needed in tests
- All tests use the same emulator instance (data is isolated per test run)

