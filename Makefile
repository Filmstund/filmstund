PROJECT_NAME := filmstund

GOFMT_FILES = $(shell go list -f '{{.Dir}}' ./... | grep -v '/pb')

## Default make target
checks:\
	lint \
	fmt  \
	test \
	mod-tidy \
	mod-verify \
	commitlint \
	verify-nodiff
.PHONY: checks

# Include tooling here
include tools/commitlint/rules.mk
# TODO: add graphql linter?

lint:
	$(info [$@] linting $(PROJECT_NAME)...)
	@go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	@golangci-lint run --config .golangci.yaml
.PHONY: lint

verify-nodiff:
	$(info [$@] verifying no git diff...)
	@git update-index --refresh && git diff-index --quiet HEAD --
.PHONY: verify-nodiff

# Format all files
fmt:
	$(info [$@] formatting all Go files...)
	@go install mvdan.cc/gofumpt@latest
	@gofumpt -w $(GOFMT_FILES)
.PHONY: fmt

mod-tidy:
	$(info [$@] tidying up...)
	@go mod tidy
.PHONY: mod-tidy

mod-verify:
	$(info [$@] verifying modules...)
	@go mod verify
.PHONY: mod-verify

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
	@rm -rf ./build
.PHONY: clean

build: clean
	$(info [$@] building ${PROJECT_NAME}...)
	go build -o build/${PROJECT_NAME} ./cmd/${PROJECT_NAME}
.PHONY: build

run: build
	@./build/${PROJECT_NAME}
