.PHONY: up down logs backend frontend install seed

# Start everything with Docker Compose
up:
	docker compose up --build

# Stop all containers
down:
	docker compose down

# Tail logs
logs:
	docker compose logs -f

# Run backend locally (PostgreSQL must already be running)
backend:
	pip install -r requirements.txt
	bash backend/run_dev.sh

# Run frontend locally
frontend:
	cd frontend && npm install && npm run dev

# Install all dependencies locally
install:
	pip install -r requirements.txt
	cd frontend && npm install

# Seed reference data (requires backend + DB running)
seed:
	bash backend/seed_reference_data.sh
	bash backend/seed_canonical_assessments.sh
