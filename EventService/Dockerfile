FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /workspace

# Build context must be the repository root because EventService depends on Common/.
COPY Common/pom.xml Common/pom.xml
COPY Common/src Common/src
RUN mvn -f Common/pom.xml -B -DskipTests install

COPY EventService/pom.xml EventService/pom.xml
COPY EventService/src EventService/src
RUN mvn -f EventService/pom.xml -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

ENV PORT=8080
ENV JAVA_OPTS=""

RUN addgroup --system spring && adduser --system --ingroup spring spring

COPY --from=build /workspace/EventService/target/EventService-0.0.1-SNAPSHOT.jar /app/app.jar

EXPOSE 8080
USER spring:spring

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT} -jar /app/app.jar"]
