#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOCAL_REGISTRY="${LOCAL_REGISTRY:-localhost:5000}"
KUBECONFIG_PATH="${KUBECONFIG:-$HOME/.kube/config}"
K3S_SNAPSHOTTER="${K3S_SNAPSHOTTER:-native}"

need() {
  command -v "$1" >/dev/null 2>&1
}

ensure_registry_container() {
  if ! need docker; then
    echo "Docker is required to run the local registry." >&2
    exit 1
  fi

  if docker ps --format '{{.Names}}' | grep -qx volunteerhub-registry; then
    echo "Local registry volunteerhub-registry is already running."
    return
  fi

  if docker ps -a --format '{{.Names}}' | grep -qx volunteerhub-registry; then
    echo "Starting existing local registry container..."
    docker start volunteerhub-registry >/dev/null
    return
  fi

  echo "Creating local registry at ${LOCAL_REGISTRY}..."
  docker run -d \
    --restart=always \
    --name volunteerhub-registry \
    -p 5000:5000 \
    registry:2 >/dev/null
}

ensure_helm() {
  if need helm; then
    return
  fi

  echo "Helm is not installed; installing Helm 3..."
  curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
}

write_k3s_registry_config() {
  sudo mkdir -p /etc/rancher/k3s
  cat <<EOF | sudo tee /etc/rancher/k3s/registries.yaml >/dev/null
mirrors:
  "${LOCAL_REGISTRY}":
    endpoint:
      - "http://${LOCAL_REGISTRY}"
configs:
  "${LOCAL_REGISTRY}":
    tls:
      insecure_skip_verify: true
EOF
}

write_k3s_server_config() {
  sudo mkdir -p /etc/rancher/k3s
  cat <<EOF | sudo tee /etc/rancher/k3s/config.yaml >/dev/null
write-kubeconfig-mode: "0644"
disable:
  - traefik
snapshotter: "${K3S_SNAPSHOTTER}"
EOF
}

ensure_k3s() {
  write_k3s_registry_config
  write_k3s_server_config

  if need k3s; then
    echo "k3s is installed; restarting to ensure registry and server config are loaded..."
    sudo systemctl restart k3s
  else
    echo "Installing local single-node k3s..."
    curl -sfL https://get.k3s.io | \
      INSTALL_K3S_EXEC="server" \
      sh -
  fi

  mkdir -p "$(dirname "$KUBECONFIG_PATH")"
  sudo cp /etc/rancher/k3s/k3s.yaml "$KUBECONFIG_PATH"
  sudo chown "$(id -u):$(id -g)" "$KUBECONFIG_PATH"
  export KUBECONFIG="$KUBECONFIG_PATH"

  echo "Waiting for k3s node to be Ready..."
  kubectl wait --for=condition=Ready node --all --timeout=180s
}

ensure_registry_container
ensure_helm
ensure_k3s

cat <<EOF

Local k3s is ready.
KUBECONFIG=${KUBECONFIG_PATH}
Local registry=${LOCAL_REGISTRY}

Next:
  ${ROOT}/scripts/k3s/build-images.sh
  ${ROOT}/scripts/k3s/deploy.sh --skip-build
EOF
