/**
 * FICHIER: deduplication.service.ts
 *
 * RÔLE: Élimine les doublons d'items collectés par hash SHA-256 du contenu normalisé.
 *
 * RESPONSABILITÉS:
 * - Générer un hash unique (titre + URL + contenu + date) pour chaque item
 * - Filtrer les items déjà présents en base ou déjà vus dans le cycle
 *
 * FLUX:
 * - CollectionEngineService → DeduplicationService.filterUnique() → items dédoublonnés
 *
 * EXEMPLE: Deux sources publient le même article → un seul est conservé.
 */
import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DeduplicationService {
  private readonly logger = new Logger(DeduplicationService.name);

  constructor(private prisma: PrismaService) {}

  generateHash(title: string | null, url: string, content: string, publishedAt?: Date | null): string {
    const normalise = (content || '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim().substring(0, 300);
    return createHash('sha256').update([title || '', url, normalise, publishedAt?.toISOString() || ''].join('|')).digest('hex');
  }

  async filterUnique(items: any[], projectId: string): Promise<any[]> {
    const existing = await this.prisma.rawItem.findMany({ where: { projectId }, select: { hash: true } });
    const existingHashes = new Set(existing.map(r => r.hash));
    const seen = new Set<string>();
    const unique: any[] = [];

    for (const item of items) {
      const hash = this.generateHash(item.title, item.sourceUrl, item.contentRaw, item.publishedAt);
      if (!seen.has(hash) && !existingHashes.has(hash)) {
        seen.add(hash);
        item.hash = hash;
        unique.push(item);
      }
    }

    this.logger.log(`Dedup: ${items.length} → ${unique.length} uniques`);
    return unique;
  }
}
