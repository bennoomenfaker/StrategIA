# 🧠 StrategIA - Documentation Complète du Projet

> **AI-Augmented Strategic Intelligence & Competitive Intelligence SaaS Platform**

---

## 📋 TABLE DES MATIÈRES

1. [Vision du Produit](#vision-du-produit)
2. [Concept Central](#concept-central)
3. [Stack Technique](#stack-technique)
4. [Architecture Système](#architecture-système)
5. [Architecture DDD - Structure des Modules](#architecture-ddd---structure-des-modules)
6. [Modèle de Données](#modèle-de-données)
7. [Schéma PostgreSQL Complet](#schéma-postgresql-complet)
8. [Flux de Collecte de Données](#flux-de-collecte-de-données)
9. [Système de Sécurité](#système-de-sécurité)
10. [Système de File d'Attente](#système-de-file-dattente)
11. [Connecteurs](#connecteurs)
12. [Collection Engine](#collection-engine)
13. [Multi-Tenancy](#multi-tenancy)
14. [Préparation IA](#préparation-ia)
15. [Guide de Déploiement](#guide-de-déploiement)
16. [Configuration PostgreSQL](#configuration-postgresql)

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

## 🏗️ STACK TECHNIQUE

| Composant | Technologie | Version |
|-----------|-------------|---------|
| **Backend** | NestJS (TypeScript) | ^10.x |
| **Architecture** | Modular Monolith (DDD) | - |
| **Base de données** | PostgreSQL | ^15 |
| **ORM** | Prisma | ^5.x |
| **File d'attente** | BullMQ | ^5.x |
| **Cache/Queue** | Redis | ^7 |
| **Authentification** | JWT (Access + Refresh) | - |
| **Multi-tenancy** | Isolation par organization | - |
| **Validation** | class-validator + class-transformer | - |

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

*Document généré pour StrategIA Platform - Version 2.0*



ommandes corrigées pour lancer
1. Backend
cd /home/himawari/workSpace/StrategIA/server/backend
npm install
npx prisma generate
npm run start:dev
2. Collector Engine
cd /home/himawari/workSpace/StrategIA/server/collector-engine
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py config config.example.json
3. Frontend
cd /home/himawari/workSpace/StrategIA/client
npm install
npm run dev
4. Docker (v2, PAS v1)
cd /home/himawari/workSpace/StrategIA/server/backend
docker compose up -d
⚠️ Important : utiliser docker compose (avec espace, v2) PAS docker-compose (tiret, v1 cassée sur Python 3.12).