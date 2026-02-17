# 🗳️ SA National Election Platform

A secure, POPIA-compliant digital voting platform for South African National and Provincial Elections — built with FastAPI, React, Redis, Docker, and Kubernetes.

---

## Pages

> - Home / Vote page
> - Party selection with logos
> - Confirmation step
> - Live results bar chart
> - IEC Electoral Commission page

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│              http://localhost:8080 (local)               │
│              https://<domain> (EKS)                     │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│               Frontend (React + Vite)                   │
│         Nginx serving static build on port 80           │
│  • Multi-step voting form                               │
│  • Party logos + IEC branding                           │
│  • Live results bar chart (Recharts)                    │
│  • VITE_API_URL → points to backend                     │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (REST)
┌──────────────────────▼──────────────────────────────────┐
│               Backend (FastAPI + Python)                │
│                    Port 8000                            │
│  • POST /vote     → cast a ballot                       │
│  • GET  /results  → national, regional, provincial      │
│  • GET  /health   → liveness probe                      │
│  • GET  /         → readiness probe                     │
│  • Luhn algorithm SA ID validation                      │
│  • POPIA-compliant SHA-256 hashing                      │
│  • Atomic Redis pipeline (3 ballots)                    │
│  • Fail-fast on missing SECRET_SALT                     │
└──────────────────────┬──────────────────────────────────┘
                       │ Redis protocol
┌──────────────────────▼──────────────────────────────────┐
│                  Redis (Alpine)                         │
│                    Port 6379                            │
│  • Voter deduplication (SET NX)                         │
│  • National tally    → party:<name>                     │
│  • Regional tally    → regional:<province>:<candidate>  │
│  • Provincial tally  → provincial:<province>:<candidate>│
│  • Append-only persistence                              │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Charts | Recharts |
| Routing | React Router v6 |
| Data fetching | TanStack Query |
| Backend | FastAPI, Python 3.11, Uvicorn |
| Database | Redis Alpine |
| Containerisation | Docker, Docker Compose |
| Orchestration | Kubernetes (local: Docker Desktop, cloud: AWS EKS) |
| Image Registry | AWS ECR |
| Web Server | Nginx Alpine |
| Security | SHA-256 hashing, Luhn validation, POPIA compliance |


---

## 🔒 Security Features

### SA ID Validation (Luhn Algorithm)
Every vote submission validates the 13-digit SA ID number using the Luhn checksum algorithm — the same algorithm used by the Department of Home Affairs.

### POPIA-Compliant Voter Hashing
Voter identity is never stored in plaintext. The ID number is hashed using SHA-256 combined with a secret salt:
```python
voter_hash = hashlib.sha256((id_number + SECRET_SALT).encode()).hexdigest()
```
This means:
- The system can detect duplicate votes
- The original ID number cannot be recovered
- Each deployment uses a unique salt

### Atomic Deduplication
Redis `SET NX` (Set if Not Exists) ensures a voter cannot cast two votes simultaneously, even under high concurrency.

### Atomic 3-Ballot Tallying
All 3 ballots (national, regional, provincial) are written in a single Redis pipeline — either all succeed or all fail, preventing partial votes.

### Fail-Fast Secret Check
The backend refuses to start if `SECRET_SALT` is missing or set to a default insecure value.

### Dynamic CORS
Allowed origins are loaded from environment variables, not hardcoded — safe for all deployment environments.

---

## 🐳 Docker Services

| Service | Image | Port |
|---|---|---|
| `sa-voting-backend` | Custom FastAPI | 8000 |
| `sa-voting-frontend` | Custom React/Nginx | 8080 |
| `sa-voting-redis` | redis:alpine | 6379 |

All services run on the `election-net` bridge network.

---

## ⚓ Kubernetes Deployment (Local — Docker Desktop)

> Coming soon — manifests in `/k8s`

Planned resources:
- `Namespace` → `election`
- `Secret` → `SECRET_SALT`
- `ConfigMap` → environment variables
- `Deployment` → backend (2 replicas)
- `Deployment` → frontend (2 replicas)
- `Deployment` → redis (1 replica)
- `Service` → ClusterIP for backend + redis
- `Service` → LoadBalancer for frontend
- `HorizontalPodAutoscaler` → scale backend under load
- `Ingress` → route traffic

---

## ☁️ AWS EKS Deployment

> Coming soon

Planned setup:
- ECR repository for backend + frontend images
- EKS cluster (2x t3.medium nodes)
- ALB Ingress Controller
- Route53 domain (optional)

**Estimated cost for a demo session (~3 hours):** ~$2-3

---

## 🔥 Stress Testing

> Coming soon — using `k6`

Planned test scenarios:
- 100 concurrent voters
- 500 concurrent voters
- Duplicate vote storm
- Redis failure simulation
- Pod scaling observation via ReplicaSets


---

## 👤 Author

**Ole** — built as a full-stack Kubernetes portfolio project demonstrating containerisation, orchestration, security, and cloud deployment on AWS EKS.

---
