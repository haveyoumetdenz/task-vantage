# Fix PERMISSION_DENIED Error

## 🔍 Root Cause

The PERMISSION_DENIED error occurs because:
1. **Demo project ID restriction**: Using `demo-task-vantage` as project ID causes Firebase to treat it as a demo project with restrictions
2. **Rules not loading**: The emulator may not be loading rules correctly from `firebase.json`

## ✅ Solution Applied

### 1. Changed Project ID
- **Before:** `demo-task-vantage` (demo project with restrictions)
- **After:** `task-vantage-test` (non-demo project)

### 2. Updated Files
- `src/test/emulatorDb.ts` - Changed project ID to `task-vantage-test`
- `package.json` - Updated emulator start command to use `task-vantage-test`
- `firebase.json` - Added explicit rules path in emulator config

### 3. Verified Rules File
- `firestore.rules` has permissive rules: `allow read, write: if true`

## 🚀 How to Use

### Start Emulator:
```bash
npm run emulator:stop  # Clean up first
npm run emulator:start
```

### Run Integration Tests:
```bash
npm run test:emu
```

## ✅ Verification

After starting emulator, you should see:
```
✔  firestore: Firestore Emulator started at http://127.0.0.1:8080
```

Then tests should pass without PERMISSION_DENIED errors.

