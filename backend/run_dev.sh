#!/usr/bin/env bash
set -euo pipefail
# Run from project root so that `backend` is a proper Python package
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export DATABASE_URL="${DATABASE_URL:-postgresql://iblitz:iblitz123@localhost:5432/iblitz}"
export SECRET_KEY="${SECRET_KEY:-iblitz-dev-secret-key-change-in-production}"
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
