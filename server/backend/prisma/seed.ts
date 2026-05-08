import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Créer une organisation de test
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        slug: 'test-org',
        ownerId: (await prisma.user.findFirst() || await prisma.user.create({
          data: {
            email: 'test@example.com',
            nom: 'Test User',
            password: 'password123',
            type: 'INDIVIDUEL',
          }
        })).id,
      }
    });
  }

  // Créer un projet de test
  let project = await prisma.project.findFirst();
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'Strategic Intelligence Project',
        slug: 'strategic-intelligence-project',
        description: 'Projet de test pour la plateforme StrategIA',
        veilleType: 'CUSTOM',
        organizationId: org.id,
      }
    });
  }

  // Créer une hypothèse de test
  let hypothesis = await prisma.hypothesis.findFirst();
  if (!hypothesis) {
    let axis = await prisma.axis.findFirst();
    if (!axis) {
      let objective = await prisma.objective.findFirst();
      if (!objective) {
        objective = await prisma.objective.create({
          data: {
            content: 'Test objective',
            projectId: project.id,
          }
        });
      }
      axis = await prisma.axis.create({
        data: {
          name: 'Test Axis',
          objectiveId: objective.id,
        }
      });
    }
    hypothesis = await prisma.hypothesis.create({
      data: {
        content: 'Test hypothesis',
        axisId: axis.id,
      }
    });
  }

  // Créer un collection plan
  let plan = await prisma.collectionPlan.findFirst();
  if (!plan) {
    plan = await prisma.collectionPlan.create({
      data: {
        question: 'What are the latest AI breakthroughs?',
        hypothesisId: hypothesis.id,
      }
    });
  }

  // Ajouter des raw items de test
  const testItems = [
    {
      title: 'Google DeepMind achieves breakthrough in protein folding prediction',
      sourceType: 'RSS' as const,
      sourceUrl: 'https://techcrunch.com/2026/05/01/deepmind-breakthrough',
      sourceName: 'TechCrunch',
      hash: 'hash1',
      contentRaw: 'New AlphaFold 3 model achieves 95% accuracy...',
      contentCleaned: 'New AlphaFold 3 model achieves 95% accuracy in predicting protein structures',
      summary: 'Google DeepMind annonce une avancée majeure dans la prédiction de la structure des protéines.',
      publishedAt: new Date('2026-05-05T10:00:00Z'),
      fetchedAt: new Date(),
      sentimentScore: 0.94,
      entities: { persons: ['John Doe'], organizations: ['Google', 'DeepMind'] },
      projectId: project.id,
      collectionPlanId: plan.id,
      isDuplicate: false,
    },
    {
      title: 'EU proposes new AI Act amendments targeting healthcare',
      sourceType: 'WEB' as const,
      sourceUrl: 'https://reuters.com/2026/05/02/eu-ai-act',
      sourceName: 'Reuters',
      hash: 'hash2',
      contentRaw: 'European Commission announces stricter requirements...',
      contentCleaned: 'European Commission announces stricter requirements for AI in medical diagnosis',
      summary: 'L\'UE propose de nouveaux amendements à l\'AI Act ciblant les applications de santé.',
      publishedAt: new Date('2026-05-05T09:00:00Z'),
      fetchedAt: new Date(),
      sentimentScore: 0.87,
      entities: { organizations: ['EU', 'European Commission'] },
      projectId: project.id,
      collectionPlanId: plan.id,
      isDuplicate: false,
    },
    {
      title: 'Startup raises $200M for AI-powered drug discovery platform',
      sourceType: 'WEB' as const,
      sourceUrl: 'https://bloomberg.com/2026/05/03/ai-drug-discovery-funding',
      sourceName: 'Bloomberg',
      hash: 'hash3',
      contentRaw: 'Recursion Pharmaceuticals secures Series D...',
      contentCleaned: 'Recursion Pharmaceuticals secures Series D to expand its AI-driven drug discovery platform',
      summary: 'Une startup spécialisée dans la découverte de médicaments par IA lève 200M$.',
      publishedAt: new Date('2026-05-05T08:00:00Z'),
      fetchedAt: new Date(),
      sentimentScore: 0.82,
      entities: { organizations: ['Recursion Pharmaceuticals'] },
      projectId: project.id,
      collectionPlanId: plan.id,
      isDuplicate: false,
    },
  ];

  for (const item of testItems) {
    await prisma.rawItem.create({ data: item });
  }

  console.log('✅ Test data added successfully!');
  console.log(`📰 Added ${testItems.length} raw items`);
}

main()
  .catch(e => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
