/**
 * Helper to check if Firestore Emulator is running
 * Use this in integration tests to skip tests if emulator isn't available
 */

import { connect } from 'net'

export async function checkEmulatorRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    // Try to connect to the emulator port using TCP
    const socket = connect({ host: '127.0.0.1', port: 8080 }, () => {
      // Connection successful - emulator is running
      socket.destroy()
      resolve(true)
    })

    // Set timeout to avoid hanging
    socket.setTimeout(2000) // 2 second timeout

    socket.on('timeout', () => {
      socket.destroy()
      resolve(false)
    })

    socket.on('error', () => {
      // Connection failed - emulator not running
      resolve(false)
    })
  })
}

export function getEmulatorNotRunningMessage(): string {
  return `
⚠️  Firestore Emulator is not running!

To fix this:
1. Start Firestore Emulator in Terminal 1:
   npm run emulator:start

2. Wait for success message:
   ✔  firestore: Emulator started at http://127.0.0.1:8080

3. Run integration tests in Terminal 2:
   npm run test:emu

For more details, see: START_EMULATOR.md
  `.trim()
}

