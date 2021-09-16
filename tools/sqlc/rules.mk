sqlc_cwd := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
sqlc_ver := 1.10.0
sqlc_bin := $(sqlc_cwd)/$(sqlc_ver)/sqlc

system_os   := $(shell uname -s)
system_arch := $(shell uname -m)

ifneq ($(system_arch), x86_64)
$(error unsupported arch: $(uname -m))
endif

sqlc_url := https://github.com/kyleconroy/sqlc/releases/download/v$(sqlc_ver)/sqlc_$(sqlc_ver)_$(system_os)_amd64.tar.gz

$(sqlc_bin): $(sqlc_cwd)/rules.mk
	$(info [sqlc] downloading v$(sqlc_ver)...)
	@mkdir -p $(dir $@)
	@curl -sSL $(sqlc_url) -o - | tar -xz --directory $(dir $@)
	@chmod +x $@
	@touch $@

sqlc-generate: $(sqlc_bin)
	@$(sqlc_bin) generate --file ./configs/sqlc/sqlc.yaml
.PHONY: sqlc
