commitlint_cwd := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
commitlint_bin := $(commitlint_cwd)/node_modules/.bin/commitlint

$(commitlint_bin): $(commitlint_cwd)/package.json $(commitlint_cwd)/rules.mk
	$(info [commitlint] downloading...)
	@cd $(commitlint_cwd) && yarn add --no-lockfile --silent package.json
	@touch $@

commitlint: $(commitlint_cwd)/.commitlintrc.js $(commitlint_bin)
	$(info [$@] linting commit messages...)
	@$(commitlint_bin) \
		--config $< \
		--from origin/master
.PHONY: commitlint
