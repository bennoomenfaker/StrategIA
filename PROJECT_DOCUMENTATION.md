# 🧠 StrategIA - Documentation Complète du Projet

> **AI-Augmented Strategic Intelligence & Competitive Intelligence SaaS Platform**

---

## ⚠️ IMPORTANT POUR TOUTE SESSION OPENCODE

**CE FICHIER EST LA SOURCE DE VÉRITÉ DU PROJET.**

Si vous êtes un agent OpenCode lisant ce fichier dans une nouvelle conversation :

### Contexte du projet
- **Nom** : StrategIA
- **Type** : Full-stack SaaS Platform (Frontend + Backend + Collector Engine)
- **Frontend** : Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui + React Flow
- **Backend** : NestJS (TypeScript), Architecture DDD Modular Monolith, Swagger UI/OpenAPI
- **Collector** : Python Scrapy + trafilatura + sentence-transformers (NLP filtering)
- **Database** : PostgreSQL 15+ avec Prisma ORM
- **Queue** : BullMQ + Redis
- **Auth** : JWT (access + refresh tokens), RBAC (OWNER, TEAM_MEMBER, VIEWER)
- **Multi-tenant** : Isolation par organization_id
- **Concept central** : Type d'Intelligence → Objectif → Axe → Hypothèse → Question → Donnée → Insight

### Structure du projet (RESTRUCTURÉ)
```
StrategIA/
├── PROJECT_DOCUMENTATION.md    # CE FICHIER (source de vérité)
├── README.md                    # Guide de démarrage rapide
├── client/                      # Frontend Next.js (Port 3001)
│   ├── src/
│   │   ├── app/                 # App Router (pages)
│   │   ├── components/          # UI components
│   │   ├── lib/                 # API client, utils
│   │   ├── stores/              # Zustand stores
│   │   ├── hooks/               # Custom React hooks
│   │   ├── types/               # TypeScript types
│   │   └── styles/              # Global CSS (Tailwind)
│   ├── package.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── Dockerfile
└── server/
    ├── backend/                 # Backend NestJS (Port 3000)
    │   ├── src/
    │   │   ├── main.ts          # Entry point + Swagger setup
    │   │   ├── app.module.ts
    │   │   ├── common/          # Guards, decorators, enums, interceptors
    │   │   ├── config/          # Database, JWT, Redis, App config
    │   │   ├── prisma/          # Schema + Prisma service
    │   │   └── modules/         # 13 DDD modules
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── nest-cli.json
    │   ├── docker-compose.yml   # Full stack (backend + collector + frontend + db + redis)
    │   ├── Dockerfile
    │   └── .env.example
        └── collector-engine/        # Python Scrapy Collector (Port 8000)
        ├── strategist_collector/
        │   ├── spiders/         # Web spider + RSS spider
        │   ├── pipelines/       # Extraction, filtering, scoring, storage
        │   ├── extractors/      # Trafilatura, Readability, Fallback
        │   ├── filtering/       # Keyword filter, Semantic filter, Dedup
        │   ├── storage/         # JSONL + PostgreSQL storage
        │   └── utils/           # Config loader
        ├── server.py           # ⭐ NEW: FastAPI server for API mode
        ├── run.py               # Entry point (CLI mode)
        ├── requirements.txt
        ├── config.example.json
        └── Dockerfile
```

### Fichier de contexte
- Ce fichier `PROJECT_DOCUMENTATION.md` contient TOUTE la documentation du projet
- Il doit être MIS À JOUR après chaque changement majeur
- Toute nouvelle conversation OpenCode doit LIRE ce fichier pour comprendre le contexte
- L'historique des changements est dans la section [HISTORIQUE DES CHANGEMENTS](#historique-des-changements)

### PostgreSQL setup (machine locale)
- **User** : root
- **Password** : root
- **Status** : Active (`sudo systemctl status postgresql`)
- **Database** : `strategia_db`

### Structure de développement (STEPS)
Le développement est découpé en 4 étapes :
- **STEP 1** : Folder structure + Prisma schema + Swagger ✅ (COMPLETÉ)
- **STEP 2** : auth module + users module + organizations module (stubs créés, logique à implémenter)
- **STEP 3** : projects + objectives + axes + hypotheses + perimeters (stubs créés)
- **STEP 4** : collection-plans + collection-engine + connectors + raw-data (stubs créés)
- **Collector Engine** : Python Scrapy avec NLP filtering ✅ (COMPLETÉ)
- **Frontend** : Next.js dashboard complet ✅ (COMPLETÉ)

### État actuel du développement
| Composant | Statut | Description |
|-----------|--------|-------------|
| **Documentation** | ✅ FAIT | PROJECT_DOCUMENTATION.md complet |
| **Structure** | ✅ FAIT | Réorganisé en client/ + server/backend/ + server/collector-engine/ |
| **Backend NestJS** | ✅ FAIT | 13 modules, schema.prisma, guards, decorators, Swagger UI |
| **Collector Engine** | ✅ FAIT | Scrapy spiders, extractors, NLP pipelines, scoring |
| **Frontend Next.js** | ✅ FAIT | Dashboard, pages, graph, feed, analytics |
| **STEP 2-4 (logique)** | ⏳ PENDING | Implémentation complète des controllers/services |

### Règles à suivre
1. Production-grade code uniquement
2. Pas de pseudo-code
3. Pas d'implémentations incomplètes
4. TypeScript strict
5. Architecture DDD obligatoire
6. Design hautement scalable
7. Chaque entité liée à un project_id
8. Isolation stricte par organization
9. Soft delete sur Project
10. Guards sur TOUS les endpoints

---

## 📋 TABLE DES MATIÈRES

1. [Contexte OpenCode](#important-pour-toute-session-opencode)
2. [Vision du Produit](#vision-du-produit)
3. [Concept Central](#concept-central)
4. [Stack Technique](#stack-technique)
5. [Architecture Système](#architecture-système)
6. [Architecture DDD - Structure des Modules](#architecture-ddd---structure-des-modules)
7. [Modèle de Données](#modèle-de-données)
8. [Schéma PostgreSQL Complet](#schéma-postgresql-complet)
9. [Flux de Collecte de Données](#flux-de-collecte-de-données)
10. [Système de Sécurité](#système-de-sécurité)
11. [Système de File d'Attente](#système-de-file-dattente)
12. [Connecteurs](#connecteurs)
13. [Collection Engine](#collection-engine)
14. [Multi-Tenancy](#multi-tenancy)
15. [Préparation IA](#préparation-ia)
16. [Guide de Déploiement](#guide-de-déploiement)
17. [Configuration PostgreSQL](#configuration-postgresql)
18. [Historique des Changements](#historique-des-changements)

---

## 🎯 VISION DU PRODUIT

StrategIA est une plateforme SaaS d'intelligence stratégique et d'aide à la décision.

**Ce n'est PAS un simple agrégateur de données.**

C'est un **système d'intelligence décisionnelle** qui transforme :

```
Données brutes non structurées → Insights stratégiques structurés
```

---

## 🧩 CONCEPT CENTRAL

Le système est construit autour de cette chaîne logique **IMMUABLE** :

```
Type d'Intelligence → Objectif → Axe → Hypothèse → Question → Donnée → Insight
```

### Explication de la chaîne :

| Étape | Description | Exemple |
|-------|-------------|---------|
| **Type d'Intelligence** | Catégorie de veille | Technologique, Concurrentielle, Réglementaire |
| **Objectif** | But stratégique | "Surveiller les innovations IA dans la santé" |
| **Axe** | Dimension d'analyse | "Acteurs majeurs", "Technologies émergentes" |
| **Hypothèse** | Postulat à vérifier | "L'IA générative va transformer le diagnostic médical d'ici 2027" |
| **Question** | Interrogation de collecte | "Quelles sont les dernières avancées en IA pour le diagnostic ?" |
| **Donnée** | Information brute collectée | Articles, rapports, publications |
| **Insight** | Connaissance actionnable | Synthèse validée/infirmant l'hypothèse |

**TOUTE l'architecture du système suit cette structure.**

---

## 📡 SERVICES ET PORTS

| Service | URL | Port | Description |
|---------|-----|------|-------------|
| **Frontend** | http://localhost:3001 | 3001 | Next.js Dashboard |
| **Backend API** | http://localhost:3000/api | 3000 | NestJS REST API |
| **Swagger Docs** | http://localhost:3000/api/docs | 3000 | OpenAPI Documentation |
| **Collector Engine** | http://localhost:8000 | 8000 | Python Scrapy Collector |
| **PostgreSQL** | localhost:5432 | 5432 | Database |
| **Redis** | localhost:6379 | 6379 | Cache & Queue |

---

## 📖 SWAGGER UI / OPENAPI

Le backend inclut Swagger UI intégré avec documentation OpenAPI complète.

### Configuration (`main.ts`)
```typescript
const config = new DocumentBuilder()
  .setTitle('StrategIA API')
  .setDescription('AI-Augmented Strategic Intelligence Platform')
  .setVersion('1.0')
  .addBearerAuth()
  .addTag('auth', 'Authentication & Token management')
  .addTag('users', 'User management')
  .addTag('organizations', 'Multi-tenant organization management')
  .addTag('projects', 'Project CRUD and access control')
  .addTag('objectives', 'Strategic objectives')
  .addTag('axes', 'Analysis axes')
  .addTag('hypotheses', 'Hypothesis management')
  .addTag('perimeters', 'Hierarchical context perimeters')
  .addTag('collection-plans', 'Data collection plan management')
  .addTag('collection-engine', 'Async collection orchestration')
  .addTag('connectors', 'Data source connectors (RSS, Web, PDF)')
  .addTag('raw-data', 'Collected raw data')
  .addTag('audit', 'Activity logging & audit trail')
  .build();
```

### Tags par module
- `auth` : POST /auth/register, POST /auth/login, POST /auth/refresh
- `users` : CRUD utilisateurs
- `organizations` : CRUD organizations + gestion membres
- `projects` : CRUD projects + accès contrôlé
- `objectives` : CRUD objectives liés aux projects
- `axes` : CRUD axes liés aux objectives
- `hypotheses` : CRUD hypotheses + validation
- `perimeters` : CRUD perimeters hiérarchiques
- `collection-plans` : CRUD plans + sources + keywords
- `collection-engine` : Trigger collection + status jobs
- `connectors` : RSS/Web/PDF connector endpoints
- `raw-data` : Query collected data
- `audit` : Activity logs

---

### Backend (server/backend/)
| Composant | Technologie | Version |
|-----------|-------------|---------|
| **Framework** | NestJS (TypeScript) | ^10.x |
| **Architecture** | Modular Monolith (DDD) | - |
| **ORM** | Prisma | ^5.x |
| **Queue** | BullMQ | ^5.x |
| **Auth** | JWT + Passport | - |
| **API Docs** | Swagger UI + OpenAPI | ^7.2 |

### Frontend (client/)
| Composant | Technologie | Version |
|-----------|-------------|---------|
| **Framework** | Next.js 14 (App Router) | ^14.1 |
| **Styling** | TailwindCSS + shadcn/ui | ^3.4 |
| **State** | Zustand | ^4.4 |
| **Data Fetching** | React Query (TanStack) | ^5.17 |
| **Animations** | Framer Motion | ^10.18 |
| **Graph** | React Flow | ^11.10 |
| **Charts** | Recharts | ^2.10 |

### Collector Engine (server/collector-engine/)
| Composant | Technologie | Usage |
|-----------|-------------|-------|
| **Core** | Scrapy | Web crawling |
| **RSS** | feedparser | RSS parsing |
| **Extraction** | trafilatura | Main content extraction |
| **Fallback 1** | readability-lxml | Article extraction |
| **Fallback 2** | BeautifulSoup | Generic HTML parsing |
| **NLP** | sentence-transformers | Semantic filtering |
| **Scoring** | scikit-learn | TF-IDF (optional) |
| **Language** | langdetect | Language detection |

### Dépendances principales :

```json
{
  "@nestjs/core": "^10.0.0",
  "@nestjs/jwt": "^10.0.0",
  "@nestjs/passport": "^10.0.0",
  "@nestjs/bullmq": "^10.0.0",
  "@nestjs/schedule": "^4.0.0",
  "@prisma/client": "^5.0.0",
  "bullmq": "^5.0.0",
  "ioredis": "^5.0.0",
  "passport-jwt": "^4.0.0",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.0"
}
```

---

## 📐 ARCHITECTURE SYSTÈME

### Vue d'ensemble :

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Frontend)                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY (NestJS)                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                          GUARDS LAYER                                │    │
│  │  JwtAuthGuard → RolesGuard → ProjectAccessGuard                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ ┌────────────────┐  │
│  │  AUTH MODULE │ │ USERS MODULE │ │ ORGANIZATIONS    │ │  PROJECTS      │  │
│  │              │ │              │ │ MODULE           │ │  MODULE        │  │
│  └──────────────┘ └──────────────┘ └──────────────────┘ └────────────────┘  │
│                                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ ┌────────────────┐  │
│  │ OBJECTIVES   │ │  AXES MODULE │ │ HYPOTHESES       │ │  PERIMETERS    │  │
│  │ MODULE       │ │              │ │ MODULE           │ │  MODULE        │  │
│  └──────────────┘ └──────────────┘ └──────────────────┘ └────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                    COLLECTION SYSTEM                              │       │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │       │
│  │  │ COLLECTION PLANS │ │ COLLECTION       │ │   CONNECTORS     │  │       │
│  │  │ MODULE           │ │ ENGINE MODULE    │ │   MODULE         │  │       │
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘  │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│  ┌──────────────────┐ ┌──────────────────┐                                   │
│  │  RAW DATA MODULE │ │  AUDIT MODULE     │                                   │
│  └──────────────────┘ └──────────────────┘                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
              ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
              │  PostgreSQL   │ │    Redis     │ │  BullMQ      │
              │  (Prisma)     │ │   (Cache)    │ │  (Queue)     │
              └──────────────┘ └──────────────┘ └──────────────┘
```

### Structure des dossiers (NestJS DDD) :

```
strategia-backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── public.decorator.ts
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   └── permissions.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── project-access.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   ├── enums/
│   │   │   ├── user-type.enum.ts
│   │   │   ├── organization-role.enum.ts
│   │   │   ├── veille-type.enum.ts
│   │   │   ├── frequency.enum.ts
│   │   │   ├── source-type.enum.ts
│   │   │   ├── keyword-type.enum.ts
│   │   │   ├── hypothesis-status.enum.ts
│   │   │   └── perimeter-type.enum.ts
│   │   └── interfaces/
│   │       ├── user-payload.interface.ts
│   │       └── collection-result.interface.ts
│   │
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── redis.config.ts
│   │   └── app.config.ts
│   │
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
│   │   └── schema.prisma
│   │
│   └── modules/
│       ├── auth/
│       ├── users/
│       ├── organizations/
│       ├── projects/
│       ├── objectives/
│       ├── axes/
│       ├── hypotheses/
│       ├── perimeters/
│       ├── collection-plans/
│       ├── collection-engine/
│       ├── connectors/
│       ├── raw-data/
│       └── audit/
```

---

## 📦 ARCHITECTURE DDD - STRUCTURE DES MODULES

### Module Pattern (appliqué à chaque module) :

```
module-name/
├── module-name.module.ts          # Module NestJS
├── module-name.controller.ts      # Contrôleur (routes API)
├── module-name.service.ts         # Logique métier
├── entities/                       # Entités DDD
│   └── <entity>.entity.ts
├── dto/                           # Data Transfer Objects
│   ├── create-<entity>.dto.ts
│   ├── update-<entity>.dto.ts
│   └── <entity>-response.dto.ts
├── repositories/                  # Couche d'accès aux données
│   └── <entity>.repository.ts
└── policies/                      # Policies métier (si nécessaire)
    └── <entity>-policy.service.ts
```

### Responsabilités de chaque module :

| Module | Responsabilité |
|--------|----------------|
| **auth** | Inscription, connexion, JWT, refresh tokens |
| **users** | CRUD utilisateurs, profils, statuts |
| **organizations** | Multi-tenancy, membres, rôles (OWNER, TEAM_MEMBER, VIEWER) |
| **projects** | Entité centrale, tout est lié à un projet |
| **objectives** | Objectifs stratégiques du projet |
| **axes** | Axes d'analyse liés aux objectifs |
| **hypotheses** | Hypothèses à valider/invalider |
| **perimeters** | Contexte hiérarchique (géographique, sectoriel) |
| **collection-plans** | Plans de collecte (question + sources + keywords + fréquence) |
| **collection-engine** | Orchestration async via BullMQ, scheduling, filtrage, déduplication |
| **connectors** | RSS, Web scraping, PDF extraction |
| **raw-data** | Stockage données brutes collectées |
| **audit** | Logs d'activité, traçabilité |

---

## 🗃️ MODÈLE DE DONNÉES

### Règles fondamentales :

1. **Chaque entité est liée à un `project_id`** (directement ou indirectement)
2. **Isolation stricte par organization** (multi-tenant)
3. **Soft delete** implémenté (`deletedAt` sur Project)
4. **Relations hiérarchiques** : Objective → Axis → Hypothesis → CollectionPlan

### Chaîne de relations :

```
Organization
    └── Project
            └── Objective
                    └── Axis
                            └── Hypothesis
                                    ├── Perimeter (many-to-many)
                                    └── CollectionPlan
                                            ├── Source (RSS, Web, PDF)
                                            ├── Keyword (include/exclude)
                                            └── RawItem (données collectées)
```

### Diagramme Entité-Relation simplifié :

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   User       │       │ Organization │       │   Project    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │
│ email        │       │ name         │       │ name         │
│ nom          │       │ slug (UQ)    │       │ slug (UQ)    │
│ password     │       │ ownerId      │       │ veilleType   │
│ type         │       │ logo         │       │ organization │
│ status       │       │ website      │       │ ownerUser    │
│ refreshToken │       └──────┬───────┘       └──────┬───────┘
└──────┬───────┘              │                      │
       │               ┌──────┴───────┐       ┌──────┴───────┐
       │               │ OrgMember    │       │ Objective    │
       │               ├──────────────┤       ├──────────────┤
       │               │ orgId        │       │ content      │
       │               │ userId       │       │ priority     │
       │               │ role         │       │ projectId    │
       │               │ status       │       └──────┬───────┘
       │               └──────────────┘              │
       │                                      ┌──────┴───────┐
       │                                      │ Axis         │
       │                                      ├──────────────┤
       │                                      │ name         │
       │                                      │ description  │
       │                                      │ objectiveId  │
       │                                      └──────┬───────┘
       │                                             │
       │                                      ┌──────┴──────────┐
       │                                      │ Hypothesis      │
       │                                      ├─────────────────┤
       │                                      │ content         │
       │                                      │ status          │
       │                                      │ validationScore │
       │                                      │ axisId          │
       │                                      │ createdBy       │
       │                                      └────┬───────┬────┘
       │                                           │       │
       │                                    ┌──────┘       └──────┐
       │                                    │                     │
       │                             ┌──────┴──────┐      ┌──────┴──────┐
       │                             │ Perimeter   │      │ CollectPlan │
       │                             ├─────────────┤      ├─────────────┤
       │                             │ name        │      │ question    │
       │                             │ type        │      │ frequency   │
       │                             │ projectId   │      │ isActive    │
       │                             │ parentId    │      │ hypothesisId│
       │                             └─────────────┘      └──────┬──────┘
       │                                                         │
       │                                                  ┌──────┴──────┐
       │                                                  │   Source    │
       │                                                  │   Keyword   │
       │                                                  └──────┬──────┘
       │                                                         │
       │                                                  ┌──────┴──────┐
       │                                                  │  RawItem    │
       │                                                  ├─────────────┤
       │                                                  │ title       │
       │                                                  │ contentRaw  │
       │                                                  │ hash (UQ)   │
       │                                                  │ projectId   │
       │                                                  └─────────────┘
```

---

## 🗄️ SCHÉMA POSTGRESQL COMPLET

### Prérequis PostgreSQL

```bash
# Vérifier le statut de PostgreSQL
sudo systemctl status postgresql

# Se connecter en tant que root
psql -U root -d postgres
```

### Script SQL complet :

```sql
-- ============================================================================
-- StrategIA Platform - Schéma PostgreSQL Production
-- Version: 2.0
-- Database: PostgreSQL 15+
-- ============================================================================

-- ============================================================================
-- 1. CREATION DE LA BASE DE DONNEES
-- ============================================================================

CREATE DATABASE strategia_db
    WITH
    OWNER = root
    ENCODING = 'UTF8'
    LC_COLLATE = 'fr_FR.UTF-8'
    LC_CTYPE = 'fr_FR.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

\c strategia_db

-- ============================================================================
-- 2. EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Pour la recherche full-text

-- ============================================================================
-- 3. ENUMS
-- ============================================================================

-- Type d'utilisateur
CREATE TYPE user_type AS ENUM ('INDIVIDUEL', 'ORGANISATION');

-- Statut utilisateur
CREATE TYPE user_status AS ENUM ('ACTIF', 'INACTIF', 'SUSPENDU');

-- Rôle dans l'organisation
CREATE TYPE organization_role AS ENUM ('OWNER', 'TEAM_MEMBER', 'VIEWER');

-- Statut membre
CREATE TYPE member_status AS ENUM ('ACTIVE', 'PENDING', 'INACTIVE');

-- Type de veille
CREATE TYPE veille_type AS ENUM (
    'TECHNOLOGIQUE',
    'CONCURRENTIELLE',
    'REGLEMENTAIRE',
    'MARCHES',
    'SCIENTIFIQUE',
    'MEDIAS',
    'CUSTOM'
);

-- Fréquence de collecte
CREATE TYPE frequency AS ENUM ('ON_DEMAND', 'DAILY', 'WEEKLY', 'MONTHLY');

-- Type de source
CREATE TYPE source_type AS ENUM ('RSS', 'WEB', 'API', 'PDF');

-- Type de keyword
CREATE TYPE keyword_type AS ENUM ('INCLUDE', 'EXCLUDE');

-- Statut hypothèse
CREATE TYPE hypothesis_status AS ENUM ('OPEN', 'VALIDATED', 'INVALIDATED', 'IN_PROGRESS');

-- Type de périmètre
CREATE TYPE perimeter_type AS ENUM ('GEOGRAPHIC', 'SECTORIAL');

-- Statut job
CREATE TYPE job_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETRY');

-- ============================================================================
-- 4. TABLES - AUTH & USERS
-- ============================================================================

-- Table utilisateurs
CREATE TABLE users (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    nom             VARCHAR(255) NOT NULL,
    password        VARCHAR(255) NOT NULL,
    type            user_type    NOT NULL,
    status          user_status  NOT NULL DEFAULT 'ACTIF',
    refresh_token   TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(type);
CREATE INDEX idx_users_status ON users(status);

-- Table refresh tokens
CREATE TABLE refresh_tokens (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    token        VARCHAR(512) NOT NULL UNIQUE,
    user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at   TIMESTAMPTZ  NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Table activity logs
CREATE TABLE activity_logs (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id),
    action      VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255) NOT NULL,
    entity_id   VARCHAR(255) NOT NULL,
    metadata    JSONB,
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- ============================================================================
-- 5. TABLES - ORGANIZATIONS
-- ============================================================================

-- Table organizations
CREATE TABLE organizations (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(255) NOT NULL,
    slug       VARCHAR(255) NOT NULL UNIQUE,
    owner_id   UUID         NOT NULL REFERENCES users(id),
    logo       VARCHAR(512),
    website    VARCHAR(512),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);

-- Table organization members
CREATE TABLE organization_members (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID            NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID            NOT NULL REFERENCES users(id),
    role            organization_role NOT NULL,
    status          member_status   NOT NULL DEFAULT 'ACTIVE',
    invited_by      UUID            REFERENCES users(id),
    joined_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_org_members_role ON organization_members(role);
CREATE INDEX idx_org_members_status ON organization_members(status);

-- ============================================================================
-- 6. TABLES - PROJECTS (CORE ENTITY)
-- ============================================================================

CREATE TABLE projects (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    slug            VARCHAR(255) NOT NULL UNIQUE,
    veille_type     veille_type  NOT NULL DEFAULT 'CUSTOM',
    start_date      TIMESTAMPTZ,
    end_date        TIMESTAMPTZ,
    organization_id UUID         REFERENCES organizations(id) ON DELETE CASCADE,
    owner_user_id   UUID         REFERENCES users(id),
    folder_id       UUID,
    is_archived     BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_projects_owner_user_id ON projects(owner_user_id);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX idx_projects_is_archived ON projects(is_archived);

-- ============================================================================
-- 7. TABLES - STRATEGIC STRUCTURE
-- ============================================================================

-- Table objectives
CREATE TABLE objectives (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    content    TEXT        NOT NULL,
    priority   INTEGER     NOT NULL DEFAULT 1,
    project_id UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_objectives_project_id ON objectives(project_id);
CREATE INDEX idx_objectives_priority ON objectives(priority);

-- Table axes
CREATE TABLE axes (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(255) NOT NULL,
    description  TEXT,
    priority     INTEGER     NOT NULL DEFAULT 1,
    objective_id UUID        NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_axes_objective_id ON axes(objective_id);
CREATE INDEX idx_axes_priority ON axes(priority);

-- Table hypotheses
CREATE TABLE hypotheses (
    id               UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    content          TEXT             NOT NULL,
    priority         INTEGER          NOT NULL DEFAULT 1,
    status           hypothesis_status NOT NULL DEFAULT 'OPEN',
    validation_score DOUBLE PRECISION,
    validated_at     TIMESTAMPTZ,
    validated_by     UUID             REFERENCES users(id),
    axis_id          UUID             NOT NULL REFERENCES axes(id) ON DELETE CASCADE,
    created_by       UUID             REFERENCES users(id),
    created_at       TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hypotheses_axis_id ON hypotheses(axis_id);
CREATE INDEX idx_hypotheses_status ON hypotheses(status);
CREATE INDEX idx_hypotheses_priority ON hypotheses(priority);

-- ============================================================================
-- 8. TABLES - PERIMETERS (HIERARCHICAL)
-- ============================================================================

CREATE TABLE perimeters (
    id         UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(255)   NOT NULL,
    type       perimeter_type NOT NULL,
    project_id UUID           NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_id  UUID           REFERENCES perimeters(id),
    created_at TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_perimeters_project_id ON perimeters(project_id);
CREATE INDEX idx_perimeters_parent_id ON perimeters(parent_id);
CREATE INDEX idx_perimeters_project_parent ON perimeters(project_id, parent_id);
CREATE INDEX idx_perimeters_type ON perimeters(type);

-- Table de jointure hypothesis-perimeter (many-to-many)
CREATE TABLE hypothesis_perimeters (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    hypothesis_id UUID        NOT NULL REFERENCES hypotheses(id) ON DELETE CASCADE,
    perimeter_id  UUID        NOT NULL REFERENCES perimeters(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(hypothesis_id, perimeter_id)
);

CREATE INDEX idx_hyp_perimeters_hypothesis ON hypothesis_perimeters(hypothesis_id);
CREATE INDEX idx_hyp_perimeters_perimeter ON hypothesis_perimeters(perimeter_id);

-- ============================================================================
-- 9. TABLES - COLLECTION PLANS (CORE INNOVATION)
-- ============================================================================

CREATE TABLE collection_plans (
    id                     UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    question               TEXT          NOT NULL,
    frequency              frequency     NOT NULL DEFAULT 'DAILY',
    cron_expression        VARCHAR(100),
    collection_start_date  TIMESTAMPTZ,
    collection_end_date    TIMESTAMPTZ,
    is_active              BOOLEAN       NOT NULL DEFAULT TRUE,
    last_run_at            TIMESTAMPTZ,
    next_run_at            TIMESTAMPTZ,
    hypothesis_id          UUID          NOT NULL REFERENCES hypotheses(id) ON DELETE CASCADE,
    created_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collection_plans_hypothesis ON collection_plans(hypothesis_id);
CREATE INDEX idx_collection_plans_is_active ON collection_plans(is_active);
CREATE INDEX idx_collection_plans_next_run ON collection_plans(next_run_at);
CREATE INDEX idx_collection_plans_frequency ON collection_plans(frequency);

-- Table collection plan sources
CREATE TABLE collection_plan_sources (
    id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_plan_id UUID         NOT NULL REFERENCES collection_plans(id) ON DELETE CASCADE,
    source_type        source_type  NOT NULL,
    source_label       VARCHAR(255) NOT NULL,
    source_url         TEXT         NOT NULL,
    is_active          BOOLEAN      NOT NULL DEFAULT TRUE,
    last_fetched_at    TIMESTAMPTZ,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE(collection_plan_id, source_url)
);

CREATE INDEX idx_plan_sources_plan_id ON collection_plan_sources(collection_plan_id);
CREATE INDEX idx_plan_sources_type ON collection_plan_sources(source_type);
CREATE INDEX idx_plan_sources_active ON collection_plan_sources(is_active);

-- Table collection plan keywords
CREATE TABLE collection_plan_keywords (
    id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_plan_id UUID         NOT NULL REFERENCES collection_plans(id) ON DELETE CASCADE,
    keyword            VARCHAR(255) NOT NULL,
    keyword_type       keyword_type NOT NULL DEFAULT 'INCLUDE',
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE(collection_plan_id, keyword)
);

CREATE INDEX idx_plan_keywords_plan_id ON collection_plan_keywords(collection_plan_id);
CREATE INDEX idx_plan_keywords_keyword ON collection_plan_keywords(keyword);
CREATE INDEX idx_plan_keywords_type ON collection_plan_keywords(keyword_type);

-- ============================================================================
-- 10. TABLES - RAW DATA STORAGE
-- ============================================================================

CREATE TABLE raw_items (
    id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    title             VARCHAR(1000),
    content_raw       TEXT,
    content_cleaned   TEXT,
    summary           TEXT,
    source_type       source_type    NOT NULL,
    source_url        TEXT           NOT NULL,
    source_name       VARCHAR(500),
    published_at      TIMESTAMPTZ,
    fetched_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    hash              VARCHAR(64)    NOT NULL,  -- SHA-256
    is_duplicate      BOOLEAN        NOT NULL DEFAULT FALSE,
    duplicate_of_id   UUID           REFERENCES raw_items(id),
    language          VARCHAR(10),
    word_count        INTEGER,
    metadata          JSONB,
    project_id        UUID           NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    collection_plan_id UUID          NOT NULL REFERENCES collection_plans(id) ON DELETE CASCADE,
    collected_by      UUID           REFERENCES users(id),
    processed_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    -- Champs pour IA future
    entities          JSONB,
    classification    VARCHAR(255),
    sentiment_score   DOUBLE PRECISION
);

-- Contrainte d'unicité : hash unique par projet (pas global)
CREATE UNIQUE INDEX idx_raw_items_hash_project ON raw_items(hash, project_id);

CREATE INDEX idx_raw_items_project_id ON raw_items(project_id);
CREATE INDEX idx_raw_items_collection_plan ON raw_items(collection_plan_id);
CREATE INDEX idx_raw_items_source_type ON raw_items(source_type);
CREATE INDEX idx_raw_items_published_at ON raw_items(published_at);
CREATE INDEX idx_raw_items_fetched_at ON raw_items(fetched_at);
CREATE INDEX idx_raw_items_is_duplicate ON raw_items(is_duplicate);
CREATE INDEX idx_raw_items_project_created ON raw_items(project_id, created_at);
CREATE INDEX idx_raw_items_plan_fetched ON raw_items(collection_plan_id, fetched_at);
CREATE INDEX idx_raw_items_hash ON raw_items(hash);

-- ============================================================================
-- 11. TABLES - COLLECTION JOBS (QUEUE TRACKING)
-- ============================================================================

CREATE TABLE collection_jobs (
    id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_plan_id UUID         NOT NULL REFERENCES collection_plans(id) ON DELETE CASCADE,
    status             job_status   NOT NULL DEFAULT 'PENDING',
    items_found        INTEGER      NOT NULL DEFAULT 0,
    items_stored       INTEGER      NOT NULL DEFAULT 0,
    error_message      TEXT,
    started_at         TIMESTAMPTZ,
    completed_at       TIMESTAMPTZ,
    retry_count        INTEGER      NOT NULL DEFAULT 0,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collection_jobs_plan ON collection_jobs(collection_plan_id);
CREATE INDEX idx_collection_jobs_status ON collection_jobs(status);
CREATE INDEX idx_collection_jobs_created ON collection_jobs(created_at);

-- ============================================================================
-- 12. FONCTIONS & TRIGGERS
-- ============================================================================

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur toutes les tables avec updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_members_updated_at
    BEFORE UPDATE ON organization_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_objectives_updated_at
    BEFORE UPDATE ON objectives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_axes_updated_at
    BEFORE UPDATE ON axes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hypotheses_updated_at
    BEFORE UPDATE ON hypotheses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_perimeters_updated_at
    BEFORE UPDATE ON perimeters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collection_plans_updated_at
    BEFORE UPDATE ON collection_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collection_plan_sources_updated_at
    BEFORE UPDATE ON collection_plan_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 13. VUES UTILES
-- ============================================================================

-- Vue : Statistiques par organisation
CREATE OR REPLACE VIEW v_organization_stats AS
SELECT
    o.id AS organization_id,
    o.name AS organization_name,
    COUNT(DISTINCT p.id) AS total_projects,
    COUNT(DISTINCT obj.id) AS total_objectives,
    COUNT(DISTINCT h.id) AS total_hypotheses,
    COUNT(DISTINCT cp.id) AS total_collection_plans,
    COUNT(DISTINCT ri.id) AS total_raw_items,
    COUNT(DISTINCT om.user_id) AS total_members
FROM organizations o
LEFT JOIN projects p ON p.organization_id = o.id AND p.deleted_at IS NULL
LEFT JOIN objectives obj ON obj.project_id = p.id
LEFT JOIN axes a ON a.objective_id = obj.id
LEFT JOIN hypotheses h ON h.axis_id = a.id
LEFT JOIN collection_plans cp ON cp.hypothesis_id = h.id
LEFT JOIN raw_items ri ON ri.collection_plan_id = cp.id
LEFT JOIN organization_members om ON om.organization_id = o.id AND om.status = 'ACTIVE'
GROUP BY o.id, o.name;

-- Vue : Collecte active (plans actifs avec prochaine exécution)
CREATE OR REPLACE VIEW v_active_collections AS
SELECT
    cp.id AS plan_id,
    cp.question,
    cp.frequency,
    cp.next_run_at,
    cp.is_active,
    h.content AS hypothesis,
    p.name AS project_name,
    o.name AS organization_name,
    COUNT(DISTINCT cps.id) AS source_count,
    COUNT(DISTINCT cpk.id) AS keyword_count
FROM collection_plans cp
JOIN hypotheses h ON h.id = cp.hypothesis_id
JOIN axes a ON a.id = h.axis_id
JOIN objectives obj ON obj.id = a.objective_id
JOIN projects p ON p.id = obj.project_id
LEFT JOIN organizations o ON o.id = p.organization_id
LEFT JOIN collection_plan_sources cps ON cps.collection_plan_id = cp.id AND cps.is_active = TRUE
LEFT JOIN collection_plan_keywords cpk ON cpk.collection_plan_id = cp.id
WHERE cp.is_active = TRUE
  AND (cp.collection_end_date IS NULL OR cp.collection_end_date > NOW())
GROUP BY cp.id, h.content, p.name, o.name;

-- Vue : Items dupliqués
CREATE OR REPLACE VIEW v_duplicate_items AS
SELECT
    ri.id,
    ri.title,
    ri.hash,
    ri.source_url,
    ri.project_id,
    p.name AS project_name,
    ri.duplicate_of_id,
    ri.fetched_at
FROM raw_items ri
JOIN projects p ON p.id = ri.project_id
WHERE ri.is_duplicate = TRUE;

-- ============================================================================
-- 14. DONNÉES DE TEST (OPTIONNEL)
-- ============================================================================

-- Insérer un utilisateur admin de test (password: "admin123" hashé avec bcrypt)
-- IMPORTANT: En production, utilisez un hash bcrypt réel
INSERT INTO users (id, email, nom, password, type, status) VALUES
    (gen_random_uuid(), 'admin@strategia.io', 'Administrateur', '$2b$10$placeholder_hash', 'INDIVIDUEL', 'ACTIF')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- FIN DU SCHEMA
-- ============================================================================
```

---

## 🔄 FLUX DE COLLECTE DE DONNÉES

### Diagramme de flux complet :

```
┌─────────────────┐
│  Scheduler      │ (cron / BullMQ repeatable jobs)
│  Service        │
└────────┬────────┘
         │ Déclenche les plans actifs dont next_run_at <= NOW()
         ▼
┌─────────────────┐
│  Collection     │
│  Plans Service  │
└────────┬────────┘
         │ Récupère les sources et keywords du plan
         │ Crée un job BullMQ
         ▼
┌─────────────────┐
│  BullMQ Queue   │ (collection-queue)
│  (Redis)        │
└────────┬────────┘
         │ Consommé par le processor
         ▼
┌─────────────────┐
│  Collection     │
│  Engine Service │
└────────┬────────┘
         │ Pour chaque source du plan :
         │   1. Sélectionne le connector approprié
         │   2. Exécute la collecte
         │   3. Applique le filtrage par keywords
         │   4. Calcule le hash pour déduplication
         │   5. Stocke dans raw_items
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  RSS Connector  │     │  Web Connector  │     │  PDF Connector  │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Raw Items Table                              │
│  (title, content, source, hash, project_id, collection_plan_id) │
└─────────────────────────────────────────────────────────────────┘
```

### Détail du flux de déduplication :

```
1. Collecte → Contenu brut
2. Nettoyage → HTML → Texte pur
3. Normalisation → lowercase, trim, remove extra whitespace
4. Hash SHA-256 → hash du contenu normalisé
5. Vérification → SELECT FROM raw_items WHERE hash = ? AND project_id = ?
6. Si existe → is_duplicate = true, duplicate_of_id = id_existante
7. Si n'existe pas → INSERT normal
```

---

## 🔐 SYSTÈME DE SÉCURITÉ

### Architecture d'authentification :

```
Request → JwtAuthGuard → Validate Token → Extract User → Attach to Request
                                    │
                                    ▼
                              RolesGuard → Check Role (OWNER, TEAM_MEMBER, VIEWER)
                                    │
                                    ▼
                           ProjectAccessGuard → Verify project membership
                                    │
                                    ▼
                              Controller Handler
```

### JWT Tokens :

| Token | Durée | Stockage | Usage |
|-------|-------|----------|-------|
| **Access Token** | 15 min | Mémoire client | Requêtes API |
| **Refresh Token** | 7 jours | DB (refresh_tokens) | Renouvellement access token |

### Rôles et permissions :

| Permission | OWNER | TEAM_MEMBER | VIEWER |
|------------|-------|-------------|--------|
| Créer projet | ✅ | ✅ | ❌ |
| Modifier projet | ✅ | ✅ | ❌ |
| Supprimer projet | ✅ | ❌ | ❌ |
| Gérer membres | ✅ | ❌ | ❌ |
| Voir données | ✅ | ✅ | ✅ |
| Créer plan de collecte | ✅ | ✅ | ❌ |
| Exécuter collecte | ✅ | ✅ | ❌ |

### Guards appliqués sur TOUS les endpoints :

```typescript
// Exemple d'application de guards
@UseGuards(JwtAuthGuard, RolesGuard, ProjectAccessGuard)
@Roles(OrganizationRole.OWNER, OrganizationRole.TEAM_MEMBER)
@Get(':id')
async findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
  // ...
}
```

---

## 📊 SYSTÈME DE FILE D'ATTENTE

### BullMQ Configuration :

```
Redis (localhost:6379)
    └── BullMQ Queue: "collection-queue"
            ├── Processor: CollectionQueueProcessor
            ├── Concurrency: 5 jobs simultanés
            ├── Retry: 3 tentatives avec backoff exponentiel
            └── Timeout: 5 minutes par job
```

### Jobs configurés :

| Job Type | Fréquence | Priorité | Description |
|----------|-----------|----------|-------------|
| **COLLECT** | Selon plan | High | Exécuter un plan de collecte |
| **DEDUPLICATE** | Après COLLECT | Medium | Vérifier les doublons |
| **CLEANUP** | Hebdomadaire | Low | Nettoyer les anciens tokens |

### Retry mechanism :

```
Tentative 1 → Immédiate
Tentative 2 → Après 30 secondes (backoff)
Tentative 3 → Après 5 minutes (backoff)
Échec final → Status FAILED, error_message enregistré
```

---

## 🔌 CONNECTEURS

### Interface commune des connecteurs :

```typescript
interface IConnector {
  type: SourceType;
  collect(config: ConnectorConfig): Promise<CollectionResult[]>;
  validate(url: string): boolean;
}

interface ConnectorConfig {
  url: string;
  keywords?: string[];
  excludedKeywords?: string[];
  maxItems?: number;
  headers?: Record<string, string>;
}

interface CollectionResult {
  title: string;
  content: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt?: Date;
  metadata?: Record<string, any>;
}
```

### Connecteur RSS :

- **Bibliothèque** : `rss-parser`
- **Fonctionnement** : Parse le flux XML RSS/Atom
- **Extraction** : Titre, contenu, date, auteur, lien

### Connecteur Web (Scraping) :

- **Bibliothèque** : `cheerio` + `axios`
- **Fonctionnement** : Télécharge HTML, extrait le contenu textuel
- **Nettoyage** : Supprime scripts, styles, navigation

### Connecteur PDF :

- **Bibliothèque** : `pdf-parse` ou `pdf-lib`
- **Fonctionnement** : Extrait le texte des documents PDF
- **Limitation** : PDF text-only (pas d'OCR pour le moment)

---

## ⚙️ COLLECTION ENGINE

### Services internes :

| Service | Responsabilité |
|---------|----------------|
| **CollectionEngineService** | Orchestration principale |
| **FilterService** | Filtrage par keywords (include/exclude) |
| **DeduplicationService** | Détection de doublons par hash |
| **RetryService** | Gestion des retries avec backoff |
| **CollectionSchedulerService** | Planification cron/BullMQ |
| **CollectionQueueProcessor** | Consumer BullMQ |

### Fréquences supportées :

| Fréquence | Cron Expression | Description |
|-----------|-----------------|-------------|
| **ON_DEMAND** | N/A | Exécution manuelle uniquement |
| **DAILY** | `0 9 * * *` | Tous les jours à 9h |
| **WEEKLY** | `0 9 * * 1` | Chaque lundi à 9h |
| **MONTHLY** | `0 9 1 * *` | Le 1er de chaque mois à 9h |
| **CUSTOM** | Expression personnalisée | Selon cron_expression |

---

## 🏢 MULTI-TENANCY

### Stratégie d'isolation :

```
Toutes les requêtes passent par :
1. JwtAuthGuard → identifie l'utilisateur
2. L'utilisateur appartient à une ou plusieurs organizations
3. Chaque projet appartient à une organization
4. Toutes les données sont isolées par organization_id

Requête typique :
SELECT * FROM raw_items ri
JOIN projects p ON p.id = ri.project_id
WHERE p.organization_id = :userOrganizationId
  AND p.deleted_at IS NULL
```

### Points clés :

- **Pas de schema separation** → isolation logique via `organization_id`
- **Toutes les queries filtrent par organization**
- **Guards vérifient l'appartenance à l'organization**
- **Les admins ne voient que leurs organizations**

---

## 🕷️ COLLECTOR ENGINE API

### Architecture de communication

```
Frontend (Bouton "Déclencher")
    ↓
Backend NestJS (POST /collection-engine/trigger/:planId)
    ↓
BullMQ Queue (Redis)
    ↓
Backend Processor (CollectionProcessor)
    ↓
HTTP Request → Python Collector API (http://localhost:8000/collect)
    ↓
Scrapy Spiders (Web + RSS)
    ↓
Données collectées → Backend API → PostgreSQL
```

### Lancement du Collector Engine

Le collector peut maintenant être lancé en **mode API** (recommandé) ou **mode CLI** :

#### 1. Mode API (pour intégration avec le backend)
```bash
cd server/collector-engine

# Installer les dépendances (avec PyTorch CPU)
pip install -r requirements.txt
pip install fastapi uvicorn

# Lancer le serveur API (port 8000 par défaut)
python server.py
# Ou avec un port spécifique :
COLLECTOR_PORT=8000 python server.py
```

**Endpoints disponibles :**
- `POST /collect` - Déclencher une collecte (reçoi `planId`, `sources`, `keywords`)
- `GET /collect/{plan_id}/status` - Statut de la collecte
- `POST /collect/config` - Collecte via fichier de config
- `GET /health` - Health check

#### 2. Mode CLI (pour tests manuels)
```bash
cd server/collector-engine

# Via fichier de config
python run.py config config.example.json

# Web uniquement
python run.py web "https://www.techcrunch.com,https://example.com"

# RSS uniquement
python run.py rss "https://feeds.feedburner.com/TechCrunch"
```

### Configuration de l'URL du Collector

Dans le backend (`server/backend/.env`) :
```env
COLLECTOR_URL=http://localhost:8000
```

### Test du Collector API

```bash
# Test health check
curl http://localhost:8000/health

# Test collection
curl -X POST http://localhost:8000/collect \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "test-123",
    "sources": [
      {"url": "https://www.techcrunch.com", "type": "web", "label": "TechCrunch"}
    ],
    "keywords": ["AI", "startup"]
  }'
```

---

## 🤖 PRÉPARATION IA

### Champs préparés pour l'IA dans `raw_items` :

| Champ | Type | Usage futur |
|-------|------|-------------|
| `content_cleaned` | TEXT | HTML nettoyé, texte extrait |
| `summary` | TEXT | Résumé généré par IA |
| `entities` | JSONB | Entités nommées (personnes, organisations, lieux) |
| `classification` | VARCHAR(255) | Catégorie automatique |
| `sentiment_score` | DOUBLE PRECISION | Score de sentiment (-1 à +1) |

### Hooks architecturaux pour l'IA :

```
Collection Engine
    └── Après stockage raw_items
            └── (FUTUR) Pipeline IA :
                    ├── 1. HTML Cleaning (contentRaw → contentCleaned)
                    ├── 2. Text Extraction
                    ├── 3. Summarization (→ summary)
                    ├── 4. Classification (→ classification)
                    └── 5. Entity Recognition (→ entities)
```

### Connecteurs IA prêts à être ajoutés :

- **OpenAI/Anthropic** : Résumé, classification, extraction d'entités
- **HuggingFace** : Modèles NLP open-source
- **Spacy** : NER (Named Entity Recognition)

---

## 🚀 GUIDE DE DÉPLOIEMENT

### Prérequis système :

```bash
# Node.js 18+
node --version

# PostgreSQL 15+
psql --version

# Redis 7+
redis-server --version
```

### Configuration PostgreSQL (votre setup) :

```bash
# Vérifier le statut
sudo systemctl status postgresql

# Votre config :
# User: root
# Password: root
# Status: Active
```

### Étapes de déploiement :

```bash
# 1. Cloner le projet
git clone <repo-url>
cd strategia-backend

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 4. Créer la base de données
psql -U root -c "CREATE DATABASE strategia_db;"

# 5. Exécuter les migrations Prisma
npx prisma migrate dev

# 6. Générer le client Prisma
npx prisma generate

# 7. Compiler le projet
npm run build

# 8. Démarrer en développement
npm run start:dev

# 9. Démarrer en production
npm run start:prod
```

### Variables d'environnement (.env) :

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://root:root@localhost:5432/strategia_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# App
APP_NAME=StrategIA
APP_URL=http://localhost:3000
```

---

## 🔧 CONFIGURATION POSTGRESQL

### Connexion avec votre setup :

```bash
# Connexion directe
psql -U root -d postgres

# Vérifier les bases existantes
\l

# Créer la base StrategIA
CREATE DATABASE strategia_db
    WITH
    OWNER = root
    ENCODING = 'UTF8'
    LC_COLLATE = 'fr_FR.UTF-8'
    LC_CTYPE = 'fr_FR.UTF-8';

# Se connecter à la nouvelle base
\c strategia_db

# Exécuter le script SQL complet
\i /chemin/vers/schema.sql
```

### Optimisations PostgreSQL recommandées :

```sql
-- Dans postgresql.conf :
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 4MB
random_page_cost = 1.1
effective_io_concurrency = 200

-- Autovacuum (important pour les tables avec beaucoup de writes)
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 1min
```

### Maintenance :

```sql
-- Analyser les statistiques
ANALYZE;

-- Reindexer si nécessaire
REINDEX DATABASE strategia_db;

-- Vérifier la taille des tables
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 📊 RÉSUMÉ DES TABLES

| Table | Colonnes | Relations | Description |
|-------|----------|-----------|-------------|
| `users` | 9 | 1:N projects, organizations | Utilisateurs du système |
| `refresh_tokens` | 5 | N:1 users | Tokens de rafraîchissement JWT |
| `activity_logs` | 8 | N:1 users | Audit trail |
| `organizations` | 7 | 1:N projects, members | Entités multi-tenant |
| `organization_members` | 8 | N:1 org, N:1 user | Membres d'organizations |
| `projects` | 13 | N:1 org, N:1 user, 1:N objectives, axes, etc. | Entité centrale |
| `objectives` | 5 | N:1 projects, 1:N axes | Objectifs stratégiques |
| `axes` | 6 | N:1 objectives, 1:N hypotheses | Axes d'analyse |
| `hypotheses` | 10 | N:1 axes, 1:N collection_plans | Hypothèses à vérifier |
| `perimeters` | 7 | N:1 projects, self-ref (hierarchie) | Contextes hiérarchiques |
| `hypothesis_perimeters` | 4 | N:1 hypotheses, N:1 perimeters | Jointure M:N |
| `collection_plans` | 12 | N:1 hypotheses, 1:N sources, keywords, raw_items | Plans de collecte |
| `collection_plan_sources` | 8 | N:1 collection_plans | Sources de données |
| `collection_plan_keywords` | 5 | N:1 collection_plans | Keywords de filtrage |
| `raw_items` | 20 | N:1 projects, N:1 collection_plans, N:1 users | Données collectées |
| `collection_jobs` | 10 | N:1 collection_plans | Suivi des jobs |

**Total : 16 tables**

---

## 📝 NOTES IMPORTANTES

### Conventions de nommage :

- **Tables** : snake_case, pluriel (`raw_items`, `collection_plans`)
- **Colonnes** : snake_case (`created_at`, `project_id`)
- **Enums** : snake_case, pluriel (`user_type`, `organization_role`)
- **Indexes** : `idx_<table>_<column>` ou `idx_<table>_<column1>_<column2>`

### Clés primaires :

- Toutes les tables utilisent `UUID` avec `gen_random_uuid()`
- Alternative Prisma : `cuid()` (via `@default(cuid())`)

### Soft Delete :

- Uniquement sur `projects` (`deleted_at`)
- Les autres tables utilisent CASCADE DELETE

### Performance :

- Index composites sur les jointures fréquentes
- Index partiel sur `deleted_at IS NULL` pour les queries courantes
- JSONB pour les métadonnées flexibles

---

## 📜 HISTORIQUE DES CHANGEMENTS

### 2026-05-04 - Session 4 : Backend Logic + Frontend Auth + DB Fixes

#### ADDED (implémenté complètement)
| Composant | Fichiers | Description |
|-----------|----------|-------------|
| **Auth Module** | auth.service.ts, auth.controller.ts, dto/*.dto.ts | JWT register/login/refresh/logout + bcrypt |
| **Users Module** | users.service.ts, users.controller.ts, dto/*.dto.ts | CRUD + profile endpoint |
| **Organizations Module** | organizations.service.ts, organizations.controller.ts | CRUD + members management |
| **Projects Module** | projects.service.ts, projects.controller.ts | CRUD + soft delete |
| **Objectives Module** | objectives.service.ts, objectives.controller.ts | CRUD liés aux projects |
| **Axes Module** | axes.service.ts, axes.controller.ts | CRUD liés aux objectives |
| **Hypotheses Module** | hypotheses.service.ts, hypotheses.controller.ts | CRUD + validation endpoint |
| **Perimeters Module** | perimeters.service.ts, perimeters.controller.ts | CRUD + hierarchical tree |
| **CollectionPlans Module** | collection-plans.service.ts, collection-plans.controller.ts | CRUD + sources/keywords |
| **RawData Module** | raw-data.service.ts, raw-data.controller.ts | Query + filter + stats |
| **Audit Module** | audit.service.ts, audit.controller.ts | Activity logs with filters |
| **Collection Engine** | collection-engine.service.ts, collection.processor.ts | Cron + BullMQ + HTTP to Python |
| **Collector API** | server.py (FastAPI) | FastAPI server for Scrapy integration |
| **Frontend Auth** | (auth)/login/page.tsx, (auth)/register/page.tsx | Login/register with JWT storage |
| **Frontend Projects** | projects/page.tsx, projects/new/page.tsx, projects/[id]/page.tsx | Project management UI |
| **Frontend Dashboard** | dashboard/page.tsx | KPIs with real API data |

#### FIXED
| Fichier | Problème | Solution |
|---------|----------|----------|
| `auth.service.ts` | Return format | Unified `{ data: { user, accessToken, refreshToken } }` |
| `collection-engine.service.ts` | Import paths | Fixed `@/prisma/prisma.service` and `@nestjs/schedule` |
| `collection.processor.ts` | Decorators | Fixed `Processor` (class) + `Process` (method) from correct packages |
| `*.controller.ts` | Swagger imports | Moved `ApiTags, ApiOperation, ApiBearerAuth` to `@nestjs/swagger` |
| `*.service.ts` | Prisma imports | Fixed paths to `@/prisma/prisma.service` |
| `projects/page.tsx` | Component imports | Fixed `@/components/ui/button`, `@/components/ui/card` |
| `api.ts` | Response format | Fixed `response.data.data` vs `response.data` handling |
| Database | Schema mismatch | Reset DB + `npx prisma db push` successful |

#### ADDED (new files)
| Fichier | Description |
|---------|-------------|
| `server/collector-engine/server.py` | FastAPI server for collector engine |
| `server/backend/src/modules/*/dto/*.dto.ts` | All DTOs for 13 modules |
| `client/src/app/(auth)/*` | Login/register pages with UI |
| `client/src/app/projects/*` | Project pages (list, create, detail) |

#### DATABASE
- **Reset** : Dropped and recreated `strategia_db`
- **Schema** : Successfully pushed via `npx prisma db push --schema=src/prisma/schema.prisma`
- **Status** : ✅ All 16 tables created with indexes and triggers

#### NEXT STEPS
- [x] Backend logic implemented (13 modules)
- [x] Frontend auth flow working
- [x] Swagger UI with all endpoints
- [x] Collector Engine API (FastAPI)
- [ ] Test full flow: Frontend → Backend → Collector
- [ ] Add React Query for data fetching
- [ ] Polish UI components

#### ADDED
| Composant | Description |
|-----------|-------------|
| **DB Schema** | 16 tables + 2 views + 10 triggers exécutés sur `strategia_db` ✅ |
| **.env** | `server/backend/.env` créé avec credentials root/root |

#### FIXED
| Fichier | Problème | Solution |
|---------|----------|----------|
| `requirements.txt` | `torch==2.1.2` n'existe pas pour Python 3.12 | → `torch>=2.2.0` |
| `requirements.txt` | Versions trop strictes | → `>=` au lieu de `==` |
| `requirements.txt` | `langdetect` needs `setuptools` | → `setuptools>=69.0.0` ajouté |
| `docker-compose` | `distutils` manquant sur Python 3.12 | → utiliser `docker compose` (v2) |

### 2026-05-03 - Session 2 : Restructuration + Collector Engine + Frontend + Swagger

#### ADDED (ajouté)
| Composant | Fichiers | Description |
|-----------|----------|-------------|
| **Restructuration** | - | Projet divisé en `client/` + `server/backend/` + `server/collector-engine/` |
| **Collector Engine** | ~30 fichiers | Python Scrapy avec spiders, extractors, NLP filtering, scoring, dedup |
| **Frontend Next.js** | ~25 fichiers | Dashboard, auth, projects, feed, graph (React Flow), analytics (Recharts) |
| **Swagger UI** | main.ts modifié | OpenAPI docs avec Bearer auth, 13 tags, accessible sur /api/docs |
| **Docker Compose** | modifié | 5 services : backend, frontend, collector, postgres, redis |
| **README.md** | nouveau | Guide de démarrage rapide |

#### MOVED (déplacé)
| Avant | Après | Description |
|-------|-------|-------------|
| `/src/` | `/server/backend/src/` | Tout le code NestJS |
| `/package.json` | `/server/backend/package.json` | Backend deps |
| `/tsconfig.json` | `/server/backend/tsconfig.json` | Backend TS config |
| `/docker-compose.yml` | `/server/backend/docker-compose.yml` | Full stack compose |
| `/Dockerfile` | `/server/backend/Dockerfile` | Backend Dockerfile |

#### MODIFIED (modifié)
| Fichier | Changement |
|---------|------------|
| `server/backend/package.json` | + `@nestjs/swagger`, `swagger-ui-express` |
| `server/backend/src/main.ts` | + Swagger setup avec 13 tags et Bearer auth |
| `server/backend/.env.example` | + `COLLECTOR_ENGINE_URL`, APP_URL changé à 3001 |
| `server/backend/docker-compose.yml` | + services frontend, collector-engine |
| `PROJECT_DOCUMENTATION.md` | Section contexte, structure, stack technique, swagger, history |

### 2026-05-03 - Session Initiale

| Changement | Description | Impact |
|------------|-------------|--------|
| **Création documentation** | PROJECT_DOCUMENTATION.md complet avec toutes les sections | Base du projet |
| **Architecture définie** | NestJS DDD Modular Monolith, 13 modules | Structure système |
| **Schéma DB** | 16 tables PostgreSQL, enums, indexes, triggers, vues | Modèle de données |
| **Contexte OpenCode** | Section header pour persistance entre sessions | Continuité du dev |
| **STEP 1** | Structure projet + schema.prisma + configs + common + module stubs | Foundation complète |

### Prochaines étapes à faire
- [x] ~~STEP 1 : Structure + schema.prisma + configs~~ ✅
- [x] ~~Collector Engine Python Scrapy~~ ✅
- [x] ~~Frontend Next.js Dashboard~~ ✅
- [x] ~~Swagger UI + OpenAPI~~ ✅
- [ ] STEP 2 : Implémenter logique complète auth, users, organizations
- [ ] STEP 3 : Implémenter logique complète projects, objectives, axes, hypotheses, perimeters
- [ ] STEP 4 : Implémenter logique complète collection-plans, engine, connectors, raw-data
- [ ] Integration backend ↔ collector engine (API calls)
- [ ] Integration backend ↔ frontend (React Query hooks)
- [ ] npm install sur backend + client + collector

### Décisions architecturales
1. Prisma ORM choisi sur TypeORM ou raw SQL
2. UUID avec cuid() plutôt que gen_random_uuid() (compatibilité Prisma)
3. Multi-tenancy logique (organization_id) plutôt que schema-per-tenant
4. BullMQ pour les files d'attente (pas de cron pur)
5. Pas d'implémentation IA maintenant, juste les hooks
6. Scrapy choisi pour le collector (pas de simple requests)
7. Trafilatura + Readability + BeautifulSoup pour extraction fallback
8. sentence-transformers pour filtrage sémantique
9. Next.js App Router avec React Flow pour la visualisation
10. Swagger UI intégré au backend pour documentation auto

### Note pour la prochaine session
- **BASE DE DONNÉES** : `strategia_db` créée avec les 16 tables + 2 views + 10 triggers ✅
- **Collector Engine** : requirements.txt corrigé (torch>=2.2.0 pour Python 3.12)
- **Docker** : utiliser `docker compose` (v2, avec espace) au lieu de `docker-compose` (v1, cassé sur Python 3.12)
- **npm install** : requis dans server/backend/ et client/
- **pip install** : requis dans server/collector-engine/ avec `pip install -r requirements.txt`
- PostgreSQL : user=root, mdp=root, host=localhost, port=5432, db=strategia_db ✅
- `psql -U root -h localhost -d strategia_db` fonctionne avec PGPASSWORD=root

### 2026-05-04 - Session 5 : Complete Frontend Pages + CRUD Operations |

#### ADDED (new pages with full CRUD)
| Page | Path | Functionality |
|------|------|---------------|
| **Project Detail** | `/projects/[id]/page.tsx` | Edit project, manage objectives (CRUD), manage axes (CRUD), tabs switch |
| **Project Hypotheses** | `/projects/[id]/hypotheses/page.tsx` | Create/edit/delete hypotheses, change status, filter by axe, link to plans |
| **Project Plans** | `/projects/[id]/plans/page.tsx` | Create/edit/delete plans, add sources (RSS/Web/PDF), add keywords (include/exclude), frequency config |
| **Axes List** | `/axes/page.tsx` | List all axes, create/edit/delete, link to objectives |

#### FUNCTIONALITY ADDED
| Feature | Description |
|---------|-------------|
| **Objectives CRUD** | Create, edit, delete objectives in project detail page with priority |
| **Axes CRUD** | Create, edit, delete axes linked to objectives |
| **Hypotheses CRUD** | Create, edit, delete hypotheses with status change (OPEN, IN_PROGRESS, VALIDATED, INVALIDATED) |
| **Plans CRUD** | Create, edit, delete collection plans with sources and keywords |
| **Sources Management** | Add RSS feeds, websites, PDFs to collection plans |
| **Keywords Management** | Add include/exclude keywords to collection plans |
| **Filtering** | Filter hypotheses by axe, filter plans by hypothesis |
| **Status Updates** | Change hypothesis status with dropdown in UI |
| **Navigation** | "View Axes" from objectives, "View Hypotheses" from axes, "Create Plan" from hypotheses |

#### FIXED
| Issue | Solution |
|-------|----------|
| Project detail page duplicate export | Recreated file with single export default |
| Objectives couldn't be edited/deleted | Added edit/delete buttons with handlers |
| Axes page didn't exist | Created `/axes/page.tsx` with full CRUD |
| Hypotheses page not working | Created `/projects/[id]/hypotheses/page.tsx` with form |
| Plans page missing sources/keywords | Created `/projects/[id]/plans/page.tsx` with full form |
| No navigation between entities | Added buttons linking objectives→axes→hypotheses→plans |

#### DATABASE RELATIONS
- Project → Objectives (1:N)
- Objective → Axes (1:N) - with axe count display
- Axe → Hypotheses (1:N) - with hypothesis count display
- Hypothesis → CollectionPlans (1:N)
- CollectionPlan → Sources (1:N), Keywords (1:N)

#### NEXT STEPS
- [x] All frontend pages created with CRUD operations
- [x] Navigation flow between entities
- [ ] Test full flow: Login → Create Project → Objective → Axe → Hypothesis → Plan
- [ ] Add React Query for data fetching (optional)
- [ ] Polish UI with loading states and error handling
- [ ] Implement collector engine integration

#### NOTES FOR NEXT SESSION
- **Frontend pages** : All entities now have full CRUD pages with proper navigation
- **UI Design** : Using shadcn/ui components (Button, Card, Input, Textarea, Label, Badge, Select)
- **State Management** : Zustand for auth, local state for forms
- **API Integration** : Axios with JWT interceptors, response format `{ data: {...} }`
- **Backend** : All 13 modules have working CRUD endpoints with Swagger docs
- **Database** : Prisma schema with 16 tables, all relations working
