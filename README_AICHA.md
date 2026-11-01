# SmartCampus — Sprint 2 · Contribution Backend (Membre 1)

> **Auteure :** Aicha  
> **Rôle :** Responsable Backend  
> **Sprint :** Sprint 2  
> **Date :** Octobre 2026

---

## Vue d'ensemble

Ce document décrit l'ensemble des fonctionnalités backend ajoutées dans le cadre du Sprint 2.  
Le travail porte sur la conception et l'implémentation du **module de gestion des salles du campus** : modèle de données, APIs REST, gestion des statuts avec historique, export CSV, sécurisation par rôle, tests et documentation Swagger.

---

## Ce qui a été ajouté

### BACKEND 1 — Modèle de données (Room)

**Nouvelles entités JPA :**

| Entité | Table SQL | Description |
|---|---|---|
| `Building` | `buildings` | Bâtiment du campus (nom, adresse, nombre d'étages) |
| `Room` | `rooms` | Salle (numéro, nom, bâtiment, étage, capacité, type, statut) |
| `Equipment` | `equipments` | Équipement d'une salle (nom, type, quantité, état) |
| `RoomStatusHistory` | `room_status_history` | Historique des changements de statut d'une salle |

**Énumérations :**

- `RoomType` : `AMPHITHEATRE`, `SALLE_TP`, `SALLE_COURS`, `LABORATOIRE`, `SALLE_REUNION`, `BUREAU`, `AUTRE`
- `RoomStatus` : `DISPONIBLE`, `OCCUPEE`, `EN_MAINTENANCE`, `FERMEE`

**Nouveaux repositories :**

- `BuildingRepository` — avec recherche par nom et vérification d'unicité
- `RoomRepository` — avec recherche multi-critères paginée via `@Query` JPQL
- `EquipmentRepository` — avec filtrage par salle et état fonctionnel
- `RoomStatusHistoryRepository` — avec pagination par salle

**Données de démonstration (DataInitializer) :**

Au démarrage, l'application crée automatiquement :
- 2 bâtiments : *Bâtiment A* (3 étages) et *Bâtiment B* (2 étages)
- 6 salles : amphithéâtre, salles de cours, labo informatique, salle TP, salle de réunion

---

### BACKEND 2 — API de consultation et de recherche

Endpoints disponibles sans mutation :

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/rooms` | Liste paginée de toutes les salles (tri par numéro) |
| `GET` | `/api/rooms/{id}` | Détail complet d'une salle avec ses équipements |
| `GET` | `/api/rooms/search` | Recherche multi-critères (voir paramètres ci-dessous) |
| `GET` | `/api/buildings` | Liste de tous les bâtiments |
| `GET` | `/api/buildings/{id}` | Détail d'un bâtiment avec le nombre de salles |

**Paramètres de recherche (`/api/rooms/search`) :**

| Paramètre | Type | Description |
|---|---|---|
| `keyword` | String | Texte libre — cherche dans le numéro, le nom et le bâtiment |
| `status` | RoomStatus | Filtre par statut (`DISPONIBLE`, `EN_MAINTENANCE`, etc.) |
| `type` | RoomType | Filtre par type de salle |
| `buildingId` | Long | Filtre par bâtiment |
| `minCapacity` | Integer | Capacité minimale requise |
| `page` / `size` | Integer | Pagination |
| `sort` | String | Tri (ex: `capacity,desc`) |

---

### BACKEND 3 — API d'ajout et de modification

Opérations CRUD complètes sur les salles et les bâtiments :

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/api/rooms` | Créer une salle |
| `PUT` | `/api/rooms/{id}` | Modifier une salle |
| `DELETE` | `/api/rooms/{id}` | Supprimer une salle |
| `POST` | `/api/buildings` | Créer un bâtiment |
| `PUT` | `/api/buildings/{id}` | Modifier un bâtiment |
| `DELETE` | `/api/buildings/{id}` | Supprimer un bâtiment |

**Validations appliquées :**
- Numéro de salle unique par bâtiment (contrainte SQL + vérification applicative → `409 Conflict`)
- Nom de bâtiment unique → `409 Conflict`
- Bâtiment inexistant → `404 Not Found`
- Salle inexistante → `404 Not Found`
- Validation des champs avec `@Valid` → `400 Bad Request`

---

### BACKEND 4 — Gestion des équipements

API imbriquée sous les salles (`/api/rooms/{roomId}/equipments`) :

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/rooms/{roomId}/equipments` | Lister les équipements d'une salle |
| `GET` | `/api/rooms/{roomId}/equipments/{id}` | Détail d'un équipement |
| `POST` | `/api/rooms/{roomId}/equipments` | Ajouter un équipement |
| `PUT` | `/api/rooms/{roomId}/equipments/{id}` | Modifier un équipement |
| `DELETE` | `/api/rooms/{roomId}/equipments/{id}` | Supprimer un équipement |

**Champs d'un équipement :** nom, type (catégorie libre), quantité, état fonctionnel (boolean), notes.

---

### BACKEND 5 — Gestion des statuts avec historique

| Méthode | Route | Description |
|---|---|---|
| `PATCH` | `/api/rooms/{id}/status` | Changer le statut d'une salle |
| `GET` | `/api/rooms/{id}/status-history` | Consulter l'historique des changements de statut |

Chaque changement de statut enregistre :
- L'ancien statut et le nouveau statut
- L'email de l'utilisateur ayant effectué le changement (`changedBy`)
- La raison du changement (optionnelle)
- La date et l'heure exacte

---

### BACKEND 6 — Export CSV

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/rooms/export` | Télécharger le catalogue complet des salles en CSV |

**Caractéristiques du fichier généré :**
- Nom : `smartcampus_rooms.csv`
- Encodage : UTF-8 avec BOM (compatible Excel directement)
- Séparateur : `;`
- Colonnes : ID, Numéro, Nom, Bâtiment, Étage, Capacité, Type, Statut, Description, Équipements
- Les équipements sont résumés dans une seule colonne (ex: `Projecteur BenQ (x2, OK) | Tableau (x1, HS)`)

---

### BACKEND 7 — Sécurisation des APIs par rôle

Les nouvelles routes sont protégées selon la matrice suivante :

| Opération | ADMIN | PERSONNEL | PROFESSEUR | ETUDIANT |
|---|:---:|:---:|:---:|:---:|
| Lire les salles / bâtiments / équipements | ✅ | ✅ | ✅ | ✅ |
| Exporter en CSV | ✅ | ✅ | ✅ | ❌ |
| Créer / modifier / supprimer | ✅ | ✅ | ❌ | ❌ |
| Changer le statut d'une salle | ✅ | ✅ | ❌ | ❌ |

Tout accès non authentifié retourne `403 Forbidden`.

---

### BACKEND 8 — Tests unitaires et d'intégration

**Tests unitaires (Mockito) :**

| Fichier | Cas testés |
|---|---|
| `RoomServiceTest` | findById OK, findById 404, create OK, create doublon, create bâtiment inexistant, update OK, delete OK, delete 404, changeStatus (historique + statut), search (délégation repository) |
| `EquipmentServiceTest` | findByRoom OK, create OK, update OK, update mauvaise salle (404), delete OK, delete 404 |

**Tests d'intégration (MockMvc + H2) :**

| Fichier | Cas testés |
|---|---|
| `RoomControllerIntegrationTest` | GET liste (200), GET sans token (403), GET par id (200), GET id inexistant (404), GET search keyword, GET search sans résultat, POST admin (201), POST étudiant (403), POST doublon (409), PUT (200), DELETE (200), PATCH status (200), GET historique (200), GET export CSV (200 + content-type) |
| `EquipmentControllerIntegrationTest` | GET liste (200), POST create (201), PUT update (200), DELETE (200), DELETE inexistant (404) |

Les tests utilisent le profil `test` avec **H2 en mémoire** — aucune base MySQL requise.

---

### TECH 1 — Mise à jour de la documentation OpenAPI/Swagger

- Version de l'API passée de `1.0.0` à `2.0.0`
- Description enrichie avec la liste des modules disponibles
- Nouveaux tags Swagger : **Bâtiments**, **Salles**, **Équipements**, **Export**
- Annotations `@Operation`, `@ApiResponse`, `@Parameter`, `@SecurityRequirement` sur tous les nouveaux endpoints

Accès Swagger UI : [http://localhost:8083/swagger-ui.html](http://localhost:8083/swagger-ui.html)

---

## Fichiers créés ou modifiés

### Nouveaux fichiers

```
src/main/java/com/smartcampus/smartcampus/
├── entity/
│   ├── Building.java
│   ├── Room.java
│   ├── Equipment.java
│   ├── RoomStatusHistory.java
│   ├── RoomType.java
│   └── RoomStatus.java
├── repository/
│   ├── BuildingRepository.java
│   ├── RoomRepository.java
│   ├── EquipmentRepository.java
│   └── RoomStatusHistoryRepository.java
├── dto/
│   ├── BuildingRequest.java
│   ├── BuildingResponse.java
│   ├── RoomRequest.java
│   ├── RoomSummaryResponse.java
│   ├── RoomDetailResponse.java
│   ├── EquipmentRequest.java
│   ├── EquipmentResponse.java
│   ├── StatusChangeRequest.java
│   └── StatusHistoryResponse.java
├── service/
│   ├── BuildingService.java
│   ├── RoomService.java
│   └── EquipmentService.java
├── controller/
│   ├── BuildingController.java
│   ├── RoomController.java
│   ├── EquipmentController.java
│   └── RoomCsvController.java
└── exception/
    ├── RoomNotFoundException.java
    ├── BuildingNotFoundException.java
    ├── EquipmentNotFoundException.java
    ├── RoomNumberAlreadyExistsException.java
    └── BuildingNameAlreadyExistsException.java

src/test/java/com/smartcampus/smartcampus/
├── service/
│   ├── RoomServiceTest.java
│   └── EquipmentServiceTest.java
└── controller/
    ├── RoomControllerIntegrationTest.java
    └── EquipmentControllerIntegrationTest.java
```

### Fichiers modifiés

```
src/main/java/com/smartcampus/smartcampus/
├── config/
│   ├── DataInitializer.java      ← ajout du seed bâtiments + salles
│   └── OpenApiConfig.java        ← version 2.0.0 + nouveaux modules
├── security/
│   └── SecurityConfig.java       ← nouvelles règles d'autorisation par rôle
└── exception/
    └── GlobalExceptionHandler.java ← nouveaux handlers (Room, Building, Equipment)
```

---

## Comment tester avec Swagger

### 1. Démarrer l'application

```powershell
cd c:\Users\hp\Desktop\smartcampus_devs\SmartCampus_Project
$env:DB_PASSWORD = "Aicha@2001"
$env:JWT_SECRET  = "c21hcnRjYW1wdXMtc2VjcmV0LWtleS0zMmNoYXJzISE="
.\mvnw spring-boot:run
```

### 2. Ouvrir Swagger UI

```
http://localhost:8083/swagger-ui.html
```

### 3. S'authentifier

Dans `POST /api/auth/login` :
```json
{
  "email": "admin@smartcampus.ma",
  "password": "Admin@12345"
}
```

Copier le `accessToken` → cliquer **Authorize** 🔒 → coller le token → **Authorize**.

### 4. Comptes disponibles

| Email | Mot de passe | Rôle | Permissions |
|---|---|---|---|
| `admin@smartcampus.ma` | `Admin@12345` | ADMIN | Toutes les opérations |
| `etudiant@smartcampus.ma` | `Etudiant@12345` | ETUDIANT | Lecture seule |

---

## Lancer les tests

```powershell
.\mvnw test -Dspring.profiles.active=test
```

Les tests s'exécutent avec H2 en mémoire — MySQL n'est pas requis.

---

## Dépendances utilisées

Toutes les dépendances étaient déjà présentes dans le `pom.xml` du Sprint 1 :

| Dépendance | Usage |
|---|---|
| `spring-boot-starter-webmvc` | API REST |
| `spring-boot-starter-data-jpa` | Persistance JPA/Hibernate |
| `spring-boot-starter-security` | Sécurisation des routes |
| `spring-boot-starter-validation` | Validation des DTOs (`@Valid`) |
| `mysql-connector-j` | Base de données MySQL |
| `springdoc-openapi-starter-webmvc-ui` | Swagger UI |
| `h2` (scope test) | Base en mémoire pour les tests |
| `spring-security-test` (scope test) | Support JWT dans les tests |
| `lombok` | Réduction du code répétitif |
