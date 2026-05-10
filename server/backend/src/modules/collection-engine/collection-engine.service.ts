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

@Injectable()
export class CollectionEngineService {
  private readonly logger = new Logger(CollectionEngineService.name);

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
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleScheduledCollections() {
    this.logger.log('Checking for scheduled collections...');
    const now = new Date();
    const plans = await this.prisma.collectionPlan.findMany({
      where: {
        isActive: true,
        OR: [{ nextRunAt: { lte: now } }, { nextRunAt: null }],
      },
      include: {
        hypothesis: { include: { axis: { include: { objective: true } } } },
      },
    });
    for (const plan of plans) {
      const shouldRun = this.shouldPlanRun(plan.frequency, plan.nextRunAt);
      if (shouldRun) {
        await this.triggerCollection(plan.id);
        await this.updateNextRun(plan.id, plan.frequency);
      }
    }
  }

  async triggerCollection(planId: string, sync = false) {
    const plan = await this.prisma.collectionPlan.findUnique({
      where: { id: planId },
      include: {
        sources: { where: { isActive: true } },
        keywords: true,
        hypothesis: { include: { axis: { include: { objective: true } } } },
      },
    });
    if (!plan || !plan.isActive) return;

    const projectId = plan.hypothesis?.axis?.objective?.projectId;
    if (!projectId) {
      this.logger.error(`No projectId for plan ${planId}`);
      return;
    }

    this.logger.log(`Triggering collection for plan ${planId} (project: ${projectId})`);

    const job = await this.prisma.collectionJob.create({
      data: {
        collectionPlanId: planId,
        status: 'PENDING',
      },
    });

    if (sync) {
      return this.collect(planId, projectId, plan.sources, plan.keywords, job.id);
    }

    setTimeout(() => {
      this.collect(planId, projectId, plan.sources, plan.keywords, job.id).catch(e =>
        this.logger.error(`Collection failed: ${e.message}`),
      );
    }, 100);

    return { jobId: job.id, status: 'PENDING' };
  }

  private async collect(
    planId: string,
    projectId: string,
    sources: any[],
    keywords: any[],
    jobId: string,
  ) {
    await this.prisma.collectionJob.update({
      where: { id: jobId },
      data: { status: 'PROCESSING', startedAt: new Date() },
    });

    let itemsCollected = 0;
    let itemsFiltered = 0;
    let itemsStored = 0;
    const allItems: any[] = [];

    for (const source of sources) {
      try {
        const rawItems = await this.fetchSource(source.sourceType, source.sourceUrl);
        itemsCollected += rawItems.length;
        this.logger.log(`Collected ${rawItems.length} items from ${source.sourceUrl}`);

        const filtered = rawItems.filter(item =>
          this.filterService.match(item.contentRaw, keywords),
        );
        const removed = rawItems.length - filtered.length;
        itemsFiltered += filtered.length;
        this.logger.log(`Keyword filter: ${filtered.length} kept, ${removed} removed`);

        const unique = await this.dedupService.filterUnique(filtered, projectId);

        const cleaned = unique.map(item => ({
          ...item,
          contentRaw: this.textNormalizer.clean(item.contentRaw),
          wordStats: this.wordAnalyzer.getTopWords(item.contentRaw, 20),
        }));

        const saved = await this.rawItemService.saveBulk(cleaned, planId, projectId, source.id);
        allItems.push(...saved);
        itemsStored += saved.length;
        this.logger.log(`Stored ${saved.length} items`);
      } catch (error: any) {
        this.logger.error(`Source ${source.sourceUrl} failed: ${error.message}`);
      }
    }

    const wordCloud = this.wordAnalyzer.aggregateWordCloud(allItems);

    await this.prisma.collectionPlan.update({
      where: { id: planId },
      data: { lastRunAt: new Date() },
    });

    await this.prisma.collectionJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        itemsFound: itemsCollected,
        itemsStored,
        completedAt: new Date(),
      },
    });

    this.logger.log(`Collection completed: ${itemsCollected} collected, ${itemsFiltered} filtered, ${itemsStored} stored`);
    return { success: true, collected: itemsStored, items: allItems, wordCloud };
  }

  private async fetchSource(type: string, url: string): Promise<any[]> {
    let items: any[];
    switch (type) {
      case 'WEB':
        items = await this.webConnector.fetch(url);
        break;
      case 'RSS':
        items = await this.rssConnector.fetch(url);
        break;
      case 'PDF':
        items = await this.pdfConnector.fetch(url);
        break;
      default:
        this.logger.warn(`Unknown source type: ${type}`);
        return [];
    }
    return items.map(item => ({
      sourceUrl: item.sourceUrl,
      sourceType: item.sourceType,
      title: item.title,
      description: item.description,
      contentRaw: item.contentRaw,
      publishedAt: item.publishedAt,
    }));
  }

  private shouldPlanRun(frequency: string, nextRunAt: Date | null): boolean {
    if (!nextRunAt) return true;
    return new Date() >= nextRunAt;
  }

  private async updateNextRun(planId: string, frequency: string) {
    const now = new Date();
    let next: Date | null = null;
    switch (frequency) {
      case 'DAILY': next = new Date(now.setDate(now.getDate() + 1)); break;
      case 'WEEKLY': next = new Date(now.setDate(now.getDate() + 7)); break;
      case 'MONTHLY': next = new Date(now.setMonth(now.getMonth() + 1)); break;
    }
    await this.prisma.collectionPlan.update({
      where: { id: planId },
      data: { lastRunAt: new Date(), nextRunAt: next },
    });
  }
}
