import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { SourceType } from '@prisma/client';

@Injectable()
export class RawItemService {
  private readonly logger = new Logger(RawItemService.name);

  constructor(private prisma: PrismaService) {}

  async saveBulk(
    items: any[],
    planId: string,
    projectId: string,
    sourceId?: string,
  ): Promise<any[]> {
    const saved: any[] = [];

    for (const item of items) {
      try {
        const created = await this.prisma.rawItem.create({
          data: {
            title: item.title || '',
            contentRaw: item.contentRaw || '',
            contentCleaned: item.contentRaw || '',
            sourceType: (item.sourceType || 'WEB') as SourceType,
            sourceUrl: item.sourceUrl || '',
            publishedAt: item.publishedAt || undefined,
            fetchedAt: new Date(),
            hash: item.hash || '',
            wordCount: item.contentRaw?.split(/\s+/).length || 0,
            project: { connect: { id: projectId } },
            collectionPlan: { connect: { id: planId } },
          },
        });
        saved.push({ ...item, id: created.id });
      } catch (error: any) {
        if (error.code === 'P2002') {
          this.logger.debug(`Duplicate skipped: ${item.hash}`);
        } else {
          this.logger.error(`Failed to save item: ${error.message}`);
        }
      }
    }

    this.logger.log(`Saved ${saved.length}/${items.length} items`);
    return saved;
  }
}
