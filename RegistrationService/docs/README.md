# OpenAPI Documentation for RegistrationService

## Files

- **openapi.yaml** — Complete OpenAPI 3.0 specification for RegistrationService REST API

## How to Use

### 1. View in Swagger UI

#### Online Viewer
Go to [https://editor.swagger.io](https://editor.swagger.io) and paste the contents of `openapi.yaml`, or import from URL if you host the file.

#### Local Viewer
```bash
# Install swagger-ui globally (optional)
npm install -g swagger-ui

# Or use Python to serve docs
cd docs
python3 -m http.server 8000
# Open http://localhost:8000 in browser, then drag-drop openapi.yaml
```

### 2. View with ReDoc
```bash
docker run -p 8080:80 -v $(pwd)/docs:/usr/share/nginx/html/docs \
  -e SPEC_URL=/docs/openapi.yaml redocly/redoc
# Open http://localhost:8080
```

### 3. Generate Client Code

Using [OpenAPI Generator](https://openapi-generator.tech/):
```bash
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript client
openapi-generator-cli generate -i openapi.yaml -g typescript-fetch -o ./generated-client
```

## API Overview

### Authentication
All endpoints (except `/registrations/events/{eventId}/participant-ids`) require Bearer token authentication.

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8084/api/v1/registrations
```

### Key Endpoints

**EventSnapshot** (Manager metrics)
- `GET /api/v1/event_snapshot/{ownerId}/total_events_each` — Count manager's events
- `GET /api/v1/event_snapshot/{ownerId}/current_active_events_each` — Count active events

**Registrations** (User & event management)
- `GET /api/v1/registrations` — List user's registrations (paged)
- `POST /api/v1/registrations/events/{eventId}` — Register user for event
- `DELETE /api/v1/registrations/events/{eventId}` — Cancel registration
- `GET /api/v1/registrations/events/{eventId}/participants` — List participants (manager)
- `PUT /api/v1/registrations/events/{eventId}/participants/{participantId}` — Review participant (manager)

**System Helpers**
- `GET /api/v1/registrations/events/{eventId}/participant-ids` — Get participant IDs (no auth)

### Status Values

UserEventStatus:
- `PENDING` — Awaiting review
- `APPROVED` — Approved by manager
- `REJECTED` — Rejected
- `COMPLETED` — Event completed
- `ABSENT` — User marked absent

## Running the Service Locally

```bash
cd RegistrationService

# Build
./mvnw clean package -DskipTests

# Run (with in-memory DB)
./mvnw -DskipTests \
  -Deureka.client.enabled=false \
  -Dspring.datasource.url=jdbc:h2:mem:testdb \
  -Dspring.datasource.username=sa \
  -Dspring.datasource.password= \
  -Dspring.autoconfigure.exclude=org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration,org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration \
  spring-boot:run
```

App will start on `http://localhost:8084`

Springdoc endpoints:
- OpenAPI JSON: `http://localhost:8084/v3/api-docs`
- OpenAPI YAML: `http://localhost:8084/v3/api-docs.yaml`
- Swagger UI: `http://localhost:8084/swagger-ui.html`

## Notes

- The spec references types from `volunteerhub-common` module (Common)
- All timestamps are in ISO-8601 format with UTC+7 timezone (Ho Chi Minh)
- Pagination uses `pageNum` (0-indexed) and `pageSize` (default 10)
- Status code `201 Created` is returned for POST (registration creation)
