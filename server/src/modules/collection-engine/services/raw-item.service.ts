/**
 * FICHIER: raw-item.service.ts
 *
 * RÔLE: Sauvegarde les items collectés en base de données via Prisma (avec transaction).
 *
 * RESPONSABILITÉS:
 * - Sauvegarder les items bruts en base (titre, contenu, hash, metadata)
 * - Gérer les doublons (code P2002) silencieusement
 * - Connecter chaque item à son projet et plan de collecte
 *
 * FLUX:
 * - CollectionEngineService → RawItemService.saveBulk() → table raw_item
 *
 * EXEMPLE: 12 articles collectés sont sauvegardés via une transaction Prisma.
 */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { SourceType } from '@prisma/client';

@Injectable()
export class RawItemService {
  private readonly logger = new Logger(RawItemService.name);

  constructor(private prisma: PrismaService) {}

  async saveBulk(items: any[], planId: string, projectId: string, sourceId?: string): Promise<any[]> {
    const saved: any[] = [];

    await this.prisma.$transaction(async tx => {
      for (const item of items) {
        try {
          const created = await tx.rawItem.create({
            data: {
              title: item.title || '',
              contentRaw: item.contentRaw || '',
              contentCleaned: item.contentCleaned || null,
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
          if (error.code !== 'P2002') throw error;
        }
      }
    });

    this.logger.log(`${saved.length}/${items.length} items sauvegardés`);
    return saved;
  }
}
