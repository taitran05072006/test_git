# Giai đoạn 1: Build Java
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .

COPY src ./src

RUN mvn -B -ntp package -DskipTests

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
RUN apk add --no-cache wget
RUN addgroup -S -g 10001 app && adduser -S -u 10001 -G app app

COPY --from=build /app/target/*.jar app.jar
RUN chown app:app app.jar

EXPOSE 8080

USER 10001:10001
ENTRYPOINT ["java", "-jar", "app.jar"]
