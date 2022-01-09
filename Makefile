PROJECT_NAME := filmstund

GOFMT_FILES = $(shell go list -f '{{.Dir}}' ./... | grep -v '/pb')

## Default make target
checks:\
	sqlc-generate \
	generate \
	fmt  \
	build \
	lint \
	test \
	mod-tidy \
	mod-verify \
	commitlint \
	verify-nodiff
	$(info done!)
.PHONY: checks

# Include tooling here
include .tools/golangci-lint/rules.mk
include .tools/gofumpt/rules.mk
include .tools/commitlint/rules.mk
include .tools/sqlc/rules.mk

yarn-install:
	@yarn --cwd ./web --silent install
.PHONY: yarn-install

lint: $(golangci-lint_bin) yarn-install
	$(info [$@] linting $(PROJECT_NAME)...)
	@$< run --config .golangci.yaml
	cd ./web && yarn lint --max-warnings=0
.PHONY: lint

verify-nodiff:
	$(info [$@] verifying no git diff...)
	@git update-index --refresh && git diff-index --quiet HEAD --
.PHONY: verify-nodiff

# Format all files
fmt: $(gofumpt_bin)
	$(info [$@] formatting all Go files...)
	@$< -w $(GOFMT_FILES)
.PHONY: fmt

mod-tidy:
	$(info [$@] tidying up...)
	@go mod tidy
.PHONY: mod-tidy

mod-verify:
	$(info [$@] verifying modules...)
	@go mod verify
.PHONY: mod-verify

generate:
	$(info [$@] codegen...)
	@go generate ./...

test:
	$(info [$@] running the tests...)
	@go test \
		-shuffle=on \
		-count=1 \
		-short \
		-timeout=5m \
		./...
.PHONY: test

clean:
	@rm -rf ./.build
.PHONY: clean

build: clean
	$(info [$@] building ${PROJECT_NAME}...)
	go build -o .build/${PROJECT_NAME} ./cmd/${PROJECT_NAME}
	go build -o .build/migrate ./cmd/migrate
	go build -o .build/popularity ./cmd/popularity
.PHONY: build

build-website: yarn-install
	$(info [$@] building website...)
	@yarn --cwd ./web --silent types
	@yarn --cwd ./web --silent build

migrate: build
	@./.build/migrate

run: build migrate
	@./.build/${PROJECT_NAME}
.PHONY: run
