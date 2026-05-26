#!/usr/bin/env bash

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDS_FILE="$ROOT/.service-pids"

echo "Stopping all Spring Boot services..."

# Kill by saved PIDs
if [ -f "$PIDS_FILE" ]; then
  while IFS= read -r pid; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null && echo "  Killed PID $pid"
    fi
  done < "$PIDS_FILE"
  rm -f "$PIDS_FILE"
fi

# Also kill any remaining mvnw / spring-boot processes
pkill -f "spring-boot:run" 2>/dev/null || true
pkill -f "mvnw" 2>/dev/null || true

sleep 2
echo "Done."
