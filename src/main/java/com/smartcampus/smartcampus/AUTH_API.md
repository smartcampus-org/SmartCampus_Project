# SmartCampus — API d'authentification

## Base URL

`http://localhost:8080`

## 1. Connexion

**POST** `/api/auth/login`

Authentifie un utilisateur et retourne un token JWT.

Exemple de requête :

```json
{
  "email": "admin@smartcampus.ma",
  "password": "mot-de-passe"
}
```

Réponse attendue : `200 OK`

La réponse contient le token, son type, l'identifiant, l'email et le rôle de l'utilisateur.

Erreurs possibles : `401 Unauthorized` si les identifiants sont incorrects ou si le compte n'est pas autorisé à se connecter.

## 2. Déconnexion

**POST** `/api/auth/logout`

Retourne un message de déconnexion.

**Limite actuelle :** cet endpoint ne révoque pas le JWT côté serveur.

## 3. Profil connecté

**GET** `/api/auth/me`

Retourne le profil de l'utilisateur authentifié.

Authentification requise : `Bearer Token`.

Réponse attendue : `200 OK`.

## 4. Route de test administrateur

**GET** `/api/admin/test`

Rôle requis : `ADMIN`.

Réponse attendue : `200 OK` pour un administrateur autorisé.

## 5. Route de test étudiant

**GET** `/api/etudiant/test`

Rôle requis : `ETUDIANT`.

Réponse attendue : `200 OK` pour un étudiant autorisé.

## 6. Gestion des accès

- Token absent ou invalide : accès refusé.
- Utilisateur authentifié sans le rôle requis : `403 Forbidden`.
- Identifiants de connexion incorrects : `401 Unauthorized`, après vérification de la gestion des erreurs.
