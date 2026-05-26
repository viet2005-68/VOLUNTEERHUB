#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS="$ROOT/logs"
mkdir -p "$LOGS"

services=(
  "ServiceDiscovery"
  "AuthorizationServer"
  "ApiGateway"
  "UserService"
  "CommunityService"
  "EventService"
  "RegistrationService"
  "NotificationService"
  "ChatService"
  "AggregationService"
  "AnalyticService"
)

# Kill any previously running instances
PIDS_FILE="$ROOT/.service-pids"
if [ -f "$PIDS_FILE" ]; then
  echo "Stopping previously running services..."
  while IFS= read -r pid; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null && echo "  Killed PID $pid"
    fi
  done < "$PIDS_FILE"
  rm -f "$PIDS_FILE"
fi

echo "Starting all services... logs in $LOGS/"
echo ""

for svc in "${services[@]}"; do
  LOG_FILE="$LOGS/$svc.log"
  echo "  → $svc  (log: logs/$svc.log)"
  setsid bash -c "cd '$ROOT/$svc' && exec ./mvnw spring-boot:run > '$LOG_FILE' 2>&1" >/dev/null 2>&1 &
  echo $! >> "$PIDS_FILE"
  sleep "${SERVICE_START_DELAY_SECONDS:-6}"
done

echo ""
echo "All services started in background."
echo ""
echo "Useful commands:"
echo "  tail -f $LOGS/<ServiceName>.log   # follow a service log"
echo "  bash $ROOT/stop-all.sh            # stop all services"
