#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REGISTRY="${LOCAL_REGISTRY:-localhost:5000}"
IMAGE_TAG="${IMAGE_TAG:-local}"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-http://localhost:30080}"
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-${VITE_GG_CLIENT_ID:-485996629423-td2c31e9vppq688o0ucdjtfgb89i6lt1.apps.googleusercontent.com}}"
GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:-${VITE_GG_CLIENT_SECRET:-}}"

spring_services=(
  "service-discovery:ServiceDiscovery"
  "api-gateway:ApiGateway"
  "authorization-server:AuthorizationServer"
  "user-service:UserService"
  "event-service:EventService"
  "community-service:CommunityService"
  "registration-service:RegistrationService"
  "notification-service:NotificationService"
  "chat-service:ChatService"
  "aggregation-service:AggregationService"
  "analytic-service:AnalyticService"
)

build_and_push_spring() {
  local image_name="$1"
  local service_dir="$2"
  local image="${REGISTRY}/volunteerhub/${image_name}:${IMAGE_TAG}"

  echo "Building ${image} from ${service_dir}..."
  docker build \
    -f "${ROOT}/docker/spring-service.Dockerfile" \
    --build-arg "SERVICE_DIR=${service_dir}" \
    -t "${image}" \
    "${ROOT}"

  docker push "${image}"
}

for item in "${spring_services[@]}"; do
  IFS=: read -r image_name service_dir <<<"$item"
  build_and_push_spring "$image_name" "$service_dir"
done

frontend_image="${REGISTRY}/volunteerhub/frontend:${IMAGE_TAG}"
echo "Building ${frontend_image}..."
docker build \
  --build-arg VITE_API_URL=/api \
  --build-arg VITE_API_LOGIN=http://localhost:7070 \
  --build-arg VITE_AUTH_BASE_URL= \
  --build-arg "VITE_PUBLIC_BASE_URL=${PUBLIC_BASE_URL}" \
  --build-arg VITE_OAUTH_RESPONSE_TYPE=code \
  --build-arg VITE_OAUTH_CLIENT_ID=7fcdbb6c-fc1d-4921-a52d-0466557b6132 \
  --build-arg VITE_OAUTH_CLIENT_SECRET=f584278e-be8a-4f55-9c64-8e7be8f9e846 \
  --build-arg VITE_OAUTH_SCOPE=openid \
  --build-arg "VITE_OAUTH_REDIRECT_URI=${PUBLIC_BASE_URL}/login/oauth2/code/volunteerhub" \
  --build-arg "VITE_GG_CLIENT_ID=${GOOGLE_CLIENT_ID}" \
  --build-arg "VITE_GG_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}" \
  --build-arg "VITE_GOOGLE_REDIRECT_URI=${PUBLIC_BASE_URL}/login/oauth2/code/google" \
  -t "${frontend_image}" \
  "${ROOT}/Frontend"

docker push "${frontend_image}"

echo "All VolunteerHub images were pushed to ${REGISTRY}/volunteerhub with tag ${IMAGE_TAG}."
