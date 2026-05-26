# VolunteerHub - Huong dan chay Kubernetes local bang k3s

Tai lieu nay huong dan chay VolunteerHub tren Kubernetes local. Project dung `k3s`
lam cluster Kubernetes nhe, Docker local registry o `localhost:5000`, va Kustomize
de apply manifest.

## 1. Yeu cau truoc khi chay

Can co:

- Docker dang chay
- Quyen `sudo`
- Internet de tai k3s, Helm chart, Docker base image
- Dung thu muc goc project `VolunteerHub`

Kiem tra nhanh:

```bash
docker ps
```

Di vao project:

```bash
cd VolunteerHub
```

## 2. Cach chay nhanh nhat

Lenh nay se lam gan nhu tat ca:

```bash
./scripts/k3s/deploy.sh
```

Script nay se:

1. Cai hoac khoi dong k3s local.
2. Tao local Docker registry `localhost:5000`.
3. Cai Helm neu may chua co.
4. Build Docker image cho tung service.
5. Push image vao local registry.
6. Deploy observability: Prometheus, Grafana, Loki, Tempo, Otel Collector.
7. Deploy VolunteerHub bang:

```bash
kubectl apply -k k8s/overlays/local
```

8. Cho cac StatefulSet va Deployment rollout xong.

## 3. Cach chay lan luot tung buoc

Dung cach nay neu muon giai thich ro voi thay/co.

### Buoc 1: Cai va khoi dong k3s local

```bash
./scripts/k3s/install-local.sh
```

Lenh nay se:

- tao local registry `localhost:5000`
- cau hinh k3s de pull image tu registry local
- cai/khoi dong k3s
- copy kubeconfig vao `~/.kube/config`
- doi node Kubernetes sang trang thai `Ready`

Kiem tra cluster:

```bash
kubectl get nodes -o wide
```

Neu thay node `Ready` la on.

### Buoc 2: Build va push image

```bash
./scripts/k3s/build-images.sh
```

Lenh nay build cac image:

- `localhost:5000/volunteerhub/service-discovery:local`
- `localhost:5000/volunteerhub/api-gateway:local`
- `localhost:5000/volunteerhub/authorization-server:local`
- `localhost:5000/volunteerhub/user-service:local`
- `localhost:5000/volunteerhub/event-service:local`
- `localhost:5000/volunteerhub/community-service:local`
- `localhost:5000/volunteerhub/registration-service:local`
- `localhost:5000/volunteerhub/notification-service:local`
- `localhost:5000/volunteerhub/aggregation-service:local`
- `localhost:5000/volunteerhub/analytic-service:local`
- `localhost:5000/volunteerhub/frontend:local`

Kiem tra registry local:

```bash
docker ps | grep volunteerhub-registry
```

### Buoc 3: Deploy observability

Apply cac resource observability rieng:

```bash
kubectl apply -k k8s/observability
```

Cai Prometheus/Grafana bang Helm:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm upgrade --install volunteerhub-prometheus prometheus-community/kube-prometheus-stack \
  --namespace observability \
  --create-namespace \
  -f k8s/observability/values-prometheus.yaml \
  --wait
```

Kiem tra:

```bash
kubectl get pods -n observability
```

### Buoc 4: Deploy VolunteerHub

```bash
kubectl apply -k k8s/overlays/local
```

Lop `overlays/local` se lay cau hinh tu `k8s/base` va patch them cau hinh local,
vi du startup/readiness/liveness probe.

Kiem tra namespace:

```bash
kubectl get ns
```

Kiem tra pod:

```bash
kubectl get pods -n volunteerhub
```

### Buoc 5: Doi database/cache/message broker san sang

```bash
kubectl rollout status statefulset/authorization-postgres -n volunteerhub --timeout=240s
kubectl rollout status statefulset/user-service-postgres -n volunteerhub --timeout=240s
kubectl rollout status statefulset/event-service-postgres -n volunteerhub --timeout=240s
kubectl rollout status statefulset/community-service-postgres -n volunteerhub --timeout=240s
kubectl rollout status statefulset/registration-service-postgres -n volunteerhub --timeout=240s
kubectl rollout status statefulset/notification-service-postgres -n volunteerhub --timeout=240s
kubectl rollout status statefulset/redis -n volunteerhub --timeout=240s
kubectl rollout status statefulset/rabbitmq -n volunteerhub --timeout=240s
```

### Buoc 6: Doi cac app rollout xong

```bash
kubectl rollout status deployment/service-discovery -n volunteerhub --timeout=300s
kubectl rollout status deployment/authorization-server -n volunteerhub --timeout=300s
kubectl rollout status deployment/api-gateway -n volunteerhub --timeout=300s
kubectl rollout status deployment/user-service -n volunteerhub --timeout=300s
kubectl rollout status deployment/event-service -n volunteerhub --timeout=300s
kubectl rollout status deployment/community-service -n volunteerhub --timeout=300s
kubectl rollout status deployment/registration-service -n volunteerhub --timeout=300s
kubectl rollout status deployment/notification-service -n volunteerhub --timeout=300s
kubectl rollout status deployment/aggregation-service -n volunteerhub --timeout=300s
kubectl rollout status deployment/analytic-service -n volunteerhub --timeout=300s
kubectl rollout status deployment/frontend -n volunteerhub --timeout=300s
```

Hoac kiem tra tat ca:

```bash
kubectl get pods -n volunteerhub
```

Tat ca nen o trang thai `Running`, cot `READY` la `1/1`.

## 4. Mo ung dung tren browser

URL chinh:

- Frontend: `http://localhost:30080`
- Authorization Server login: `http://localhost:7070/login`
- Eureka dashboard: `http://localhost:30876`
- RabbitMQ management: `http://localhost:31672`
- Grafana: `http://localhost:30300`

Trong local binh thuong, `frontend`, `Eureka`, `RabbitMQ management`, `Grafana` dung
`NodePort`. Rieng `Authorization Server` can port-forward vi login HTML dung
`localhost:7070`.

Chay port-forward cho Authorization Server:

```bash
kubectl port-forward --address 0.0.0.0 -n volunteerhub svc/authorization-server 7070:7070
```

Neu browser bi `ERR_CONNECTION_REFUSED` voi frontend, mo them terminal khac va chay:

```bash
kubectl port-forward --address 0.0.0.0 -n volunteerhub svc/frontend 30080:80
```

Neu muon chay port-forward nen:

```bash
setsid -f kubectl port-forward --address 0.0.0.0 -n volunteerhub svc/authorization-server 7070:7070 \
  >/tmp/volunteerhub-auth-7070.log 2>&1 < /dev/null

setsid -f kubectl port-forward --address 0.0.0.0 -n volunteerhub svc/frontend 30080:80 \
  >/tmp/volunteerhub-frontend-30080.log 2>&1 < /dev/null
```

Kiem tra:

```bash
curl -I http://localhost:30080
curl -I http://localhost:7070/login
```

## 5. Grafana password

User mac dinh:

```text
admin
```

Lay password:

```bash
kubectl get secret -n observability volunteerhub-prometheus-grafana \
  -o jsonpath='{.data.admin-password}' | base64 -d; echo
```

## 6. Cac thanh phan duoc deploy

Namespace chinh:

```text
volunteerhub
```

App chay bang Deployment:

- `frontend`
- `service-discovery`
- `authorization-server`
- `api-gateway`
- `user-service`
- `event-service`
- `community-service`
- `registration-service`
- `notification-service`
- `aggregation-service`
- `analytic-service`

Thanh phan co state chay bang StatefulSet:

- `authorization-postgres`
- `user-service-postgres`
- `event-service-postgres`
- `community-service-postgres`
- `registration-service-postgres`
- `notification-service-postgres`
- `redis`
- `rabbitmq`

Config:

- `volunteerhub-config`: ConfigMap, chua config khong nhay cam.
- `volunteerhub-secrets`: Secret, chua password/client secret/key.
- `volunteerhub-firebase`: Secret tuy chon, chua Firebase service account de upload avatar/chat image va FCM.

Neu can upload avatar/chat image tren k8s, tao secret Firebase tu file JSON local da bi gitignore:

```bash
kubectl create secret generic volunteerhub-firebase \
  -n volunteerhub \
  --from-literal=FIREBASE_SERVICE_ACCOUNT_BASE64="$(base64 -w0 UserService/src/main/resources/storageServiceAccountKey.json)" \
  --from-literal=FCM_ENABLED=true \
  --dry-run=client -o yaml | kubectl apply -f -
```

Sau do restart cac service dung Firebase:

```bash
kubectl rollout restart deployment/user-service deployment/chat-service deployment/notification-service -n volunteerhub
```

## 7. Luong request chinh

Luong frontend goi API:

```text
Browser
  -> localhost:30080
  -> frontend nginx
  -> /api
  -> api-gateway:8080
  -> service phu hop
```

Luong login:

```text
Browser
  -> frontend localhost:30080
  -> bam Login
  -> authorization-server localhost:7070
  -> login thanh cong
  -> redirect ve frontend callback
  -> frontend lay access token
  -> frontend goi API Gateway kem Bearer token
```

Gateway verify token bang:

```text
VOLUNTEER_HUB_AS_URI=http://localhost:7070
VOLUNTEER_HUB_AS_JWK_URI=http://authorization-server:7070/oauth2/jwks
```

## 8. Lenh debug hay dung

Xem pod:

```bash
kubectl get pods -n volunteerhub
```

Xem service:

```bash
kubectl get svc -n volunteerhub
```

Xem log Gateway:

```bash
kubectl logs -n volunteerhub deploy/api-gateway --tail=200
```

Xem log UserService:

```bash
kubectl logs -n volunteerhub deploy/user-service --tail=200
```

Mo shell vao pod:

```bash
kubectl exec -it -n volunteerhub deploy/api-gateway -- sh
```

Xem chi tiet pod loi:

```bash
kubectl describe pod -n volunteerhub <pod-name>
```

Restart mot Deployment:

```bash
kubectl rollout restart deployment/api-gateway -n volunteerhub
kubectl rollout status deployment/api-gateway -n volunteerhub --timeout=300s
```

Apply lai config:

```bash
kubectl apply -k k8s/overlays/local
```

## 9. Chay lai sau khi da build image

Neu da build image roi, chi muon deploy lai nhanh:

```bash
./scripts/k3s/deploy.sh --skip-build --skip-k3s-install
```

Neu chi sua manifest YAML:

```bash
kubectl apply -k k8s/overlays/local
```

Neu sua source code Java/React:

```bash
./scripts/k3s/build-images.sh
kubectl rollout restart deployment/<ten-deployment> -n volunteerhub
```

Vi du sua frontend:

```bash
./scripts/k3s/build-images.sh
kubectl rollout restart deployment/frontend -n volunteerhub
kubectl rollout status deployment/frontend -n volunteerhub --timeout=300s
```

## 10. Xoa moi truong

Xoa resource VolunteerHub va observability:

```bash
./scripts/k3s/destroy.sh
```

Luu y: mot so PersistentVolumeClaim co the van con tuy theo StorageClass.

Kiem tra PVC:

```bash
kubectl get pvc -A
```

## 11. Cach giai thich ngan gon khi bi hoi

Co the tra loi:

```text
Em deploy VolunteerHub tren local k3s. Dau tien em build Docker image cho tung
service va push vao local registry localhost:5000. Sau do em dung Kustomize apply
k8s/overlays/local de tao namespace, ConfigMap, Secret, StatefulSet cho database,
Redis, RabbitMQ va Deployment cho cac microservice. Frontend expose bang NodePort
30080, Auth Server dung port-forward 7070, Gateway verify JWT roi route request
toi cac service qua Eureka/Service Discovery.
```
