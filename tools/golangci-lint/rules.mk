golangci-lint_cwd := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
golangci-lint_ver := 1.42.1
golangci-lint_bin := $(golangci-lint_cwd)/$(golangci-lint_ver)/golangci-lint

system_os   := $(shell uname -s)
system_arch := $(shell uname -m)

ifeq ($(system_arch), x86_64)
	system_arch := amd64
else ifeq ($(system_arch), arm64)
	system_arch := arm64
else
	$(error unsupported arch: $(uname -m))
endif

golangci-lint_url := https://github.com/golangci/golangci-lint/releases/download/v$(golangci-lint_ver)/golangci-lint-$(golangci-lint_ver)-$(system_os)-$(system_arch).tar.gz

$(golangci-lint_bin): $(golangci-lint_cwd)/rules.mk
	$(info [golangci-lint] downloading v$(golangci-lint_ver)...)
	@mkdir -p $(dir $@)
	@curl --silent --location --show-error "$(golangci-lint_url)" --output - | tar -xz --directory $(dir $@) --strip-components 1
	@chmod +x $@
	@touch $@
