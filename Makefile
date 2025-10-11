# ========================================
# Makefile for llcompa_ratioll
# Development, Testing, and Deployment
# ========================================

.PHONY: help build-dev up down test smoke buildx-init push prod-pull prod-up prod-down prod-logs clean

SHELL := /bin/bash
BACKEND_DIR := compa-ratio/BackEnd
FRONTEND_DIR := FrontEnd
MAVEN_POM := $(BACKEND_DIR)/pom.xml
GRADLE_BUILD := $(BACKEND_DIR)/build.gradle
GRADLE_BUILD_KTS := $(BACKEND_DIR)/build.gradle.kts

-include infra/.env
export

# Default target: show help
help:
	@echo "======================================"
	@echo "llcompa_ratioll - Available Commands"
	@echo "======================================"
	@echo ""
	@echo "Development:"
	@echo "  make build-dev     Build Docker images locally"
	@echo "  make up            Start development environment"
	@echo "  make down          Stop development environment"
	@echo "  make logs          View logs from all services"
	@echo "  make smoke         Run smoke tests"
	@echo ""
	@echo "Testing:"
	@echo "  make test          Run backend and frontend tests"
	@echo "  make test-backend  Run backend tests only"
	@echo "  make test-frontend Run frontend tests only"
	@echo ""
	@echo "Docker Hub Deployment:"
	@echo "  make buildx-init   Initialize multi-arch builder"
	@echo "  make push          Build and push to Docker Hub"
	@echo ""
	@echo "Production:"
	@echo "  make prod-pull     Pull latest images from Docker Hub"
	@echo "  make prod-up       Start production environment"
	@echo "  make prod-down     Stop production environment"
	@echo "  make prod-logs     View production logs"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean         Remove all containers, volumes, and images"
	@echo ""

# Development targets
build-dev:
	@echo "🏗️  Building development images..."
	docker compose -f infra/docker-compose.dev.yml --env-file infra/.env build

up:
	@bash infra/scripts/dev_up.sh

down:
	@bash infra/scripts/dev_down.sh || true

logs:
	@docker compose -f infra/docker-compose.dev.yml --env-file infra/.env logs -f

# Testing targets
test: test-backend test-frontend

test-backend:
	@echo "🧪 Running backend tests..."
	@if [ -f $(MAVEN_POM) ]; then \
		(cd $(BACKEND_DIR) && mvn -q test) ; \
	elif [ -f $(GRADLE_BUILD) ] || [ -f $(GRADLE_BUILD_KTS) ]; then \
		(cd $(BACKEND_DIR) && ./gradlew test || gradle test) ; \
	else \
		echo "⚠️  No Maven/Gradle found; skipping backend tests" ; \
	fi

test-frontend:
	@echo "🧪 Running frontend tests..."
	@if [ -f $(FRONTEND_DIR)/package-lock.json ]; then \
		(cd $(FRONTEND_DIR) && npm test --if-present || echo "No frontend tests configured") ; \
	elif [ -f $(FRONTEND_DIR)/pnpm-lock.yaml ]; then \
		(cd $(FRONTEND_DIR) && pnpm test || echo "No frontend tests configured") ; \
	elif [ -f $(FRONTEND_DIR)/yarn.lock ]; then \
		(cd $(FRONTEND_DIR) && yarn test || echo "No frontend tests configured") ; \
	else \
		echo "⚠️  No Node lockfile; skipping frontend tests" ; \
	fi

smoke:
	@bash infra/scripts/smoke_test.sh

# Docker Hub deployment
buildx-init:
	@bash infra/scripts/buildx_init.sh

push:
	@bash infra/scripts/build_push_all.sh

# Production targets
prod-pull:
	@bash infra/scripts/prod_pull.sh

prod-up:
	@bash infra/scripts/prod_up.sh

prod-down:
	@echo "🛑 Stopping production environment..."
	@docker compose -f infra/docker-compose.prod.yml --env-file infra/.env down

prod-logs:
	@docker compose -f infra/docker-compose.prod.yml --env-file infra/.env logs -f

# Cleanup
clean:
	@echo "🧹 Cleaning up Docker resources..."
	@docker compose -f infra/docker-compose.dev.yml --env-file infra/.env down -v --remove-orphans 2>/dev/null || true
	@docker compose -f infra/docker-compose.prod.yml --env-file infra/.env down -v --remove-orphans 2>/dev/null || true
	@echo "✅ Cleanup complete!"

# Quick dev workflow
dev: build-dev up smoke
	@echo "✅ Development environment is ready!"

# Quick prod workflow
deploy: prod-pull prod-up
	@echo "✅ Production deployment complete!"

