# PERMISSION_DENIED - Final Fix

## 🔍 Root Cause Analysis

The PERMISSION_DENIED error persists because:
1. **Rules not loading**: The emulator starts but doesn't load rules from `firestore.rules`
2. **Default restrictive rules**: Emulator applies default restrictive rules when rules file isn't loaded
3. **Connection timing**: `connectFirestoreEmulator` might be called at wrong time

## ✅ Solution Applied

### 1. Fixed Emulator Connection
- Removed conditional logic for `connectFirestoreEmulator`
- Always call `connectFirestoreEmulator` explicitly
- This ensures proper emulator connection regardless of environment variables

### 2. Verified Configuration
- Project ID: `task-vantage-test` (non-demo)
- Rules file: `firestore.rules` with permissive rules
- `firebase.json` has rules path specified

## 🚀 How to Test

### Step 1: Stop All Emulators
```bash
npm run emulator:stop
```

### Step 2: Start Emulator Fresh
```bash
npm run emulator:start
```

Wait for:
```
✔  firestore: Firestore Emulator started at http://127.0.0.1:8080
```

### Step 3: Verify Rules in UI (Optional)
1. Open: http://localhost:4000
2. Go to Firestore tab
3. Check Rules - should show: `allow read, write: if true`

### Step 4: Run Tests
```bash
npm run test:emu
```

## 🔧 If Still Failing

### Check Emulator Logs
Look at the emulator startup output for:
- `Loading rules from firestore.rules`
- Any errors about rules file

### Verify Rules File
```bash
cat firestore.rules
```
Should show: `allow read, write: if true`

### Try Manual Start
```bash
npx firebase emulators:start --only firestore --project task-vantage-test
```

Watch for any errors about rules loading.

## 📝 Key Changes

1. **`src/test/emulatorDb.ts`**: Always call `connectFirestoreEmulator` (no conditional)
2. **Project ID**: Changed to `task-vantage-test` (non-demo)
3. **Rules file**: Verified permissive rules exist

## ⚠️ Important Notes

- The emulator MUST be running before tests
- Rules MUST be loaded from `firestore.rules`
- Project ID in code MUST match `--project` flag in emulator start command

