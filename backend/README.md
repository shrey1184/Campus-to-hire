# Campus-for-Hire Backend (FastAPI)

## Local setup (venv-first)

Run from repo root (`/home/shrey/Campus-for-hire`):

```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
```

## Environment

1. Copy environment template:

```bash
cp .env.example .env
```

2. Set at least:
- `DATABASE_URL`
- `JWT_SECRET`
- `AWS_REGION` (and AWS keys if using Bedrock/Translate live)

Notes:
- `CORS_ORIGINS` accepts either JSON array or comma-separated values.
- `AUTO_CREATE_TABLES` defaults to `false` (recommended). Use Alembic migrations.

## Start local Postgres with Docker (optional)

```bash
docker compose up -d db
```

## Run migrations

```bash
alembic upgrade head
```

## Run API

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:

```bash
curl http://localhost:8000/health
```

## Frontend integration

Set in `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Then run frontend:

```bash
cd ../frontend
npm run dev
```
