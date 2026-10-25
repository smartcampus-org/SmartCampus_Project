# SmartCampus — API d'authentification

Système de gestion d'authentification pour le campus universitaire.  
Spring Boot 4 · Java 21 · MySQL · JWT · Docker · Jenkins

---

## Démarrage rapide

### Prérequis
- Java 21
- MySQL 8+
- Maven 3.9+ (ou utiliser `./mvnw`)

### 1. Définir les variables d'environnement

```powershell
# Windows PowerShell
$env:DB_PASSWORD = "VotreMotDePasse"
$env:JWT_SECRET  = "c21hcnRjYW1wdXMtc2VjcmV0LWtleS0zMmNoYXJzISE="
```

```bash
# Linux / macOS
export DB_PASSWORD=VotreMotDePasse
export JWT_SECRET=c21hcnRjYW1wdXMtc2VjcmV0LWtleS0zMmNoYXJzISE=
```

### 2. Lancer l'application

```bash
./mvnw spring-boot:run
```

L'application démarre sur **http://localhost:8083**

### 3. Avec Docker Compose

```bash
# Copier et remplir le fichier .env
cp .env.example .env

# Démarrer tous les services (app + MySQL + MailHog)
docker-compose up -d
```

---

## Endpoints

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | ❌ | Connexion |
| POST | `/api/auth/logout` | ✅ | Déconnexion |
| POST | `/api/auth/register` | ❌ | Inscription |
| POST | `/api/auth/forgot-password` | ❌ | Mot de passe oublié |
| POST | `/api/auth/reset-password` | ❌ | Réinitialisation |
| GET  | `/api/user/profile` | ✅ | Mon profil |
| PUT  | `/api/user/password` | ✅ | Changer le mot de passe |
| GET  | `/api/admin/test` | ✅ ADMIN | Test accès admin |
| GET  | `/api/etudiant/test` | ✅ ETUDIANT | Test accès étudiant |

### Documentation Swagger UI
```
http://localhost:8083/swagger-ui.html
```

---

## Comptes de test (créés au démarrage)

| E-mail | Mot de passe | Rôle |
|---|---|---|
| `admin@smartcampus.ma` | `Admin@12345` | ADMIN |
| `etudiant@smartcampus.ma` | `Etudiant@12345` | ETUDIANT |

---

## Règles de sécurité

- L'e-mail doit être institutionnel (`@smartcampus.ma`)
- Mot de passe : 8+ caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
- Compte verrouillé après **3 échecs de connexion**
- Token JWT valide **1 heure**
- Les tokens de réinitialisation expirent après **15 minutes**
- Les messages d'erreur sont génériques (ne révèlent pas si un e-mail existe)

---

## Lancer les tests

```bash
./mvnw test -Dspring.profiles.active=test
```

---

## Architecture

```
src/
├── config/          # DataInitializer, OpenApiConfig
├── controller/      # AuthController, UserController, AdminController, EtudiantController
├── dto/             # LoginRequest, RegisterRequest, AuthResponse, ...
├── entity/          # User, Role, PasswordResetToken, AuditLog
├── exception/       # GlobalExceptionHandler + exceptions métier
├── repository/      # UserRepository, RoleRepository, ...
├── security/        # SecurityConfig, JwtAuthenticationFilter
└── service/         # AuthService, UserService, JwtService, EmailService, AuditService
```

---

## Membres de l'équipe

| Membre | Rôle | Tickets |
|---|---|---|
| Membre 1 | Backend & sécurité | SC-10, 12, 85, 91, 92, 8, 9 |
| Membre 2 | Fonctionnalités utilisateur | SC-86, 87, 88, 90, 95, 13, 101 |
| Membre 3 | DevOps, API & qualité | SC-11, 93, 94, 96, 97, 98, 99, 100 |
