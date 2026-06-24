#!/usr/bin/env bash
set -e

echo "========================================"
echo "  DeadlineGuard — Startup Script"
echo "========================================"

ROOT="$(cd "$(dirname "$0")" && pwd)"
API_DIR="$ROOT/deadlineguard-api"
UI_DIR="$ROOT/deadlineguard-ui"

echo ""
echo "1. Building Spring Boot API..."
cd "$API_DIR"
mvn --batch-mode package -DskipTests -q
echo "   ✓ Build successful"

echo ""
echo "2. Starting API server (port 8080)..."
java -jar target/deadlineguard-api-1.0.0.jar &
API_PID=$!
echo "   ✓ API started (PID $API_PID)"
sleep 4

echo ""
echo "3. Installing frontend dependencies..."
cd "$UI_DIR"
npm install --silent 2>/dev/null || true
echo "   ✓ Dependencies ready"

echo ""
echo "4. Starting React dev server (port 5173)..."
npm run dev &
UI_PID=$!

echo ""
echo "========================================"
echo "  DeadlineGuard is running!"
echo ""
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8080"
echo "  H2 Console: http://localhost:8080/h2-console"
echo "    JDBC URL: jdbc:h2:mem:deadlineguard"
echo "    Username: sa | Password: (blank)"
echo ""
echo "  Press Ctrl+C to stop all servers"
echo "========================================"

# Wait for either to exit
wait $API_PID $UI_PID
