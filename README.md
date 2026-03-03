# AEGIS-X

AI-Enhanced Global Intelligence & Security Platform - eXtended.

AEGIS-X is a full-stack SOC platform with enterprise-oriented backend controls, async analysis workers, RBAC, auditability, and AI-powered security analysis via AIRllm-compatible inference APIs.

## Monorepo Layout

- `server/` Express + TypeScript backend
- `client/` React + TypeScript + Vite frontend
- `docker-compose.yml` platform stack

## Architecture

### Backend

- Node.js + Express + TypeScript
- PostgreSQL for security data and audit records
- Redis + BullMQ for asynchronous workloads
- Socket.io for real-time alert and incident events
- Zod request contracts + centralized error handling
- JSON structured logging with Winston and request ID tracing

### Key Backend Modules

- Authentication: register/login/refresh with access token + rotating refresh token
- SOC Operations: log ingestion, alert scoring, incident lifecycle, incident timeline
- Malware Analysis: secure upload, static triage (hashes, entropy, strings, YARA simulation), AI interpretation
- Threat Intelligence: IOC extraction, risk scoring, correlation
- Pentest Utilities: JWT analyzer, header checker, simulated port scanner and vulnerability classifier
- Admin: user management and audit log review

### AI Safety Design

- Prompt templates per task (incident summary, threat classification, malware explanation, remediation, executive report)
- Prompt injection filtering (`sanitizeForPrompt`)
- Context bounding and token-length controls
- Structured JSON-first parsing with fallback handling
- No direct concatenation of untrusted text into unrestricted prompts

## Security Design

- JWT authentication middleware (`authenticate`)
- RBAC authorization middleware (`authorize`)
- Route-group rate limiting (general/auth/upload)
- Strong input validation with Zod
- Audit logging for sensitive actions
- Secure file upload controls: MIME allowlist, size limits, isolated upload directory
- Graceful shutdown with resource cleanup (HTTP, DB, Redis, queue)

## Database

SQL schema is in:

- `server/db/migrations/001_init.sql`

Included tables:

- `users`
- `roles`
- `incidents`
- `alerts`
- `logs`
- `malware_reports`
- `threat_intel`
- `audit_logs`
- `refresh_tokens`

Additional operational tables:

- `incident_events` (timeline)
- `analysis_jobs` (worker status tracking)

## Local Setup

### 1. Configure environment files

- Copy `server/.env.example` to `server/.env`
- Copy `client/.env.example` to `client/.env`

### 2. Start dependencies

```bash
docker compose up -d postgres redis
```

### 3. Install backend dependencies and run migration

```bash
cd server
npm install
npm run migrate:dev
```

### 4. Start backend API and worker

```bash
npm run dev
npm run dev:worker
```

### 5. Install frontend dependencies and start client

```bash
cd ../client
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000/api/v1`

## Full Docker Stack

```bash
docker compose up --build
```

## API Examples (curl)

### Register

```bash
curl -X POST http://localhost:5000/api/v1/auth/register   -H "Content-Type: application/json"   -d '{
    "email":"soc@example.com",
    "username":"soc_analyst",
    "password":"StrongPassword!123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login   -H "Content-Type: application/json"   -d '{
    "email":"soc@example.com",
    "password":"StrongPassword!123"
  }'
```

### Ingest SOC Log

```bash
curl -X POST http://localhost:5000/api/v1/soc/logs/ingest   -H "Content-Type: application/json"   -H "Authorization: Bearer <ACCESS_TOKEN>"   -d '{
    "source":"endpoint-edr",
    "logType":"process_creation",
    "severity":"MEDIUM",
    "message":"powershell execution with encoded command",
    "rawData":{"host":"srv-001"}
  }'
```

### Upload Malware Sample

```bash
curl -X POST http://localhost:5000/api/v1/malware/upload   -H "Authorization: Bearer <ACCESS_TOKEN>"   -F "file=@/path/to/sample.bin"
```

### Query Threat Intel IOC

```bash
curl -X POST http://localhost:5000/api/v1/threat-intel/query   -H "Content-Type: application/json"   -H "Authorization: Bearer <ACCESS_TOKEN>"   -d '{"iocType":"ip","iocValue":"45.9.148.21"}'
```

## Example Workflow

1. Analyst uploads sample in Malware module.
2. Backend enqueues `malware_analysis` job in Redis/BullMQ.
3. Worker computes hashes, entropy, strings, suspicious indicators, YARA simulation.
4. Worker sends bounded, sanitized context to AI service for behavior + remediation + executive summary.
5. SOC analyst ingests related logs, generating alerts/incidents.
6. Incident timeline includes generated events and can be reviewed in dashboard.
7. Admin reviews audit logs and updates role assignments as needed.

## Testing

### Backend

```bash
cd server
npm test
```

Coverage includes:

- Auth service unit tests
- Auth route integration tests
- RBAC middleware integration test
- Worker service queue tests (mocked queue/Redis path)
- AI service tests (mocked HTTP client)

### Frontend

```bash
cd client
npm test
```

Coverage includes:

- Component render test
- Protected route authorization behavior

## Operational Notes

- AIRllm endpoint is configurable via `AI_SERVICE_URL`.
- For production, replace development secrets and enforce secure secret management.
- Access and refresh tokens are intentionally handled in API responses for development flow.
  For stricter deployments, switch refresh token storage to secure HttpOnly cookies.
