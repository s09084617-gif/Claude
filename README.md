# iBlitz Platform

A full-stack fitness assessment and workout recommendation platform.

- **Backend** — FastAPI + PostgreSQL + SQLAlchemy
- **Frontend** — React 18 + TypeScript + Vite + Tailwind CSS

---

## Quick Start (Docker — recommended)

```bash
# Clone and start everything (PostgreSQL + backend + frontend)
docker compose up --build
```

| Service  | URL                              |
|----------|----------------------------------|
| Frontend | http://localhost:5173            |
| API docs | http://localhost:8000/docs       |
| Admin    | http://localhost:8000/admin      |

---

## Local Development (without Docker)

### 1. PostgreSQL

Start a local Postgres instance (Docker):

```bash
docker run -d \
  --name iblitz-db \
  -e POSTGRES_USER=iblitz \
  -e POSTGRES_PASSWORD=iblitz123 \
  -e POSTGRES_DB=iblitz \
  -p 5432:5432 \
  postgres:15-alpine
```

### 2. Backend

```bash
# Install Python dependencies
pip install -r requirements.txt

# Copy and edit env file
cp .env.example .env

# Start API (auto-reloads on file changes)
bash backend/run_dev.sh
# → http://localhost:8000/docs
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 4. Seed reference data (optional)

```bash
bash backend/seed_reference_data.sh
bash backend/seed_canonical_assessments.sh
```

Or use `make`:

```bash
make install   # install all deps
make backend   # run backend
make frontend  # run frontend
make seed      # seed reference data
```

---

## API Reference

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register — `{username, email, password}` → JWT |
| POST | `/auth/login` | Login (form data) → JWT |
| GET  | `/auth/me` | Current user (Bearer) |

### Assessment Engine
| Method | Path | Description |
|--------|------|-------------|
| POST | `/engine/generate-episode` | Body comp assessment → classification + program |
| GET  | `/engine/episodes` | List episodes with outcomes |
| POST | `/engine/generate-workout` | Generate workout plan |
| GET  | `/engine/workouts` | List workouts |

### Nutrition Plans
| Method | Path | Description |
|--------|------|-------------|
| POST | `/nutrition/plans` | Create nutrition plan (Bearer) |
| GET  | `/nutrition/plans` | List your plans (Bearer) |
| GET  | `/nutrition/plans/{id}` | Get single plan (Bearer) |
| PUT  | `/nutrition/plans/{id}` | Update plan (Bearer) |
| DELETE | `/nutrition/plans/{id}` | Delete plan (Bearer) |

### Progress Logs
| Method | Path | Description |
|--------|------|-------------|
| POST | `/progress/logs` | Log weight/BF%/muscle (Bearer) |
| GET  | `/progress/logs` | List your logs (Bearer) |
| DELETE | `/progress/logs/{id}` | Delete log (Bearer) |

### Analytics
| Method | Path | Description |
|--------|------|-------------|
| GET | `/analytics/effectiveness` | Episode/outcome analytics (Bearer) |

Full OpenAPI spec: `IBLITZ_OpenAPI_3_1_Skeleton.yaml`

---

## Project Structure

```
iblitz-platform/
├── backend/
│   ├── main.py                  # FastAPI app + CORS + routers
│   ├── auth.py                  # JWT utilities
│   ├── auth_router.py           # /auth endpoints
│   ├── generate_episode_api.py  # /engine endpoints
│   ├── nutrition_api.py         # /nutrition endpoints
│   ├── progress_api.py          # /progress endpoints
│   ├── analytics_api.py         # /analytics endpoint
│   ├── models.py                # SQLAlchemy ORM models
│   ├── schemas.py               # Pydantic schemas
│   ├── database.py              # DB engine + session
│   └── schema_v3.sql            # PostgreSQL DDL
├── frontend/
│   └── src/
│       ├── api/client.ts        # Typed axios API client
│       ├── contexts/AuthContext.tsx
│       ├── components/Layout.tsx
│       └── pages/
│           ├── Login.tsx / Register.tsx
│           ├── Dashboard.tsx
│           ├── Assessment.tsx
│           ├── Workouts.tsx
│           ├── Episodes.tsx
│           ├── Nutrition.tsx
│           ├── Progress.tsx
│           └── Analytics.tsx
├── docker-compose.yml
├── Dockerfile.backend
├── Makefile
├── requirements.txt
└── .env.example
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://iblitz:iblitz123@localhost:5432/iblitz` | Postgres connection string |
| `SECRET_KEY` | `iblitz-dev-secret-key-change-in-production` | JWT signing key |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` (7 days) | JWT expiry |

Copy `.env.example` to `.env` and set `SECRET_KEY` to a random value before deploying.
