import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DeduplicationService {
  private readonly logger = new Logger(DeduplicationService.name);

  constructor(private prisma: PrismaService) {}

  generateHash(title: string | null, url: string, publishedAt?: Date | null): string {
    const data = [title || '', url, publishedAt?.toISOString() || ''].join('|');
    return createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  async filterUnique(items: any[], projectId: string): Promise<any[]> {
    const unique: any[] = [];
    const seen = new Set<string>();
    const existingHashes = new Set<string>();

    const existing = await this.prisma.rawItem.findMany({
      where: { projectId },
      select: { hash: true },
    });
    for (const r of existing) existingHashes.add(r.hash);

    for (const item of items) {
      const hash = this.generateHash(item.title, item.sourceUrl, item.publishedAt);
      if (!seen.has(hash) && !existingHashes.has(hash)) {
        seen.add(hash);
        item.hash = hash;
        unique.push(item);
      }
    }

    this.logger.log(`Dedup: ${items.length} -> ${unique.length} unique`);
    return unique;
  }
}
