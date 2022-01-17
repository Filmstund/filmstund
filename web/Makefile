all-web: yarn-install lint-web
	yarn types
	yarn prettier:check
	yarn build
	yarn test
	yarn bundlewatch
.PHONY: all-web

yarn-install:
	yarn
.PHONY: yarn-install

lint-web:
	yarn lint --max-warnings=0
.PHONY: lint-web
