#! /bin/sh
# Build docker image #
docker --version
docker build --no-cache -t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} -f Dockerfile.stg .
docker images
echo "...[done] build image ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
