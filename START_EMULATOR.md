# How to Start Firestore Emulator

## ✅ Firebase CLI is Installed!

Firebase Tools is now installed as a dev dependency in your project.

---

## 🚀 Quick Start

### Option 1: Using npm script (Recommended)

```bash
npm run emulator:start
```

This starts the Firestore Emulator on port 8080.

### Option 2: Using npx

```bash
npx firebase emulators:start --only firestore
```

### Option 3: Using local installation

```bash
./node_modules/.bin/firebase emulators:start --only firestore
```

---

## 📊 What You'll See

When the emulator starts successfully, you'll see:

```
✔  firestore: Emulator started at http://127.0.0.1:8080
```

Keep this terminal running! The emulator must stay running while you run tests.

---

## 🎯 Using the Emulator

### Start Emulator:
```bash
npm run emulator:start
```

### Start Emulator + UI:
```bash
npm run emulator:ui
```
This opens the Emulator UI at http://localhost:4000 where you can see data.

### Stop Emulator:
Press `Ctrl+C` in the terminal where it's running.

---

## ✅ Verify It's Running

Once you see the success message, you can:

1. **Run Integration Tests** (in another terminal):
   ```bash
   npm run test:emu
   ```

2. **Run E2E Tests** (in another terminal):
   ```bash
   npm run build
   npm run test:e2e
   ```

3. **View Emulator UI** (optional):
   - Open: http://localhost:4000
   - See Firestore data in real-time

---

## 🎬 Complete Workflow

**Terminal 1 - Start Emulator:**
```bash
npm run emulator:start
```

**Terminal 2 - Run Tests:**
```bash
# Unit tests (no emulator needed)
npm run test:run

# Integration tests (needs emulator)
npm run test:emu

# E2E tests (needs emulator + build)
npm run build
npm run test:e2e
```

---

**That's it!** Run `npm run emulator:start` to start the Firestore Emulator! 🎉

