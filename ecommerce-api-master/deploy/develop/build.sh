#! /bin/sh
printenv > .env
# Build docker image #
docker --version
docker build --no-cache -t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} .
docker images
echo "...[done] build image ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"