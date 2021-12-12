#! /bin/sh

# Check container and re-run #
OLD_CONTAINER="$(docker ps --all --quiet --filter=name="$DOCKER_CONTAINER_NAME")"
if [ -n "$OLD_CONTAINER" ]; then
  docker stop $OLD_CONTAINER && docker rm $OLD_CONTAINER
  echo "...[done] remove old container ${DOCKER_CONTAINER_NAME}"
fi

docker run --restart=always -d -p ${DOCKER_CONTAINER_PORT_EXPOSE}:${DOCKER_CONTAINER_PORT_EXPOSE} -v ${DOCKER_VOLUME}:/public --name ${DOCKER_CONTAINER_NAME} ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}
echo "...[done] start new container ${DOCKER_CONTAINER_NAME}"