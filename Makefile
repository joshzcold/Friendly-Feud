MAKEFLAGS += --always-make
.SILENT: # don't output commands being executed
SHELL := /bin/bash
.ONESHELL:

export docker_registry ?= ghcr.io/joshzcold
export DOCKER_BUILDKIT=1

export game_store ?= memory

build-frontend:
	set -x
	docker build -t ${docker_registry}/famf-web:latest .

build-frontend-dev:
	set -x
	docker build -t ${docker_registry}/famf-web:dev --target dev .

build-allinone:
	set -x
	docker build -t ${docker_registry}/famf-allinone:latest \
		-f Dockerfile.allinone .

build-backend:
	set -x
	cd backend
	docker build \
		--build-context=games=../games \
		-t ${docker_registry}/famf-server:latest .

build-backend-dev:
	set -x
	cd backend
	docker build \
		--build-context=games=../games \
		-t ${docker_registry}/famf-server:dev --target dev .
		
build: build-frontend build-backend build-allinone

push: build
	docker push ${docker_registry}/famf-web:latest
	docker push ${docker_registry}/famf-server:latest
	docker push ${docker_registry}/famf-allinone:latest


build-dev: build-frontend-dev build-backend-dev

dev: build-dev
	docker compose -p famf -f ./docker/docker-compose-dev.yaml up

dev-background: build-dev
	docker compose -p famf -f ./docker/docker-compose-dev.yaml up -d --wait --wait-timeout 120

dev-down:
	docker compose -p famf -f ./docker/docker-compose-dev.yaml down

e2e: dev-background
	npm install
	cd e2e
	npx playwright test
	cd -
	$(MAKE) dev-down

e2e-ui: dev-background
	trap 'make dev-down' EXIT
	npm install
	(
		cd e2e
		npx playwright test --ui
	)
	$(MAKE) dev-down

e2e-prod:
	cd e2e
	npm install
	npx playwright test --ui --config playwright-prod.config.js

e2e-dev:
	cd e2e
	npm install
	npx playwright test --ui --config playwright-dev.config.js
