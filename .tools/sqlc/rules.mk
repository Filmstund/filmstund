sqlc_cwd := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
sqlc_ver := v1.11.0
sqlc_dir := $(sqlc_cwd)/$(sqlc_ver)
sqlc_bin := $(sqlc_dir)/sqlc
sqlc_mod := github.com/kyleconroy/sqlc/cmd/sqlc

$(sqlc_bin): $(sqlc_cwd)/rules.mk
	$(info [sqlc] downloading $(sqlc_ver)...)
	@mkdir -p $(dir $(sqlc_dir))
	@GOBIN=$(sqlc_dir) go install $(sqlc_mod)@$(sqlc_ver)
	@chmod +x $@
	@touch $@

sqlc-generate: $(sqlc_bin)
	@$(sqlc_bin) generate --file ./configs/database/sqlc/sqlc.yaml
.PHONY: sqlc
