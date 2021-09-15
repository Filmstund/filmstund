.PHONY: all frontend backend docker login push
# TODO: rename this (requires updating the docker registry)
NAME         := cthdidit/sefilm
TAG          := $$(git rev-parse --short=8 HEAD)
FRONTEND_IMG := ${NAME}-frontend:${TAG}
BACKEND_IMG  := ${NAME}-backend:${TAG}
DIRECTORY    := $$(pwd)

frontend:
	cd ${DIRECTORY}/frontend; docker build -t ${FRONTEND_IMG} --build-arg TAG=$$(git rev-parse HEAD) .
	docker tag ${FRONTEND_IMG} ${NAME}-frontend:latest

backend:
	cd ${DIRECTORY}/backend; ./gradlew --no-daemon build jibDockerBuild --image=${BACKEND_IMG}
	docker tag ${BACKEND_IMG} ${NAME}-backend:latest

docker: frontend backend

push:
	docker push ${NAME}-frontend
	docker push ${NAME}-backend

login:
	@docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}

all: frontend backend
