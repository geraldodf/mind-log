FROM maven:3.9.8-eclipse-temurin-21 AS builder

WORKDIR /app

COPY pom.xml .

RUN mvn dependency:go-offline

COPY . .

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine-3.21

WORKDIR /app

RUN apk add --no-cache tzdata && \
    ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    echo "America/Sao_Paulo" > /etc/timezone

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

USER appuser

COPY --from=builder /app/target/mind-log-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]