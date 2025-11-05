# Firebase Emulator Troubleshooting Guide

## 🚨 Port Already in Use Error

If you see:
```
Error: Port 8080 is already in use
```

This means the Firebase Emulator is already running or a previous process didn't shut down cleanly.

---

## ✅ Quick Fix

### Option 1: Use the Helper Script (Recommended)
```bash
# Stop any running emulators
npm run emulator:stop

# Check status
npm run emulator:status

# Start emulator
npm run emulator:start
```

### Option 2: Manual Cleanup
```bash
# Kill process on port 8080
lsof -ti :8080 | xargs kill -9

# Or kill all Firebase processes
pkill -f firebase
```

---

## 🔍 Check What's Using the Port

```bash
# Check what's using port 8080
lsof -i :8080

# Check what's using port 4000 (UI)
lsof -i :4000

# Check for Firebase processes
ps aux | grep firebase | grep -v grep
```

---

## 📋 Complete Workflow

### Step 1: Stop Any Running Emulators
```bash
npm run emulator:stop
```

### Step 2: Verify Ports Are Free
```bash
npm run emulator:status
```

Should show:
```
❌ Firestore Emulator: NOT RUNNING (port 8080)
❌ Emulator UI: NOT RUNNING (port 4000)
```

### Step 3: Start Emulator
```bash
npm run emulator:start
```

Wait for:
```
✔  firestore: Emulator started at http://127.0.0.1:8080
```

### Step 4: Run Tests (in another terminal)
```bash
npm run test:emu      # Integration tests
npm run test:e2e      # E2E tests (after build)
```

---

## 🛠️ Advanced Troubleshooting

### Multiple Emulator Instances
If you have multiple terminal windows, make sure only ONE is running the emulator:

```bash
# Check all Firebase processes
ps aux | grep firebase

# Kill all of them
pkill -f firebase
```

### Stuck Process
If the process won't die:

```bash
# Find the PID
lsof -i :8080

# Kill with force (replace PID)
kill -9 <PID>

# Or kill all Node processes on that port
lsof -ti :8080 | xargs kill -9
```

### Check Emulator Logs
If the emulator starts but tests fail, check the emulator output in the terminal where it's running.

---

## 📝 Helper Script Commands

The `scripts/emulator-manager.sh` script provides:

```bash
# Check status
./scripts/emulator-manager.sh status

# Stop emulator
./scripts/emulator-manager.sh stop

# Start emulator
./scripts/emulator-manager.sh start

# Restart emulator
./scripts/emulator-manager.sh restart
```

Or use npm scripts:
```bash
npm run emulator:status
npm run emulator:stop
npm run emulator:start
npm run emulator:restart
```

---

## ✅ Verification

After stopping, verify:
```bash
# Should return nothing (ports free)
lsof -i :8080
lsof -i :4000

# Should return nothing (no Firebase processes)
ps aux | grep firebase | grep -v grep
```

---

## 🎯 Best Practices

1. **Always stop before starting**: Run `npm run emulator:stop` before `npm run emulator:start`
2. **Check status first**: Use `npm run emulator:status` to see what's running
3. **One emulator at a time**: Only run one emulator instance
4. **Clean shutdown**: Use `Ctrl+C` in the emulator terminal, or `npm run emulator:stop`

---

## 🆘 Still Having Issues?

If ports are still in use after stopping:

1. **Restart terminal**: Sometimes processes persist
2. **Restart computer**: Last resort if processes are truly stuck
3. **Check for other services**: Make sure nothing else is using ports 8080 or 4000

---

**Quick Reference:**
- Stop: `npm run emulator:stop`
- Status: `npm run emulator:status`
- Start: `npm run emulator:start`

