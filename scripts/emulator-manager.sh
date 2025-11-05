#!/bin/bash

# Firebase Emulator Manager Script
# Helps manage emulator lifecycle to avoid port conflicts

PORT=8080
UI_PORT=4000

check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

stop_emulator() {
    echo "🛑 Stopping Firebase Emulator..."
    
    # Kill processes on emulator ports
    if check_port $PORT; then
        echo "   Killing process on port $PORT..."
        lsof -ti :$PORT | xargs kill -9 2>/dev/null || true
    fi
    
    if check_port $UI_PORT; then
        echo "   Killing process on port $UI_PORT..."
        lsof -ti :$UI_PORT | xargs kill -9 2>/dev/null || true
    fi
    
    # Kill any Firebase emulator processes
    pkill -f "firebase.*emulator" 2>/dev/null || true
    
    sleep 2
    
    if check_port $PORT || check_port $UI_PORT; then
        echo "   ⚠️  Some ports may still be in use"
    else
        echo "   ✅ All emulator ports are free"
    fi
}

start_emulator() {
    if check_port $PORT; then
        echo "❌ Port $PORT is already in use!"
        echo "   Run: ./scripts/emulator-manager.sh stop"
        exit 1
    fi
    
    echo "🚀 Starting Firebase Emulator..."
    cd "$(dirname "$0")/.."
    npm run emulator:start
}

status() {
    echo "📊 Emulator Status:"
    echo ""
    
    if check_port $PORT; then
        echo "   ✅ Firestore Emulator: RUNNING (port $PORT)"
        lsof -i :$PORT | grep LISTEN
    else
        echo "   ❌ Firestore Emulator: NOT RUNNING (port $PORT)"
    fi
    
    echo ""
    
    if check_port $UI_PORT; then
        echo "   ✅ Emulator UI: RUNNING (port $UI_PORT)"
        echo "   📱 Open: http://localhost:$UI_PORT"
    else
        echo "   ❌ Emulator UI: NOT RUNNING (port $UI_PORT)"
    fi
}

case "$1" in
    start)
        start_emulator
        ;;
    stop)
        stop_emulator
        ;;
    restart)
        stop_emulator
        sleep 2
        start_emulator
        ;;
    status)
        status
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the Firebase Emulator"
        echo "  stop    - Stop any running emulator processes"
        echo "  restart - Stop and start the emulator"
        echo "  status  - Check emulator status"
        exit 1
        ;;
esac

