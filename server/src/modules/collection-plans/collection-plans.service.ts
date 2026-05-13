import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCollectionPlanDto } from './dto/create-collection-plan.dto';
import { UpdateCollectionPlanDto } from './dto/update-collection-plan.dto';
import { Frequency, SourceType, KeywordType } from '@prisma/client';

@Injectable()
export class CollectionPlansService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCollectionPlanDto) {
    return this.prisma.collectionPlan.create({
      data: {
        question: dto.question,
        frequency: dto.frequency || Frequency.DAILY,
        cronExpression: dto.cronExpression,
        collectionStartDate: dto.collectionStartDate ? new Date(dto.collectionStartDate) : undefined,
        collectionEndDate: dto.collectionEndDate ? new Date(dto.collectionEndDate) : undefined,
        hypothesisId: dto.hypothesisId,
      },
      include: { hypothesis: true, sources: true, keywords: true },
    });
  }

  async findAll(hypothesisId?: string) {
    return this.prisma.collectionPlan.findMany({
      where: hypothesisId ? { hypothesisId } : {},
      include: { hypothesis: true, sources: true, keywords: true },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.collectionPlan.findUnique({
      where: { id },
      include: { hypothesis: true, sources: true, keywords: true, jobs: true },
    });
    if (!plan) throw new NotFoundException('Collection plan not found');
    return plan;
  }

  async update(id: string, dto: UpdateCollectionPlanDto) {
    await this.findOne(id);
    
    const data: any = { ...dto };
    if (dto.collectionStartDate) data.collectionStartDate = new Date(dto.collectionStartDate);
    if (dto.collectionEndDate) data.collectionEndDate = new Date(dto.collectionEndDate);
    
    // Update nextRunAt if frequency changed
    if (dto.frequency) {
      data.nextRunAt = this.calculateNextRun(dto.frequency as Frequency);
    }
    
    return this.prisma.collectionPlan.update({
      where: { id },
      data,
      include: { hypothesis: true, sources: true, keywords: true },
    });
  }

  private calculateNextRun(frequency: Frequency): Date | null {
    const now = new Date();
    switch (frequency) {
      case Frequency.DAILY:
        return new Date(now.setDate(now.getDate() + 1));
      case Frequency.WEEKLY:
        return new Date(now.setDate(now.getDate() + 7));
      case Frequency.MONTHLY:
        return new Date(now.setMonth(now.getMonth() + 1));
      case Frequency.ON_DEMAND:
        return null;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.collectionPlan.delete({ where: { id } });
  }

  async addSource(planId: string, dto: any) {
    // Check if source already exists for this plan
    const existing = await this.prisma.collectionPlanSource.findUnique({
      where: {
        collectionPlanId_sourceUrl: {
          collectionPlanId: planId,
          sourceUrl: dto.sourceUrl,
        },
      },
    });
    
    if (existing) {
      // Update existing source
      return this.prisma.collectionPlanSource.update({
        where: { id: existing.id },
        data: {
          sourceType: dto.sourceType as SourceType,
          sourceLabel: dto.sourceLabel,
          isActive: true,
        },
      });
    }
    
    // Create new source
    return this.prisma.collectionPlanSource.create({
      data: {
        collectionPlanId: planId,
        sourceType: dto.sourceType as SourceType,
        sourceLabel: dto.sourceLabel,
        sourceUrl: dto.sourceUrl,
      },
    });
  }

  async addKeyword(planId: string, dto: any) {
    return this.prisma.collectionPlanKeyword.create({
      data: {
        collectionPlanId: planId,
        keyword: dto.keyword,
        keywordType: dto.keywordType as KeywordType || KeywordType.INCLUDE,
      },
    });
  }

  async getResults(planId: string) {
    const items = await this.prisma.rawItem.findMany({
      where: { collectionPlanId: planId },
      orderBy: { fetchedAt: 'desc' },
      take: 100,
    });

    // Generate word cloud from items
    const wordCount: Record<string, number> = {};
    items.forEach(item => {
      const text = (item.contentRaw || '').toLowerCase();
      const words = text.match(/\b\w{3,}\b/g) || [];
      words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });
    });

    const wordCloud = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([text, value]) => ({ text, value }));

    return { items, wordCloud, total: items.length };
  }

  async getJobs(planId: string) {
    return this.prisma.collectionJob.findMany({
      where: { collectionPlanId: planId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
