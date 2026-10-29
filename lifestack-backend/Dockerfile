# ==============================================================================
# LifeStack Backend — Production Multi-Stage Dockerfile
# Optimized for cloud deployment on Render (Java 21 + Spring Boot 3.4.3)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build the Application
# ------------------------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and pre-fetch dependencies to leverage Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and package the Spring Boot executable JAR
COPY src ./src
RUN mvn clean package -DskipTests

# ------------------------------------------------------------------------------
# Stage 2: Minimal Production Runtime
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-privileged system user for secure container execution
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy the compiled JAR artifact from the build stage
COPY --from=build --chown=spring:spring /app/target/lifestack-backend-0.0.1-SNAPSHOT.jar app.jar

# Render provides the port dynamically via the $PORT environment variable (defaults to 8080)
ENV PORT=8080
EXPOSE 8080

# Configure JVM flags optimized for container memory constraints (Render 512MB Free Tier)
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT} -jar app.jar"]

