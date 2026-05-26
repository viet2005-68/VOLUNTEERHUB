# syntax=docker/dockerfile:1.7

FROM maven:3.9-eclipse-temurin-21 AS builder

ARG SERVICE_DIR
WORKDIR /workspace

COPY Common ./Common
RUN --mount=type=cache,target=/root/.m2 cd Common && mvn -B -DskipTests install

COPY ${SERVICE_DIR} ./${SERVICE_DIR}
RUN --mount=type=cache,target=/root/.m2 cd "${SERVICE_DIR}" && mvn -B -DskipTests package

FROM eclipse-temurin:21-jre

ARG SERVICE_DIR
WORKDIR /app

COPY --from=builder /workspace/${SERVICE_DIR}/target/*.jar /app/app.jar

ENV JAVA_OPTS=""

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
