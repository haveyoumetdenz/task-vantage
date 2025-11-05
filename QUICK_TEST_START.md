# Quick Test Start Guide

## ✅ Unit Tests (No Setup Required!)

**Just run:**
```bash
npm run test:run
```

✅ **362 unit tests passing** - No emulator needed!

---

## ⚠️ Integration Tests (Requires Emulator)

**Problem:** Integration tests are failing because Firestore Emulator isn't running.

### Solution:

**Terminal 1 - Start Firestore Emulator:**
```bash
firebase emulators:start --only firestore
```

**Keep this terminal running!** You should see:
```
✔  firestore: Emulator started at http://127.0.0.1:8080
```

**Terminal 2 - Run Integration Tests:**
```bash
npm run test:emu
```

---

## ⚠️ E2E Tests (Requires Emulator + Build)

**Problem:** E2E tests are being picked up by Vitest instead of Playwright.

### Solution:

E2E tests should be run with **Playwright**, not Vitest:

**Terminal 1 - Start Firestore Emulator:**
```bash
firebase emulators:start --only firestore
```

**Terminal 2 - Build and Run E2E Tests:**
```bash
npm run build
npm run test:e2e
```

**Note:** E2E tests use `playwright test`, not `vitest`!

---

## 🎯 Recommended Workflow

### For Development (Fastest):
```bash
# Just run unit tests - no setup needed!
npm run test:run
```

### For Full Testing:
```bash
# Terminal 1
firebase emulators:start --only firestore

# Terminal 2
npm run test:run      # Unit tests (362 tests)
npm run test:emu      # Integration tests (requires emulator)
npm run build && npm run test:e2e  # E2E tests (requires emulator + build)
```

---

## 🔍 What's Happening

1. **Unit Tests** ✅ - All passing (362 tests)
   - No emulator needed
   - Test validation logic only

2. **Integration Tests** ⚠️ - Need emulator running
   - Error: `ECONNREFUSED` means emulator isn't running
   - Solution: Start Firestore Emulator first

3. **E2E Tests** ⚠️ - Need emulator + build
   - Error: Vitest is picking them up (should use Playwright)
   - Solution: Run with `npm run test:e2e` (uses Playwright)

---

## ✅ Quick Fix Summary

**To run unit tests only (working now):**
```bash
npm run test:run
```

**To run integration tests:**
```bash
# Terminal 1
firebase emulators:start --only firestore

# Terminal 2  
npm run test:emu
```

**To run E2E tests:**
```bash
# Terminal 1
firebase emulators:start --only firestore

# Terminal 2
npm run build
npm run test:e2e
```

---

**That's it!** Unit tests work immediately, integration/E2E tests need the emulator running first.

