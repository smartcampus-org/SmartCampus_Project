// ============================================================
// SC-99 — Pipeline Jenkins : SmartCampus CI/CD
// ============================================================
pipeline {

    agent any

    environment {
        // Credentials Jenkins (configurer dans Jenkins > Manage Credentials)
        JWT_SECRET  = credentials('smartcampus-jwt-secret')
        DB_PASSWORD = credentials('smartcampus-db-password')
        DOCKER_IMAGE = "smartcampus/app"
        DOCKER_TAG   = "${env.BUILD_NUMBER}"
    }

    tools {
        maven 'maven 3.10.0'   // Nom configuré dans Jenkins > Global Tool Configuration
    }

    stages {

        // ── 1. Récupération du code ──────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo "Branche : ${env.BRANCH_NAME} | Build : ${env.BUILD_NUMBER}"
            }
        }

        // ── 2. Compilation ──────────────────────────────
        stage('Build') {
            steps {
                dir('SmartCampus_Project') {
                    sh 'mvn clean compile -q'
                }
            }
        }

        // ── 3. Tests unitaires (SC-96) ──────────────────
        stage('Unit Tests') {
            steps {
                dir('SmartCampus_Project') {
                    sh 'mvn test -Dspring.profiles.active=test -q'
                }
            }
            post {
                always {
                    junit 'SmartCampus_Project/target/surefire-reports/*.xml'
                }
            }
        }

        // ── 4. Tests d'intégration (SC-97) ──────────────
        stage('Integration Tests') {
            steps {
                dir('SmartCampus_Project') {
                    sh 'mvn verify -Dspring.profiles.active=test -q'
                }
            }
            post {
                always {
                    junit 'SmartCampus_Project/target/failsafe-reports/*.xml'
                }
            }
        }

        // ── 5. Packaging ─────────────────────────────────
        stage('Package') {
            steps {
                dir('SmartCampus_Project') {
                    sh 'mvn package -DskipTests -q'
                }
                archiveArtifacts artifacts: 'SmartCampus_Project/target/*.jar',
                                 fingerprint: true
            }
        }

        // ── 6. Build image Docker (SC-98) ────────────────
        stage('Docker Build') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                dir('SmartCampus_Project') {
                    sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                    sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                }
            }
        }

        // ── 7. Déploiement (branche main uniquement) ────
        stage('Deploy') {
            when { branch 'main' }
            steps {
                echo "Déploiement de la version ${DOCKER_TAG} sur l'environnement de staging..."
                dir('SmartCampus_Project') {
                    sh """
                        docker-compose down --remove-orphans || true
                        docker-compose up -d
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline réussi — Build #${env.BUILD_NUMBER}"
        }
        failure {
            echo "❌ Pipeline échoué — Build #${env.BUILD_NUMBER}"
        }
        always {
            cleanWs()
        }
    }
}
