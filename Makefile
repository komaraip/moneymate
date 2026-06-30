.PHONY: dev docker-up docker-down backend-dev frontend-dev

dev: docker-up

docker-up:
	docker compose up --build

docker-down:
	docker compose down

backend-dev:
	cd backend && go run ./cmd/api

frontend-dev:
	cd frontend && npm install && npm run dev
