# StrategIA - Strategic Intelligence Platform

AI-Augmented Strategic Intelligence & Competitive Intelligence SaaS Platform

## Architecture

```
StrategIA/
├── client/              # Next.js Frontend (Port 3001)
├── server/
│   ├── backend/         # NestJS Backend API (Port 3000)
│   └── collector-engine/ # Python Scrapy Collector (Port 8000)
└── PROJECT_DOCUMENTATION.md
```

## Quick Start

### Backend
```bash
cd server/backend
npm install
npx prisma generate
npm run start:dev
```

### Collector Engine
```bash
cd server/collector-engine
pip install -r requirements.txt
python run.py config config.example.json
```

### Frontend
```bash
cd client
npm install
npm run dev
```


docker run -d -p 6379:6379 redis

### Docker
```bash
cd server/backend
docker-compose up -d
```

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3001 | Next.js Dashboard |
| Backend API | http://localhost:3000/api | NestJS REST API |
| Swagger Docs | http://localhost:3000/api/docs | OpenAPI Documentation |
| Collector Engine | http://localhost:8000 | Python Scrapy Collector |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache & Queue |


1. Redis（）
docker run -d -p 6379:6379 redis
# ：sudo systemctl start redis
2. （NestJS + BullMQ + Swagger）
cd /home/himawari/workSpace/StrategIA/server/backend
npm run start:dev
 Swagger：http://localhost:3000/api/docs
3. （Python FastAPI）
cd /home/himawari/workSpace/StrategIA/server/collector-engine
pip install fastapi uvicorn
python server.py
：http://localhost:8000
4. （Next.js）
cd /home/himawari/workSpace/StrategIA/client
npm run dev

cd server/collector-engine && pip install fastapi uvicorn && python server.py


C'est normal ! Tu n'as pas encore créé de périmètres, donc la liste est vide.
Procédure à suivre :
1. Créer d'abord les périmètres racines (sans parent) :
   - Nom: Afrique, Type: GEOGRAPHIC, Parent: None (root level)
   - Nom: Europe, Type: GEOGRAPHIC, Parent: None (root level)
   - Nom: FinTech, Type: SECTORIAL, Parent: None (root level)
2. Ensuite créer les sous-périmètres :
   - Nom: Afrique du Nord, Type: GEOGRAPHIC, Parent: Afrique
   - Nom: Tunisie, Type: GEOGRAPHIC, Parent: Afrique du Nord
