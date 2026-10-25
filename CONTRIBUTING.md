# Conventions Git — SmartCampus

## SC-11 — Branches

| Branche | Rôle |
|---|---|
| `main` | Production — protégée, merge uniquement via PR |
| `develop` | Intégration continue |
| `feature/SC-XX-description` | Nouvelle fonctionnalité |
| `fix/SC-XX-description` | Correction de bug |
| `hotfix/SC-XX-description` | Correctif urgent sur main |

## Commits

Format : `type(scope): message court`

```
feat(auth): ajouter l'inscription SC-86
fix(security): corriger le verrouillage de compte SC-13
test(auth): ajouter tests d'intégration SC-97
docs(api): compléter le README SC-100
```

Types autorisés : `feat`, `fix`, `test`, `docs`, `refactor`, `chore`, `ci`

## Pull Requests

- Une PR = un ticket Jira
- Titre : `[SC-XX] Description courte`
- Au moins 1 approbation avant le merge
- Les tests doivent passer (pipeline Jenkins)
- Pas de merge direct sur `main`

## Protection de la branche main

Règles à configurer dans GitHub :
- ✅ Require pull request before merging
- ✅ Require at least 1 approval
- ✅ Require status checks to pass (Jenkins CI)
- ✅ Do not allow force pushes
