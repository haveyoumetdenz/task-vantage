#!/bin/bash

# Script to restart emulator and run integration tests
# This ensures a clean state before running tests

set -e

echo "🧹 Stopping any running emulators..."
npm run emulator:stop 2>/dev/null || true

echo "⏳ Waiting for ports to clear..."
sleep 2

echo "🚀 Starting Firestore Emulator..."
npm run emulator:start > /tmp/emulator.log 2>&1 &
EMULATOR_PID=$!

echo "⏳ Waiting for emulator to be ready..."
timeout 30 bash -c 'until curl -s http://127.0.0.1:8080 > /dev/null 2>&1; do sleep 1; done' || {
  echo "❌ Emulator failed to start within 30 seconds"
  kill $EMULATOR_PID 2>/dev/null || true
  exit 1
}

echo "✅ Emulator is ready!"
echo ""

# Run the tests
echo "🧪 Running integration tests..."
npm run test:emu

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
echo "🛑 Stopping emulator..."
kill $EMULATOR_PID 2>/dev/null || true
npm run emulator:stop 2>/dev/null || true

# Exit with test exit code
exit $TEST_EXIT_CODE

