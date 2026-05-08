import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Frequency } from '@prisma/client';

@Injectable()
export class CollectionEngineService {
  private readonly logger = new Logger(CollectionEngineService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('collection-queue') private collectionQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleScheduledCollections() {
    this.logger.log('Checking for scheduled collections...');

    const now = new Date();
    const plans = await this.prisma.collectionPlan.findMany({
      where: {
        isActive: true,
        OR: [
          { nextRunAt: { lte: now } },
          { nextRunAt: null },
        ],
      },
      include: {
        hypothesis: {
          include: { axis: { include: { objective: true } } },
        },
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

  async triggerCollection(planId: string, sync: boolean = false) {
    const plan = await this.prisma.collectionPlan.findUnique({
      where: { id: planId },
      include: { sources: true, keywords: true },
    });

    if (!plan || !plan.isActive) return;

    this.logger.log(`Triggering collection for plan ${planId} (sync: ${sync})`);
    
    const job = await this.prisma.collectionJob.create({
      data: {
        collectionPlanId: planId,
        status: 'PENDING',
      },
    });

    await this.collectionQueue.add('collect', {
      jobId: job.id,
      planId: plan.id,
      sources: plan.sources.filter(s => s.isActive),
      keywords: plan.keywords,
      sync,
    });

    return job;
  }

  private shouldPlanRun(frequency: Frequency, nextRunAt: Date | null): boolean {
    if (!nextRunAt) return true;
    return new Date() >= nextRunAt;
  }

  private async updateNextRun(planId: string, frequency: Frequency) {
    const now = new Date();
    let nextRun: Date | null = null;

    switch (frequency) {
      case 'DAILY':
        nextRun = new Date(now.setDate(now.getDate() + 1));
        break;
      case 'WEEKLY':
        nextRun = new Date(now.setDate(now.getDate() + 7));
        break;
      case 'MONTHLY':
        nextRun = new Date(now.setMonth(now.getMonth() + 1));
        break;
      case 'ON_DEMAND':
        nextRun = null;
        break;
    }

    await this.prisma.collectionPlan.update({
      where: { id: planId },
      data: { lastRunAt: new Date(), nextRunAt: nextRun },
    });
  }
}
