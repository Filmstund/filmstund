all-web: yarn-install lint-web
	yarn types
	yarn prettier:check
	yarn build
	yarn test
.PHONY: all-web

yarn-install:
	yarn
.PHONY: yarn-install

lint-web:
	yarn lint --max-warnings=0
.PHONY: lint-web