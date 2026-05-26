/**
 * FICHIER: collection-engine.service.ts
 *
 * RÔLE: Orchestre le pipeline complet de collecte : fetch → filtre → dédup → nettoie → score → analyse IA → signaux.
 *
 * RESPONSABILITÉS:
 * - Déclencher les collectes planifiées (CRON toutes les 10 min) et manuelles
 * - Coordonner les connecteurs (Web, RSS, PDF), le filtrage, la déduplication, le scoring
 * - Gérer les jobs de collecte (PENDING → PROCESSING → COMPLETED/FAILED)
 * - Lancer l'analyse stratégique via le routeur IA et la détection de signaux
 *
 * FLUX:
 * - CollectionEngineController → CollectionEngineService → connecteurs → services de traitement → IA → sauvegarde
 *
 * EXEMPLE: L'utilisateur clique "Déclencher la collecte" sur un plan → triggerCollection(planId) est appelé.
 */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/prisma/prisma.service';
import { WebConnectorService } from './connectors/web.connector';
import { RssConnectorService } from './connectors/rss.connector';
import { PdfConnectorService } from './connectors/pdf.connector';
import { FilterService } from './services/filter.service';
import { DeduplicationService } from './services/deduplication.service';
import { TextNormalizerService } from './services/text-normalizer.service';
import { WordAnalyzerService } from './services/word-analyzer.service';
import { RawItemService } from './services/raw-item.service';
import { RelevanceScoringService } from './services/relevance-scoring.service';
import { InsightGeneratorService } from './services/insight-generator.service';
import { StrategicAnalyzerService } from './services/strategic-analyzer.service';
import { BatchBuilderService } from './services/batch-builder.service';
import { HypothesisUpdateEngine } from './services/hypothesis-update-engine.service';
import { SignalDetectionService } from './services/signal-detection.service';

@Injectable()
export class CollectionEngineService {
  private readonly logger = new Logger(CollectionEngineService.name);
  private enCours = false;
  private jobsActifs = new Map<string, Promise<any>>();

  constructor(
    private prisma: PrismaService,
    private webConnector: WebConnectorService,
    private rssConnector: RssConnectorService,
    private pdfConnector: PdfConnectorService,
    private filterService: FilterService,
    private dedupService: DeduplicationService,
    private textNormalizer: TextNormalizerService,
    private wordAnalyzer: WordAnalyzerService,
    private rawItemService: RawItemService,
    private relevanceScoring: RelevanceScoringService,
    private insightGenerator: InsightGeneratorService,
    private strategicAnalyzer: StrategicAnalyzerService,
    private batchBuilder: BatchBuilderService,
    private hypothesisUpdater: HypothesisUpdateEngine,
    private signalDetection: SignalDetectionService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleScheduledCollections() {
    if (this.enCours) { this.logger.warn('Cycle précédent encore actif, skip'); return; }
    this.enCours = true;
    try {
      const plans = await this.prisma.collectionPlan.findMany({
        where: { isActive: true, OR: [{ nextRunAt: { lte: new Date() } }, { nextRunAt: null }] },
        include: { hypothesis: { include: { axis: { include: { objective: true } } } } },
      });
      for (const plan of plans) {
        if (!plan.nextRunAt || new Date() >= plan.nextRunAt) {
          await this.triggerCollection(plan.id);
          await this.mettreAJourProchainRun(plan.id, plan.frequency);
        }
      }
    } finally { this.enCours = false; }
  }

  async triggerCollection(planId: string, sync = false) {
    if (this.jobsActifs.has(planId)) return { status: 'ALREADY_RUNNING' };

    const plan = await this.prisma.collectionPlan.findUnique({
      where: { id: planId },
      include: { sources: { where: { isActive: true } }, keywords: true, hypothesis: { include: { axis: { include: { objective: true } } } } },
    });
    if (!plan || !plan.isActive) return;

    const projectId = plan.hypothesis?.axis?.objective?.projectId;
    if (!projectId) { this.logger.error(`Pas de projectId pour ${planId}`); return; }

    const job = await this.prisma.collectionJob.create({ data: { collectionPlanId: planId, status: 'PENDING' } });
    if (sync) return this.executeCollection(plan, projectId, job.id);

    const promise = this.executeCollection(plan, projectId, job.id)
      .catch(e => this.logger.error(`Échec collection ${planId}: ${e.message}`))
      .finally(() => this.jobsActifs.delete(planId));
    this.jobsActifs.set(planId, promise);
    return { jobId: job.id, status: 'PENDING' };
  }

  private async executeCollection(plan: any, projectId: string, jobId: string) {
    await this.prisma.collectionJob.update({ where: { id: jobId }, data: { status: 'PROCESSING', startedAt: new Date() } });

    let collectes = 0, filtres = 0, stockes = 0;
    const tous: any[] = [];
    const erreurs: string[] = [];

    for (const source of plan.sources) {
      try {
        const bruts = await this.recupererSource(source.sourceType, source.sourceUrl);
        collectes += bruts.length;
        const filtresOk = bruts.filter(item => this.filterService.match(item.contentRaw, plan.keywords));
        filtres += filtresOk.length;
        const uniques = await this.dedupService.filterUnique(filtresOk, projectId);
        const nettoyes = uniques.map(item => {
          const cleaned = this.textNormalizer.clean(item.contentRaw);
          const score = this.relevanceScoring.score(cleaned, plan.keywords, plan.hypothesis?.content, item.publishedAt);
          return { ...item, contentRaw: item.contentRaw, contentCleaned: cleaned, wordStats: this.wordAnalyzer.getTopWords(item.contentRaw, plan.keywords, 20), classification: score.relevanceScore >= 0.5 ? 'RELEVANT' : 'NOISE', sentimentScore: score.relevanceScore };
        });
        const saved = await this.rawItemService.saveBulk(nettoyes, plan.id, projectId, source.id);
        tous.push(...saved);
        stockes += saved.length;
        await this.insightGenerator.generateFromItems(saved, plan.hypothesis?.id || null, projectId);
      } catch (error: any) {
        this.logger.error(`Source ${source.sourceUrl}: ${error.message}`);
        erreurs.push(`${source.sourceUrl}: ${error.message}`);
      }
    }

    if (plan.hypothesis?.id && tous.length > 0) {
      try {
        for (const batch of this.batchBuilder.buildBatches(
          tous.map(it => ({ id: it.id, title: it.title || '', content: it.contentCleaned || it.contentRaw || '', sourceUrl: it.sourceUrl, sourceType: it.sourceType, publishedAt: it.publishedAt?.toISOString() || null, score: it.sentimentScore || 0 })),
          plan.hypothesis.id, plan.hypothesis.content, (plan.hypothesis as any).scenario,
        )) {
          const [analyse] = await this.strategicAnalyzer.analyzeBatch({
            hypothesisContent: batch.hypothesisContent, hypothesisScenario: batch.hypothesisScenario,
            hypothesisId: batch.hypothesisId, batches: [{ items: batch.items }],
          });
          await this.hypothesisUpdater.updateFromAnalysis(plan.hypothesis.id, analyse, batch.items.length);
        }
      } catch (error: any) { this.logger.error(`Analyse stratégique: ${error.message}`); }
    }

    await this.prisma.collectionPlan.update({ where: { id: plan.id }, data: { lastRunAt: new Date() } });
    const echec = collectes === 0 && erreurs.length > 0;
    await this.prisma.collectionJob.update({
      where: { id: jobId },
      data: { status: echec ? 'FAILED' : 'COMPLETED', itemsFound: collectes, itemsStored: stockes, errorMessage: echec ? erreurs.join('; ') : null, completedAt: new Date() },
    });

    try {
      const signaux = await this.signalDetection.detecterSignaux(projectId);
      await this.signalDetection.sauvegarderSignaux(projectId, signaux.signaux);
      await this.signalDetection.sauvegarderSignaux(projectId, signaux.tendances);
    } catch (error: any) { this.logger.error(`Détection signaux: ${error.message}`); }

    this.logger.log(`Collection terminée: ${collectes} collectés, ${stockes} stockés`);
    return { success: !echec, collected: stockes, items: tous, wordCloud: this.wordAnalyzer.aggregateWordCloud(tous) };
  }

  private async recupererSource(type: string, url: string): Promise<any[]> {
    let items: any[];
    if (type === 'WEB') items = await this.webConnector.fetch(url);
    else if (type === 'RSS') items = await this.rssConnector.fetch(url);
    else if (type === 'PDF') items = await this.pdfConnector.fetch(url);
    else { this.logger.warn(`Type source inconnu: ${type}`); return []; }
    return items.map(item => ({ sourceUrl: item.sourceUrl, sourceType: item.sourceType, title: item.title, description: item.description, contentRaw: item.contentRaw, publishedAt: item.publishedAt }));
  }

  private async mettreAJourProchainRun(planId: string, frequency: string) {
    const maintenant = new Date();
    let prochain: Date | null = null;
    if (frequency === 'DAILY') prochain = new Date(maintenant.setDate(maintenant.getDate() + 1));
    else if (frequency === 'WEEKLY') prochain = new Date(maintenant.setDate(maintenant.getDate() + 7));
    else if (frequency === 'MONTHLY') prochain = new Date(maintenant.setMonth(maintenant.getMonth() + 1));
    await this.prisma.collectionPlan.update({ where: { id: planId }, data: { lastRunAt: new Date(), nextRunAt: prochain } });
  }
}
