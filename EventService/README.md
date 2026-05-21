# How to docker
docker build -f EventService/Dockerfile -t event-service .\
docker run --env-file EventService/.env -p 8080:8080 event-service