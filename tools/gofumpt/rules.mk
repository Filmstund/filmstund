#  A stricter gofmt
gofumpt_cwd := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
gofumpt_ver := v0.1.1
gofumpt_bin := $(gofumpt_cwd)/$(gofumpt_ver)/gofumpt

system_os   := $(shell uname -s)
system_arch := $(shell uname -m)

ifneq ($(system_arch), x86_64)
$(error unsupported arch: $(uname -m))
endif

gofumpt_url := https://github.com/mvdan/gofumpt/releases/download/$(gofumpt_ver)/gofumpt_$(gofumpt_ver)_$(system_os)_amd64

$(gofumpt_bin): $(gofumpt_cwd)/rules.mk
	$(info [gofumpt] downloading $(gofumpt_ver)...)
	@mkdir -p $(dir $@)
	@curl --silent --location --show-error $(gofumpt_url) --output "$@"
	@chmod +x $@
	@touch $@
