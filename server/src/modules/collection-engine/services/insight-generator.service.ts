/**
 * FICHIER: insight-generator.service.ts
 *
 * RÔLE: Génère des insights à partir d'items collectés en détectant des clusters sémantiques (patterns).
 *
 * RESPONSABILITÉS:
 * - Détecter des patterns (clusters d'items partageant des mots significatifs)
 * - Créer des insights (TREND, CONFIRMATION, SIGNAL_FAIBLE, etc.)
 * - Créer ou mettre à jour des signaux automatiques pour les patterns émergents
 *
 * FLUX:
 * - CollectionEngineService → InsightGeneratorService.generateFromItems() → sauvegarde insights + signaux
 *
 * EXEMPLE: 5 articles parlent de "guerre commerciale" avec score > 0.7 → insight de type TREND créé.
 */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { InsightType, SignalStrength } from '@prisma/client';
import { tokenize } from '../utils/text.utils';

interface ItemForAnalysis {
  id: string; title: string | null; contentCleaned: string | null; sourceUrl: string;
  sourceType: string; classification: string | null; sentimentScore: number | null;
  publishedAt: Date | null; projectId: string; collectionPlanId: string;
}

interface DetectedPattern {
  signature: string; items: ItemForAnalysis[]; avgScore: number; sourceCount: number;
}

const STOPWORDS_PATTERN = new Set([
  'avec','dans','pour','sur','cette','leurs','cela','être','faire','plus','tout','bien',
  'nous','sont','mais','alors','about','that','this','with','from','have','been','were',
  'they','their','which','what','when','where','will','would','could','should','more',
  'some','than','then','also','into',
]);

function extraireSignature(contenu: string): string[] {
  const tokens = tokenize(contenu, 4).filter(w => !STOPWORDS_PATTERN.has(w));
  const freq: Record<string, number> = {};
  tokens.forEach(t => freq[t] = (freq[t] || 0) + 1);
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w]) => w);
}

@Injectable()
export class InsightGeneratorService {
  private readonly logger = new Logger(InsightGeneratorService.name);

  constructor(private prisma: PrismaService) {}

  async generateFromItems(items: ItemForAnalysis[], hypothesisId: string | null, projectId: string): Promise<void> {
    if (!items.length) return;

    for (const pattern of this.detectPatterns(items)) {
      try {
        await this.createInsightForPattern(pattern, hypothesisId, projectId);
        for (const item of pattern.items) await this.createSignalIfApplicable(item, pattern);
      } catch (error: any) {
        this.logger.error(`Échec insight: ${error.message}`);
      }
    }
    this.logger.log(`${this.detectPatterns(items).length} insight(s) généré(s)`);
  }

  private detectPatterns(items: ItemForAnalysis[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const assigned = new Set<string>();

    for (let i = 0; i < items.length; i++) {
      if (assigned.has(items[i].id)) continue;
      const cluster: ItemForAnalysis[] = [items[i]];
      assigned.add(items[i].id);
      const sig = extraireSignature(items[i].contentCleaned || '');

      for (let j = i + 1; j < items.length; j++) {
        if (assigned.has(items[j].id)) continue;
        const autre = extraireSignature(items[j].contentCleaned || '');
        if (sig.filter(w => new Set(autre).has(w)).length >= 2) {
          cluster.push(items[j]);
          assigned.add(items[j].id);
        }
      }

      patterns.push({
        signature: sig.join(' '),
        items: cluster,
        avgScore: cluster.reduce((s, it) => s + (it.sentimentScore || 0), 0) / cluster.length,
        sourceCount: new Set(cluster.map(it => it.sourceUrl)).size,
      });
    }

    return patterns.sort((a, b) => b.avgScore - a.avgScore);
  }

  private async createInsightForPattern(pattern: DetectedPattern, hypothesisId: string | null, projectId: string): Promise<void> {
    const mots = pattern.signature.split(' ').slice(0, 3).join(', ');
    const prefixes: Record<string, string> = { TREND: 'Tendance', CONFIRMATION: 'Confirmation', SIGNAL_FAIBLE: 'Signal faible', ALERT: 'Alerte', OPPORTUNITY: 'Opportunité', THREAT: 'Menace' };

    let type: InsightType = 'INFORMATION';
    if (pattern.avgScore >= 0.8 && pattern.sourceCount >= 3) type = 'TREND';
    else if (pattern.avgScore >= 0.7 && pattern.sourceCount >= 2) type = 'CONFIRMATION';
    else if (pattern.avgScore >= 0.6) type = 'INFORMATION';
    else if (pattern.avgScore >= 0.4) type = pattern.sourceCount === 1 ? 'SIGNAL_FAIBLE' : 'TREND';

    const title = `${prefixes[type] || 'Information'}: ${mots} (${pattern.items.length} sources)`;
    const content = pattern.items.slice(0, 5).map(it => `- ${it.title || '(sans titre)'}`).join('\n');

    await this.prisma.insight.create({
      data: {
        title, content: `Pattern sur ${pattern.items.length} sources:\n${content}\n\nScore: ${pattern.avgScore.toFixed(2)}`,
        type, projectId, hypothesisId, confidence: pattern.avgScore,
        impactScore: Math.min(pattern.avgScore * 1.2, 1.0),
        urgencyScore: pattern.avgScore * 0.5,
        isSignal: type === 'SIGNAL_FAIBLE',
        tags: pattern.signature.split(' ').filter(Boolean).slice(0, 5),
        sourceItemId: pattern.items[0]?.id,
      },
    });
  }

  private async createSignalIfApplicable(item: ItemForAnalysis, pattern: DetectedPattern): Promise<void> {
    if (pattern.avgScore < 0.3 || pattern.avgScore >= 0.5) return;
    try {
      const existant = await this.prisma.signal.findFirst({ where: { projectId: item.projectId, sourceUrl: item.sourceUrl } });
      if (existant) {
        await this.prisma.signal.update({
          where: { id: existant.id },
          data: { lastDetected: new Date(), detectionCount: { increment: 1 }, strength: existant.detectionCount >= 3 ? 'MOYEN' as SignalStrength : 'FAIBLE' as SignalStrength },
        });
      } else {
        await this.prisma.signal.create({
          data: { title: item.title || 'Signal détecté', description: item.contentCleaned?.substring(0, 200) || '', strength: 'FAIBLE', projectId: item.projectId, sourceUrl: item.sourceUrl, category: 'AUTOMATIC', tags: pattern.signature.split(' ').filter(Boolean).slice(0, 5) },
        });
      }
    } catch {}
  }
}
