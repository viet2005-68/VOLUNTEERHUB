#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "Deleting VolunteerHub resources..."
kubectl delete -k "${ROOT}/k8s/overlays/local" --ignore-not-found=true

echo "Uninstalling observability Helm releases..."
helm uninstall volunteerhub-prometheus -n observability --ignore-not-found || true

echo "Deleting observability resources..."
kubectl delete -k "${ROOT}/k8s/observability" --ignore-not-found=true
kubectl delete namespace observability --ignore-not-found=true

echo "VolunteerHub k3s resources were removed. PersistentVolumeClaims may remain if their storage class retains data."
