# ============================================================
# SC-98 — Dockerfile multi-stage pour SmartCampus
# ============================================================

# ---- Étape 1 : Build ----
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copier pom.xml et télécharger les dépendances en cache
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copier les sources et compiler
COPY src ./src
RUN mvn package -DskipTests -q

# ---- Étape 2 : Image finale (JRE léger) ----
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -S smartcampus && adduser -S smartcampus -G smartcampus
USER smartcampus

# Copier le JAR depuis le builder
COPY --from=builder /app/target/smartcampus-0.0.1-SNAPSHOT.jar app.jar

# Port exposé
EXPOSE 8080

# Lancement
ENTRYPOINT ["java", "-jar", "app.jar"]
