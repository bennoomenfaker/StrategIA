# StrategIA — Intelligence Stratégique Augmentée par l'IA

Plateforme SaaS d'intelligence stratégique et d'aide à la décision.
Transforme des données brutes en insights actionnables via un pipeline IA résilient (Mistral → Groq → Algorithmique).

## Architecture

```
client/              # Frontend Next.js (Port 3001)
server/
├── backend/         # NestJS API (Port 3000) — modular monolith DDD
├── collector-engine/ # Python Scrapy (Port 8000) — web crawling
└── .env.example
```

## Chaîne de Valeur

```
Type d'Intelligence → Objectif → Axe → Hypothèse → Question → Donnée → Insight
```

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3001 | Dashboard Next.js |
| Backend API | http://localhost:3000/api | API NestJS |
| Swagger | http://localhost:3000/api/docs | Documentation OpenAPI |
| Collector | http://localhost:8000 | Scrapy collector |
| PostgreSQL | localhost:5432 | Base de données |

## Démarrage Rapide

### Backend
```bash
cd server/backend
cp .env.example .env   # Configurer GROQ_API_KEY, MISTRAL_API_KEY, DATABASE_URL
npm install
npx prisma generate
npm run start:dev
# → http://localhost:3000/api/docs
```

### Collector Engine (Python)
```bash
cd server/collector-engine
pip install -r requirements.txt
python run.py config config.example.json
# → http://localhost:8000
```

### Frontend
```bash
cd client
npm install
npm run dev
# → http://localhost:3001
```

### Docker
```bash
cd server/backend
docker-compose up -d
```

## Pipeline IA (Fallback Résilient)

```
StrategicAnalyzer
  → AIRouter.analyser()
    → [Mistral] (primary)       → succès ? return
    → [Groq] (secondary, retry×2) → succès ? return
    → [Algorithmique] (toujours dispo) → return
  → AIValidator (hallucination detection)
  → HypothesisUpdateEngine (scores)
```

Tous les providers retournent le même contrat JSON :
- `summary`, `answer`, `relevance_score`, `hypothesis_impact`, `confidence_score`
- `entities`, `topics`, `provider`, `fallback_used`

### Circuit Breaker
- 3 échecs consécutifs → provider désactivé 60s
- Reset automatique après délai

### Cache
- SHA256(hypothèse + contenu) → 5 min de cache

### Exponential Backoff
- 1s → 2s → 4s entre les retries
- Timeout hard : 15s par appel

## Structure du Projet

```
server/backend/src/
├── main.ts
├── app.module.ts                 # Module racine (14 modules)
├── common/                       # Guards, decorators, enums
├── config/                       # Database, JWT, App config
├── prisma/                       # Schema + service Prisma
└── modules/
    ├── auth/                     # Inscription, connexion, JWT
    ├── users/                    # CRUD utilisateurs
    ├── organizations/            # Multi-tenancy
    ├── projects/                 # Entité centrale
    ├── objectives/               # Objectifs stratégiques
    ├── axes/                     # Axes d'analyse
    ├── hypotheses/               # Hypothèses + validation IA
    ├── perimeters/               # Contextes (géographique, sectoriel)
    ├── collection-plans/         # Plans de collecte
    ├── collection-engine/        # Orchestration pipeline IA
    │   ├── services/             # 18 services
    │   ├── connectors/           # RSS, Web, PDF
    │   └── utils/                # text.utils, ai.utils
    ├── raw-data/                 # Données collectées
    ├── audit/                    # Logs d'activité
    └── ... (insights, recommendations, signals, etc.)
```

## Exemple Concret

```bash
# 1. Créer un projet
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"IA Santé 2026","veilleType":"TECHNOLOGIQUE"}'

# 2. Ajouter un objectif + axe + hypothèse
curl -X POST http://localhost:3000/api/hypotheses \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"content":"LIA générative va transformer le diagnostic","priority":1,"axisId":"<axis_id>"}'

# 3. Créer un plan de collecte avec sources
curl -X POST http://localhost:3000/api/collection-plans \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"question":"Quelles sont les dernières avancées?","frequency":"DAILY","hypothesisId":"<hyp_id>"}'

# 4. Ajouter des mots-clés et sources
curl -X POST http://localhost:3000/api/collection-plans/<plan_id>/keywords \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"keyword":"AI diagnostic","keywordType":"INCLUDE"}'

# 5. Déclencher la collecte
curl -X POST http://localhost:3000/api/collection-engine/trigger/<plan_id> \
  -H "Authorization: Bearer <TOKEN>"
```

Le système collecte, filtre, score, analyse via IA (Mistral → Groq → Fallback algorithmique), génère des insights et met à jour les hypothèses automatiquement.

## Documentation Complète

Voir [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) pour la documentation exhaustive.
