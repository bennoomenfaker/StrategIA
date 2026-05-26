/**
 * FICHIER: batch-builder.service.ts
 *
 * RÔLE: Groupe les items collectés en lots pour l'analyse IA (filtre le bruit < 0.3, lots de 15 max).
 *
 * RESPONSABILITÉS:
 * - Filtrer les items avec un score < 0.3 (bruit)
 * - Constituer des lots de 15 items max pour l'analyse stratégique
 *
 * FLUX:
 * - CollectionEngineService → BatchBuilderService.buildBatches() → StrategicAnalyzerService
 *
 * EXEMPLE: 47 items pertinents sont groupés en 3 lots de 15, 15 et 17 → 4 lots.
 */
import { Injectable, Logger } from '@nestjs/common';

export interface BatchItem {
  id: string;
  title: string;
  content: string;
  sourceUrl: string;
  sourceType: string;
  publishedAt: string | null;
  score: number;
}

export interface BatchGroup {
  hypothesisId: string;
  hypothesisContent: string;
  hypothesisScenario: string | null;
  items: BatchItem[];
}

@Injectable()
export class BatchBuilderService {
  private readonly logger = new Logger(BatchBuilderService.name);

  buildBatches(
    items: BatchItem[],
    hypothesisId: string,
    hypothesisContent: string,
    hypothesisScenario: string | null,
  ): BatchGroup[] {
    const pertinents = items.filter(it => it.score >= 0.3).sort((a, b) => b.score - a.score);
    if (!pertinents.length) return [];

    const lots: BatchGroup[] = [];
    for (let i = 0; i < pertinents.length; i += 15) {
      lots.push({ hypothesisId, hypothesisContent, hypothesisScenario, items: pertinents.slice(i, i + 15) });
    }
    this.logger.log(`${lots.length} lot(s) de ${pertinents.length} items pertinents`);
    return lots;
  }
}
