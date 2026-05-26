#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SKIP_BUILD=false
SKIP_K3S_INSTALL=false

for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=true ;;
    --skip-k3s-install) SKIP_K3S_INSTALL=true ;;
    *)
      echo "Unknown argument: $arg" >&2
      echo "Usage: $0 [--skip-build] [--skip-k3s-install]" >&2
      exit 1
      ;;
  esac
done

if [ "$SKIP_K3S_INSTALL" = false ]; then
  "${ROOT}/scripts/k3s/install-local.sh"
fi

if [ "$SKIP_BUILD" = false ]; then
  "${ROOT}/scripts/k3s/build-images.sh"
fi

echo "Adding Helm repositories..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts >/dev/null
helm repo update >/dev/null

echo "Installing observability namespace, Loki, Promtail, Tempo, and OpenTelemetry Collector..."
kubectl apply -k "${ROOT}/k8s/observability"

echo "Installing kube-prometheus-stack..."
helm upgrade --install volunteerhub-prometheus prometheus-community/kube-prometheus-stack \
  --namespace observability \
  --create-namespace \
  -f "${ROOT}/k8s/observability/values-prometheus.yaml" \
  --wait

echo "Deploying VolunteerHub..."
kubectl apply -k "${ROOT}/k8s/overlays/local"

echo "Waiting for datastore rollouts..."
for sts in \
  authorization-postgres \
  user-service-postgres \
  event-service-postgres \
  community-service-postgres \
  registration-service-postgres \
  notification-service-postgres \
  chat-service-postgres \
  redis \
  rabbitmq; do
  kubectl rollout status "statefulset/${sts}" -n volunteerhub --timeout=240s
done

echo "Waiting for application rollouts..."
for deploy in \
  service-discovery \
  authorization-server \
  api-gateway \
  user-service \
  event-service \
  community-service \
  registration-service \
  notification-service \
  chat-service \
  aggregation-service \
  analytic-service \
  frontend; do
  kubectl rollout status "deployment/${deploy}" -n volunteerhub --timeout=300s
done

cat <<EOF

VolunteerHub is deployed.

Main app:             http://localhost:30080
Eureka dashboard:     http://localhost:30876
RabbitMQ management:  http://localhost:31672
Grafana:              http://localhost:30300

Grafana credentials:
  user: admin
  password:
    kubectl get secret -n observability volunteerhub-prometheus-grafana -o jsonpath='{.data.admin-password}' | base64 -d; echo
EOF
