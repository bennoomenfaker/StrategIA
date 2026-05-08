# 🧪 Exemple Réel - Utilisation de StrategIA

## 🎯 Scénario : Surveillance de l'IA dans le secteur de la Santé

### Contexte
Vous êtes une entreprise de conseil stratégique qui souhaite surveiller les développements de l'IA générative dans le secteur de la santé.

---

## 📝 Étapes Complètes

### 1. Inscription / Connexion

```bash
# 1. Ouvrir le navigateur
http://localhost:3001/register

# 2. Créer un compte
Email: analyst@strategia.io
Nom: Analyste Stratégique
Password: SecurePass123!

# 3. Se connecter
http://localhost:3001/login
```

### 2. Création du Projet

```bash
# Via l'interface web
1. Cliquer sur "New Project"
2. Remplir le formulaire:
   - Nom: "IA en Santé - Monitoring 2026"
   - Type: TECHNOLOGIQUE
   - Description: "Surveillance des innovations IA dans le diagnostic médical"

# Via API (curl)
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <VOTRE_TOKEN>" \
  -d '{
    "name": "IA en Santé - Monitoring 2026",
    "veilleType": "TECHNOLOGIQUE",
    "description": "Surveillance des innovations IA dans le diagnostic médical"
  }'

# Réponse (exemple):
{
  "id": "proj_123abc",
  "name": "IA en Santé - Monitoring 2026",
  "veilleType": "TECHNOLOGIQUE",
  "description": "...",
  "organization": null
}
```

### 3. Ajout d'Objectifs Stratégiques

```bash
# Via API
curl -X POST http://localhost:3000/api/objectives \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "content": "Surveiller les applications de l'IA générative pour le diagnostic médical",
    "priority": 1,
    "projectId": "proj_123abc"
  }'

# Réponse:
{
  "id": "obj_456def",
  "content": "Surveiller les applications de l'IA générative pour le diagnostic médical",
  "priority": 1,
  "projectId": "proj_123abc"
}
```

### 4. Création d'Axes d'Analyse

```bash
# Via API
curl -X POST http://localhost:3000/api/axes \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Acteurs Majeurs",
    "description": "Google, Microsoft, startups spécialisées",
    "priority": 1,
    "objectiveId": "obj_456def"
  }'

curl -X POST http://localhost:3000/api/axes \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Technologies Émergentes",
    "description": "LLMs, Computer Vision, Analyse prédictive",
    "priority": 2,
    "objectiveId": "obj_456def"
  }'

# Réponses:
{
  "id": "axis_789ghi",
  "name": "Acteurs Majeurs",
  ...
}
{
  "id": "axis_012jkl",
  "name": "Technologies Émergentes",
  ...
}
```

### 5. Formulation d'Hypothèses

```bash
# Via API
curl -X POST http://localhost:3000/api/hypotheses \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "content": "L'IA générative va transformer le diagnostic médical d'ici 2027",
    "priority": 1,
    "axisId": "axis_789ghi"
  }'

curl -X POST http://localhost:3000/api/hypotheses \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "content": "Les startups spécialisées vont dominer le marché de l'IA médicale",
    "priority": 2,
    "axisId": "axis_789ghi"
  }'

# Réponses:
{
  "id": "hyp_345mno",
  "content": "L'IA générative va transformer le diagnostic médical d'ici 2027",
  "status": "OPEN",
  "axisId": "axis_789ghi"
}
```

### 6. Création de Plans de Collecte

```bash
# Via API - Plan pour l'hypothèse 1
curl -X POST http://localhost:3000/api/collection-plans \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "question": "Quelles sont les dernières avancées en IA pour le diagnostic médical?",
    "frequency": "DAILY",
    "hypothesisId": "hyp_345mno"
  }'

# Réponse:
{
  "id": "plan_678pqr",
  "question": "Quelles sont les dernières avancées en IA pour le diagnostic médical?",
  "frequency": "DAILY",
  "isActive": true,
  "hypothesisId": "hyp_345mno"
}
```

### 7. Ajout de Sources (Flux RSS & Sites Web)

```bash
# Ajouter une source RSS (TechCrunch AI)
curl -X POST http://localhost:3000/api/collection-plans/plan_678pqr/sources \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "sourceType": "RSS",
    "sourceLabel": "TechCrunch AI",
    "sourceUrl": "https://techcrunch.com/category/artificial-intelligence/feed/"
  }'

# Ajouter un site web (Nature Medicine)
curl -X POST http://localhost:3000/api/collection-plans/plan_678pqr/sources \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "sourceType": "WEB",
    "sourceLabel": "Nature Medicine",
    "sourceUrl": "https://www.nature.com/nm/"
  }'

# Ajouter des mots-clés
curl -X POST http://localhost:3000/api/collection-plans/plan_678pqr/keywords \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "keyword": "AI diagnostic",
    "keywordType": "INCLUDE"
  }'

curl -X POST http://localhost:3000/api/collection-plans/plan_678pqr/keywords \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "keyword": "radiologie",
    "keywordType": "INCLUDE"
  }'
```

### 8. Configuration des Périmètres (Contextes)

```bash
# Créer un périmètre géographique
curl -X POST http://localhost:3000/api/perimeters \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Amérique du Nord",
    "type": "GEOGRAPHIC",
    "projectId": "proj_123abc"
  }'

# Créer un sous-périmètre
curl -X POST http://localhost:3000/api/perimeters \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "États-Unis",
    "type": "GEOGRAPHIC",
    "projectId": "proj_123abc",
    "parentId": "<ID_Amerique_Nord>"
  }'

# Lier l'hypothèse aux périmètres (via l'interface ou API)
```

### 9. Déclenchement de la Collecte

```bash
# Manuellement via API
curl -X POST http://localhost:3000/api/collection-engine/trigger/plan_678pqr \
  -H "Authorization: Bearer <TOKEN>"

# Ou via l'interface web:
# 1. Aller sur http://localhost:3001/collection-plans
# 2. Cliquer sur "Add Source" pour ajouter des sources
# 3. Cliquer sur "Déclencher maintenant"

# Le backend va:
# 1. Créer un job BullMQ
# 2. Le processor va appeler le Collector Python (http://localhost:8000/collect)
# 3. Le Collector va scraper les sources
# 4. Les données seront stockées dans raw_items
```

### 10. Visualisation des Résultats

```bash
# Voir les données collectées
curl -X GET "http://localhost:3000/api/raw-data?projectId=proj_123abc" \
  -H "Authorization: Bearer <TOKEN>"

# Réponse (exemple):
{
  "items": [
    {
      "id": "raw_123",
      "title": "AI transforms medical diagnosis",
      "sourceUrl": "https://techcrunch.com/...",
      "sourceType": "RSS",
      "publishedAt": "2026-05-04T12:00:00Z",
      "contentCleaned": "L'IA générative...",
      "projectId": "proj_123abc"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}

# Statistiques
curl -X GET http://localhost:3000/api/raw-data/stats/proj_123abc \
  -H "Authorization: Bearer <TOKEN>"

# Réponse:
{
  "total": 15,
  "bySource": [
    { "sourceType": "RSS", "_count": { "sourceType": 10 }},
    { "sourceType": "WEB", "_count": { "sourceType": 5 }}
  ],
  "duplicates": 3
}
```

### 11. Validation des Hypothèses

```bash
# Via API - Valider une hypothèse
curl -X PATCH http://localhost:3000/api/hypotheses/hyp_345mno/validate \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"validatedBy": "user_123"}'

# Via l'interface web:
# 1. Aller sur http://localhost:3001/hypotheses
# 2. Cliquer sur l'icône de validation (✓) à côté de l'hypothèse
```

---

## 📊 Structure Complète Créée

```
Projet: "IA en Santé - Monitoring 2026"
├── Objectif: "Surveiller les applications de l'IA générative..."
│   ├── Axe: "Acteurs Majeurs"
│   │   └── Hypothèse: "L'IA générative va transformer..."
│   │       └── Plan de collecte: "Quelles sont les dernières avancées..."
│   │           ├── Source: TechCrunch AI (RSS)
│   │           ├── Source: Nature Medicine (WEB)
│   │           └── Mots-clés: "AI diagnostic", "radiologie"
│   └── Axe: "Technologies Émergentes"
│       └── Hypothèse: "Les startups vont dominer..."
│           └── Plan de collecte: (similaire)
└── Périmètres:
    ├── Amérique du Nord
    │   └── États-Unis
    └── Europe
        └── France
```

---

## 🔍 Accès aux Interfaces

| Interface | URL | Description |
|-----------|-----|-------------|
| **Inscription** | http://localhost:3001/register | Créer un compte |
| **Connexion** | http://localhost:3001/login | Se connecter |
| **Dashboard** | http://localhost:3001/dashboard | Vue d'ensemble |
| **Projets** | http://localhost:3001/projects | Liste des projets |
| **Hypothèses** | http://localhost:3001/hypotheses | Gestion des hypothèses |
| **Plans** | http://localhost:3001/collection-plans | Plans de collecte |
| **Paramètres** | http://localhost:3001/settings | Profil utilisateur |

---

## 🛠️ Services Nécessaires

```bash
# Terminal 1: Redis (Queue)
docker run -d -p 6379:6379 redis

# Terminal 2: Backend (Port 3000)
cd server/backend
npm run start:dev

# Terminal 3: Frontend (Port 3001)
cd client
npm run dev

# Terminal 4: Collector Engine (Port 8000)
cd server/collector-engine
pip install fastapi uvicorn
python server.py
```

---

## ✅ Résultat Attendu

1. **Données collectées** : Articles, rapports, publications sur l'IA médicale
2. **Insights** : Tendances identifiées, acteurs clés
3. **Validation** : Hypothèses confirmées ou infirmées par les données
4. **Rapports** : Synthèse actionnable pour la direction

---

## 📝 Notes Importantes

- **Fréquence** : DAILY = collecte chaque jour, WEEKLY = chaque semaine
- **Périmètres** : Permettent de filtrer les données par zone géographique/secteur
- **Mots-clés** : INCLUDE = inclure, EXCLUDE = exclure
- **Doublons** : Détectés automatiquement via hash SHA-256
- **Jobs** : Visibles dans `/api/collection-jobs` (statut, erreurs)

---

**Ce exemple montre l'utilisation complète de StrategIA pour une veille stratégique réelle !** 🚀
