# ==============================================================================
# PHỞ GIA TRUYỀN 1986 — BACKEND DOCKERFILE
# Multi-stage build: Maven 3.9 + Java 21 (Temurin) -> Minimal JRE Alpine
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build JAR package
# ------------------------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Copy dependency definition to cache Maven dependencies layer
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Copy source code and build fat JAR (skip tests during container build)
COPY src ./src
RUN mvn clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 2: Production Runtime
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root system group & user for security compliance
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install curl for container health check
RUN apk add --no-cache curl tzdata

# Set timezone to Asia/Ho_Chi_Minh
ENV TZ=Asia/Ho_Chi_Minh

# Copy compiled JAR from builder stage
COPY --from=builder /build/target/*.jar app.jar

# Set ownership to non-root user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

# Healthcheck targeting Spring Boot /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["java", \
  "-XX:+UseG1GC", \
  "-XX:+ExitOnOutOfMemoryError", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
