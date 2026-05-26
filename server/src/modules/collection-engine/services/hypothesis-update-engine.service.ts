/**
 * FICHIER: hypothesis-update-engine.service.ts
 *
 * RÔLE: Met à jour les scores d'une hypothèse après analyse stratégique (confiance, stabilité, statut).
 *
 * RESPONSABILITÉS:
 * - Mettre à jour les compteurs d'evidence, support, contradiction
 * - Calculer le nouveau score de confiance (pondéré par l'impact)
 * - Calculer le score de stabilité et le statut de validation (SUPPORTED/CONTRADICTED/UNCERTAIN/PENDING)
 *
 * FLUX:
 * - CollectionEngineService → HypothesisUpdateEngine.updateFromAnalysis() → hypothèse mise à jour en base
 *
 * EXEMPLE: Analyse révèle SUPPORTED avec confidence 0.8 → confidenceAfter augmente, evidenceCount +1.
 */

/**
 * EXEMPLE DE TEST — updateFromAnalysis():
 *
 * Input:
 *   - hypothesisId: "hyp-001"
 *   - result: { hypothesis_impact: "SUPPORTED", relevance_score: 0.82, confidence_score: 0.88 }
 *   - itemCount: 5
 *   - Hypothèse en base: { confidenceBefore: 0.6, confidenceAfter: 0.65,
 *                          evidenceCount: 3, supportCount: 2, contradictionCount: 1 }
 *
 * Output attendu (mise à jour base):
 *   - evidenceCount: 8 (3 + 5)
 *   - supportCount: 3 (2 + 1)
 *   - confidenceAfter: ≈ 0.82 ((0.65 + 0.88)/2 + 0.1)
 *   - stabilityScore: 0.75 (3 / (3 + 1))
 *   - validationStatus: "SUPPORTED"
 */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ValidationStatus } from '@prisma/client';

interface AnalysisResult {
  hypothesis_impact: 'SUPPORTED' | 'CONTRADICTED' | 'PARTIALLY_SUPPORTED' | 'INCONCLUSIVE';
  relevance_score: number;
  confidence_score: number;
}

@Injectable()
export class HypothesisUpdateEngine {
  private readonly logger = new Logger(HypothesisUpdateEngine.name);

  constructor(private prisma: PrismaService) {}

  async updateFromAnalysis(hypothesisId: string, result: AnalysisResult, itemCount: number): Promise<void> {
    const h = await this.prisma.hypothesis.findUnique({ where: { id: hypothesisId } });
    if (!h) { this.logger.error(`Hypothesis ${hypothesisId} introuvable`); return; }

    const prev = h.confidenceAfter || h.confidenceBefore || 0;
    const isSupp = result.hypothesis_impact === 'SUPPORTED';
    const isContra = result.hypothesis_impact === 'CONTRADICTED';
    const isPartiel = result.hypothesis_impact === 'PARTIALLY_SUPPORTED';

    const evidence = h.evidenceCount + (isSupp ? itemCount : isPartiel ? Math.floor(itemCount * 0.5) : 0);
    const support = h.supportCount + (isSupp || isPartiel ? 1 : 0);
    const contradiction = h.contradictionCount + (isContra ? 1 : 0);

    // Mise à jour de la confiance : bonus SUPPORTED (+0.1), malus CONTRADICTED (-0.1), neutre PARTIEL
    let conf: number;
    if (isSupp) conf = Math.min((prev + result.confidence_score) / 2 + 0.1, 1.0);
    else if (isContra) conf = Math.max((prev + (1 - result.confidence_score)) / 2 - 0.1, 0);
    else if (isPartiel) conf = (prev + result.confidence_score) / 2;
    else conf = prev;

    // Stabilité = ratio support / (support + contradiction) : mesure la robustesse de l'hypothèse
    const stabilite = Math.min(support + contradiction > 0 ? support / (support + contradiction) : 0.5, 1.0);
    const status = this.calculerStatus(evidence, contradiction, stabilite);

    await this.prisma.hypothesis.update({
      where: { id: hypothesisId },
      data: {
        confidenceBefore: h.confidenceBefore ?? result.relevance_score,
        confidenceAfter: Math.round(conf * 100) / 100,
        evidenceCount: evidence,
        supportCount: support,
        contradictionCount: contradiction,
        lastEvaluatedAt: new Date(),
        stabilityScore: Math.round(stabilite * 100) / 100,
        validationStatus: status,
        status: status === 'SUPPORTED' ? 'VALIDATED' as any : status === 'CONTRADICTED' ? 'INVALIDATED' as any : h.status,
      },
    });

    this.logger.log(`Hypothèse ${hypothesisId}: impact=${result.hypothesis_impact} conf=${conf.toFixed(2)} stabilité=${stabilite.toFixed(2)} status=${status}`);
  }

  private calculerStatus(evidence: number, contradiction: number, stabilite: number): ValidationStatus {
    if (evidence > 0 && contradiction === 0 && stabilite > 0.7) return 'SUPPORTED';
    if (contradiction > evidence && stabilite < 0.3) return 'CONTRADICTED';
    if (evidence === 0 && contradiction === 0) return 'PENDING';
    return 'UNCERTAIN';
  }
}
