# VolunteerHub CI/CD Guide

File này giải thích pipeline CI/CD đang dùng cho nhánh `cicd` của VolunteerHub.

Mục tiêu của pipeline:

- Khi push code lên nhánh `cicd`, GitHub Actions tự build toàn bộ service.
- Docker image được push lên GitHub Container Registry, gọi tắt là GHCR.
- GitHub Actions SSH vào VM, kết nối tới k3s, rồi deploy image mới lên Kubernetes.
- Website chạy qua domain `https://volunteerhub.duckdns.org`.

## 1. Kiến trúc deploy

Luồng hiện tại:

```txt
Developer push code
        |
        v
GitHub branch cicd
        |
        v
GitHub Actions CI
        |
        v
GitHub Actions Deploy
        |
        v
Build Docker images -> push GHCR
        |
        v
SSH tunnel vào VM
        |
        v
kubectl apply vào k3s
        |
        v
Traefik Ingress + cert-manager + Let's Encrypt
        |
        v
https://volunteerhub.duckdns.org
```

VM không cần clone repo để deploy theo cách này. VM chỉ cần có Docker/k3s và cluster đang chạy. GitHub Actions là nơi checkout code, build image, rồi dùng `kubectl` để điều khiển k3s trên VM.

## 2. Các file CI/CD chính

### `.github/workflows/ci.yml`

Workflow này dùng để kiểm tra code trước khi deploy.

Nó chạy khi:

- Push vào `main`
- Push vào `cicd`
- Pull request vào `main` hoặc `cicd`
- Bấm chạy thủ công bằng `workflow_dispatch`

CI có 2 job:

```txt
Backend compile
Frontend build
```

Backend compile:

- Cài JDK 21.
- Build module `Common`.
- Compile lần lượt các service Spring:
  - `ServiceDiscovery`
  - `ApiGateway`
  - `AuthorizationServer`
  - `UserService`
  - `EventService`
  - `CommunityService`
  - `RegistrationService`
  - `NotificationService`
  - `ChatService`
  - `AggregationService`
  - `AnalyticService`

Frontend build:

- Vào thư mục `Frontend`.
- Chạy `npm ci`.
- Chạy `npm run build`.

CI không deploy. CI chỉ kiểm tra code có build được không.

### `.github/workflows/deploy.yml`

Workflow này dùng để build image và deploy lên k3s.

Nó chạy khi:

- Push vào nhánh `cicd`, trừ khi commit chỉ sửa `Frontend/**` hoặc file Markdown
- Bấm chạy thủ công bằng `workflow_dispatch`

Deploy có 2 job chính:

```txt
Build and push images
Deploy to k3s
```

### `.github/workflows/deploy-frontend.yml`

Workflow này dùng khi chỉ sửa frontend và muốn deploy nhanh.

Nó chạy khi:

- Push vào nhánh `cicd` và commit có thay đổi trong `Frontend/**`
- Bấm chạy thủ công bằng `workflow_dispatch`

Workflow này chỉ làm:

```txt
Build frontend image -> push GHCR -> update deployment/frontend -> rollout frontend -> smoke test
```

Nó không build lại các service backend.

## 3. Build Docker image

Job `Build and push images` dùng matrix để build nhiều image song song.

Các image được build:

```txt
ghcr.io/viet2005-68/volunteerhub-service-discovery
ghcr.io/viet2005-68/volunteerhub-api-gateway
ghcr.io/viet2005-68/volunteerhub-authorization-server
ghcr.io/viet2005-68/volunteerhub-user-service
ghcr.io/viet2005-68/volunteerhub-event-service
ghcr.io/viet2005-68/volunteerhub-community-service
ghcr.io/viet2005-68/volunteerhub-registration-service
ghcr.io/viet2005-68/volunteerhub-notification-service
ghcr.io/viet2005-68/volunteerhub-chat-service
ghcr.io/viet2005-68/volunteerhub-aggregation-service
ghcr.io/viet2005-68/volunteerhub-analytic-service
ghcr.io/viet2005-68/volunteerhub-frontend
```

Mỗi image được tag 2 kiểu:

```txt
latest
commit SHA
```

Ví dụ:

```txt
ghcr.io/viet2005-68/volunteerhub-api-gateway:latest
ghcr.io/viet2005-68/volunteerhub-api-gateway:569ccf1...
```

Kubernetes deploy bằng tag commit SHA, không deploy trực tiếp bằng `latest`. Cách này giúp biết chính xác bản nào đang chạy.

## 4. Deploy lên k3s

Job `Deploy to k3s` làm các việc sau:

1. Checkout code từ GitHub.
2. Cài `kubectl` và `helm` trên GitHub runner.
3. Tạo kubeconfig từ secret `KUBE_CONFIG`.
4. Tạo SSH key từ secret `VM_SSH_KEY`.
5. SSH vào VM qua `VM_HOST` và `VM_USER`.
6. Mở SSH tunnel:

```txt
GitHub runner localhost:6443 -> VM 127.0.0.1:6443
```

Sau đó runner có thể dùng `kubectl` để điều khiển k3s trên VM.

VM chỉ đóng vai trò host chạy Kubernetes. Code không cần nằm trên VM.

## 5. Kubernetes overlay prod-lite

Deploy dùng thư mục:

```txt
k8s/overlays/prod-lite
```

Overlay này kế thừa từ:

```txt
k8s/base
```

Và bổ sung cấu hình production nhẹ:

- Dùng image từ GHCR.
- Set namespace `volunteerhub`.
- Giảm tài nguyên mỗi service để hợp với VM nhỏ.
- Thêm `imagePullSecrets` để k3s pull image private từ GHCR.
- Thêm startup/readiness/liveness probe.
- Thêm ingress HTTPS.
- Thêm cert-manager issuer.
- Patch các biến public URL, OAuth, Firebase, VAPID.

## 6. Domain và HTTPS

Domain hiện tại:

```txt
https://volunteerhub.duckdns.org
```

Trong GitHub variable:

```txt
PUBLIC_BASE_URL=https://volunteerhub.duckdns.org
```

Deploy workflow dùng biến này để patch:

```txt
APP_CORS_ALLOWED_ORIGINS
CLIENT_APP_URI
REDIRECT_URI
VOLUNTEER_HUB_AS_URI
Ingress host
Frontend OAuth redirect URL
Google OAuth redirect URL
```

HTTPS được cài bằng:

- `cert-manager`
- `ClusterIssuer` Let's Encrypt
- Traefik ingress của k3s

File liên quan:

```txt
k8s/overlays/prod-lite/cluster-issuer.yaml
k8s/overlays/prod-lite/ingress.yaml
```

Yêu cầu để HTTPS chạy:

- DuckDNS phải trỏ về đúng IP public của VM.
- Firewall Google Cloud phải mở port `80` và `443`.
- k3s Traefik phải đang chạy.
- cert-manager phải cấp được certificate.

## 7. GitHub Secrets cần có

Vào GitHub repo:

```txt
Settings -> Secrets and variables -> Actions -> Secrets
```

Các secret hạ tầng:

```txt
VM_HOST
VM_USER
VM_SSH_KEY
KUBE_CONFIG
GHCR_TOKEN
```

Ý nghĩa:

```txt
VM_HOST      External IP hoặc domain của VM
VM_USER      User SSH vào VM
VM_SSH_KEY   Private key SSH dùng cho GitHub Actions
KUBE_CONFIG  Nội dung file /etc/rancher/k3s/k3s.yaml trên VM
GHCR_TOKEN   GitHub token để checkout/pull/push khi cần quyền repo/package
```

Các secret app/runtime:

```txt
POSTGRES_PASSWORD
REDIS_PASSWORD
RABBITMQ_DEFAULT_PASS
CLIENT_ID
CLIENT_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
AUTH_PUBLIC_KEY_BASE64
AUTH_PRIVATE_KEY_BASE64
FIREBASE_SERVICE_ACCOUNT_BASE64
FCM_ENABLED
```

Ý nghĩa:

```txt
POSTGRES_PASSWORD              Password PostgreSQL trong k8s
REDIS_PASSWORD                 Password Redis
RABBITMQ_DEFAULT_PASS          Password RabbitMQ
CLIENT_ID                      OAuth client id nội bộ VolunteerHub
CLIENT_SECRET                  OAuth client secret nội bộ VolunteerHub
GOOGLE_CLIENT_ID               Google OAuth client id
GOOGLE_CLIENT_SECRET           Google OAuth client secret
VAPID_PUBLIC_KEY               Web push public key
VAPID_PRIVATE_KEY              Web push private key
AUTH_PUBLIC_KEY_BASE64         Public key RSA của AuthorizationServer dạng base64
AUTH_PRIVATE_KEY_BASE64        Private key RSA của AuthorizationServer dạng base64
FIREBASE_SERVICE_ACCOUNT_BASE64 Firebase service account JSON dạng base64
FCM_ENABLED                    Bật/tắt Firebase Cloud Messaging
```

Không commit các giá trị thật vào Git.

## 8. GitHub Variables cần có

Vào GitHub repo:

```txt
Settings -> Secrets and variables -> Actions -> Variables
```

Các variable đang dùng:

```txt
PUBLIC_BASE_URL
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
VAPID_SUBJECT
LETSENCRYPT_EMAIL
```

Ví dụ:

```txt
PUBLIC_BASE_URL=https://volunteerhub.duckdns.org
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VAPID_SUBJECT=mailto:your-email@example.com
LETSENCRYPT_EMAIL=your-email@example.com
```

`PUBLIC_BASE_URL` rất quan trọng. Nếu đặt sai, OAuth redirect, issuer JWT, CORS và frontend URL đều có thể sai.

## 9. GHCR pull secret trong Kubernetes

k3s cần secret để pull image từ GHCR:

```txt
ghcr-secret
```

Secret này nằm trong namespace:

```txt
volunteerhub
```

Lệnh tạo thủ công trên VM nếu cần:

```bash
sudo kubectl create namespace volunteerhub --dry-run=client -o yaml | sudo kubectl apply -f -

sudo kubectl create secret docker-registry ghcr-secret \
  --namespace volunteerhub \
  --docker-server=ghcr.io \
  --docker-username=viet2005-68 \
  --docker-password="YOUR_GITHUB_TOKEN" \
  --dry-run=client -o yaml | sudo kubectl apply -f -
```

Token dùng ở đây cần quyền đọc package từ GHCR.

## 10. OAuth và issuer

Authorization Server phát JWT. Các service phía sau, đặc biệt `ApiGateway`, sẽ validate JWT theo issuer.

Issuer production phải là:

```txt
https://volunteerhub.duckdns.org
```

Biến liên quan:

```txt
VOLUNTEER_HUB_AS_URI
VOLUNTEER_HUB_AS_JWK_URI
REDIRECT_URI
CLIENT_APP_URI
APP_CORS_ALLOWED_ORIGINS
```

Trong production overlay:

```txt
VOLUNTEER_HUB_AS_URI=PUBLIC_BASE_URL
VOLUNTEER_HUB_AS_JWK_URI=http://authorization-server:7070/oauth2/jwks
REDIRECT_URI=PUBLIC_BASE_URL/login/oauth2/code/volunteerhub
CLIENT_APP_URI=PUBLIC_BASE_URL
APP_CORS_ALLOWED_ORIGINS=PUBLIC_BASE_URL
```

Nếu token có:

```txt
iss: "http://volunteerhub.duckdns.org"
```

nhưng web đang gọi:

```txt
https://volunteerhub.duckdns.org
```

thì API có thể trả `401`. Vì vậy `PUBLIC_BASE_URL` phải dùng đúng `https://...`.

## 11. Google OAuth config

Trong Google Cloud Console, OAuth Client cần khai báo:

Authorized JavaScript origins:

```txt
https://volunteerhub.duckdns.org
```

Authorized redirect URIs:

```txt
https://volunteerhub.duckdns.org/login/oauth2/code/google
```

Frontend cũng được build với:

```txt
VITE_GOOGLE_REDIRECT_URI=PUBLIC_BASE_URL/login/oauth2/code/google
```

Nếu redirect vẫn về localhost, kiểm tra:

- `PUBLIC_BASE_URL`
- Google OAuth redirect URI
- Image frontend đã deploy bản mới chưa
- Browser cache/localStorage

## 12. Observability

Workflow cài observability bằng:

```txt
k8s/observability
prometheus-community/kube-prometheus-stack
```

Các thành phần có thể có:

- Prometheus
- Grafana
- Loki
- Promtail
- Tempo
- OpenTelemetry Collector

Nếu Helm báo:

```txt
another operation (install/upgrade/rollback) is in progress
```

workflow sẽ thử xoá Helm release metadata bị kẹt và cài lại một lần.

## 13. Rollout và rollback

Deploy hiện tại dùng Kubernetes rolling update mặc định.

Sau khi apply manifest, workflow chạy:

```bash
kubectl rollout status deployment/<service> -n volunteerhub --timeout=600s
```

Nếu service không lên được, workflow fail và in diagnostics:

- `kubectl get pods`
- `kubectl describe deployment`
- events gần nhất
- logs pod theo label service

Pipeline hiện tại chưa phải blue-green deployment.

Rolling update có điểm tốt là nếu pod mới không ready, Kubernetes không xoá hết pod cũ ngay. Nhưng workflow chưa tự chạy lệnh rollback. Nếu cần rollback thủ công:

```bash
sudo kubectl rollout undo deployment/<service-name> -n volunteerhub
```

Ví dụ:

```bash
sudo kubectl rollout undo deployment/authorization-server -n volunteerhub
```

## 14. Cách deploy bình thường

Cách 1: Push code lên nhánh `cicd`

```bash
git checkout cicd
git add .
git commit -m "Your change"
git push origin cicd
```

Sau đó vào GitHub:

```txt
Actions -> Deploy VolunteerHub
```

Theo dõi run mới nhất.

Cách 2: Chạy thủ công

```txt
GitHub -> Actions -> Deploy VolunteerHub -> Run workflow -> branch cicd
```

## 15. Cách deploy chỉ frontend

Nếu chỉ sửa code trong `Frontend/**`, push lên nhánh `cicd` là workflow này tự chạy:

```txt
Actions -> Deploy Frontend Only
```

Chạy thủ công:

```txt
GitHub -> Actions -> Deploy Frontend Only -> Run workflow -> branch cicd
```

Workflow này chỉ build lại image:

```txt
ghcr.io/viet2005-68/volunteerhub-frontend:<commit-sha>
```

Sau đó update đúng deployment:

```bash
kubectl set image deployment/frontend frontend=ghcr.io/viet2005-68/volunteerhub-frontend:<commit-sha> -n volunteerhub
kubectl rollout status deployment/frontend -n volunteerhub --timeout=300s
```

Khi chỉ sửa giao diện, CSS, route frontend, hoặc biến build frontend, dùng workflow này sẽ nhanh hơn full deploy nhiều.

## 16. Sau khi deploy xong cần check gì

Check GitHub Actions:

```txt
Deploy VolunteerHub -> Status: Success
```

Check website:

```txt
https://volunteerhub.duckdns.org
```

Check pod trên VM:

```bash
sudo kubectl get pods -n volunteerhub
```

Check service lỗi:

```bash
sudo kubectl logs -n volunteerhub deployment/<service-name> --tail=200
```

Check rollout:

```bash
sudo kubectl rollout status deployment/<service-name> -n volunteerhub
```

## 17. Những lỗi thường gặp

### GHCR permission denied

Lỗi:

```txt
denied: permission_denied: The token provided does not match expected scopes
```

Cách xử lý:

- Token GitHub phải có quyền package phù hợp.
- Nếu image private, k3s cần `ghcr-secret`.
- Workflow cần `permissions: packages: write`.

### SSH key libcrypto

Lỗi:

```txt
Load key "...": error in libcrypto
Permission denied (publickey)
```

Cách xử lý:

- Secret `VM_SSH_KEY` phải là private key đầy đủ.
- Key phải giữ nguyên format:

```txt
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

- Không copy public key vào secret này.

### Authorization server CrashLoopBackOff vì thiếu key

Lỗi:

```txt
AUTH_PRIVATE_KEY_BASE64 is not configured
private.pem not found
```

Cách xử lý:

- Set `AUTH_PUBLIC_KEY_BASE64`.
- Set `AUTH_PRIVATE_KEY_BASE64`.
- Rerun deploy.

### Login xong vẫn 401

Nguyên nhân hay gặp:

- JWT issuer sai `http`/`https`.
- Browser còn token cũ trong localStorage.
- `PUBLIC_BASE_URL` sai.
- Gateway validate issuer khác với AuthorizationServer phát token.

Cách xử lý nhanh sau khi deploy fix auth:

```js
localStorage.clear()
location.href = "/"
```

Sau đó login lại.

### HTTPS không cấp certificate

Check:

```bash
sudo kubectl describe certificate volunteerhub-tls -n volunteerhub
sudo kubectl describe challenge -n volunteerhub
sudo kubectl get events -n volunteerhub --sort-by=.lastTimestamp | tail -n 80
```

Nguyên nhân hay gặp:

- DuckDNS chưa trỏ đúng IP VM.
- Port `80` chưa mở.
- Port `443` chưa mở.
- cert-manager chưa ready.

## 18. Tóm tắt nhanh

CI:

```txt
Compile backend + build frontend
```

CD:

```txt
Build Docker images -> push GHCR -> SSH vào VM -> kubectl apply -> rollout -> smoke test
```

VM:

```txt
Không cần clone repo.
Chỉ cần chạy k3s và cho GitHub Actions SSH vào.
```

Domain:

```txt
DuckDNS -> VM IP -> Traefik Ingress -> frontend/api gateway
```

Secret:

```txt
GitHub Secrets chứa password/key/token.
Kubernetes Secret được workflow tạo lại mỗi lần deploy.
```

Deploy:

```txt
Push lên cicd là tự chạy.
```

Frontend-only deploy:

```txt
Push thay đổi chỉ trong Frontend/** -> chỉ chạy Deploy Frontend Only.
```
