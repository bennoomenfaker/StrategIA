/**
 * FICHIER: strategic-analyzer.service.ts
 *
 * RÔLE: Analyse stratégique par lots via le routeur IA (Mistral → Groq → Algorithmique).
 *
 * RESPONSABILITÉS:
 * - Analyser chaque lot d'items par rapport à une hypothèse
 * - Valider les résultats via AIValidatorService
 * - Agréger les résultats multiples en un résultat unique
 * - Fournir un fallback algorithmique de score
 *
 * FLUX:
 * - CollectionEngineService → StrategicAnalyzerService.analyzeBatch() → AIRouterService → AIValidatorService
 *
 * EXEMPLE: 3 lots de 15 items sont analysés → 3 résultats agrégés en un seul avec l'impact dominant.
 */
import { Injectable, Logger } from '@nestjs/common';
import { AIValidatorService, RawAnalysisResult } from './ai-response-validator.service';
import { AIRouterService } from './ai-router.service';
import { AnalyseIA } from './ai-provider.interface';

export interface BatchAnalysisInput {
  hypothesisContent: string;
  hypothesisScenario: string | null;
  hypothesisId: string;
  batches: {
    items: {
      id: string;
      title: string;
      content: string;
      sourceUrl: string;
      sourceType: string;
      publishedAt: string | null;
      score: number;
    }[];
  }[];
}

@Injectable()
export class StrategicAnalyzerService {
  private readonly logger = new Logger(StrategicAnalyzerService.name);

  constructor(
    private aiRouter: AIRouterService,
    private validator: AIValidatorService,
  ) {}

  async analyzeBatch(input: BatchAnalysisInput): Promise<AnalyseIA[]> {
    const results: AnalyseIA[] = [];

    for (const batch of input.batches) {
      const fallback = this.fallbackScore(batch.items, input.hypothesisContent);
      const result = await this.analyzeSingleBatch(batch.items, input.hypothesisContent, input.hypothesisScenario, fallback);
      results.push(result);
    }

    return [this.aggregate(results)];
  }

  private async analyzeSingleBatch(
    items: BatchAnalysisInput['batches'][0]['items'],
    hypothesisContent: string,
    hypothesisScenario: string | null,
    fallback: RawAnalysisResult,
  ): Promise<AnalyseIA> {
    if (items.length === 0) {
      return { ...fallback, hypothesis_impact: fallback.hypothesis_impact as AnalyseIA['hypothesis_impact'], provider: 'fallback', fallback_used: true };
    }

    const itemsText = items.map((it, i) => `[${i + 1}] ${it.title}\n${it.content.substring(0, 400)}`).join('\n\n');
    const contenu = `Hypothesis: ${hypothesisContent}${hypothesisScenario ? `\nScenario: ${hypothesisScenario}` : ''}\n\nItems (${items.length}):\n${itemsText}`;

    let raw: AnalyseIA;
    try {
      raw = await this.aiRouter.analyser(hypothesisContent, contenu, hypothesisScenario);
    } catch {
      raw = { summary: fallback.summary, answer: fallback.answer, relevance_score: fallback.relevance_score, hypothesis_impact: fallback.hypothesis_impact as AnalyseIA['hypothesis_impact'], confidence_score: fallback.confidence_score, entities: fallback.entities, topics: fallback.topics, provider: 'fallback', fallback_used: true };
    }

    const validated = this.validator.validateHypothesisImpact(raw, fallback);
    if (!validated.validation.valid) this.logger.warn(`${validated.validation.errors.length} erreur(s) de validation`);

    return {
      summary: validated.result.summary,
      answer: validated.result.answer,
      relevance_score: validated.result.relevance_score,
      hypothesis_impact: validated.result.hypothesis_impact as AnalyseIA['hypothesis_impact'],
      confidence_score: validated.result.confidence_score,
      entities: validated.result.entities,
      topics: validated.result.topics,
      provider: raw.provider,
      fallback_used: raw.fallback_used,
    };
  }

  private aggregate(results: AnalyseIA[]): AnalyseIA {
    if (!results.length) {
      return { summary: 'No analysis', answer: '', relevance_score: 0, hypothesis_impact: 'INCONCLUSIVE', confidence_score: 0, entities: [], topics: [], provider: 'fallback', fallback_used: true };
    }
    if (results.length === 1) return results[0];

    const avgRel = results.reduce((s, r) => s + r.relevance_score, 0) / results.length;
    const avgConf = results.reduce((s, r) => s + r.confidence_score, 0) / results.length;
    const counts: Record<string, number> = {};
    results.forEach(r => { counts[r.hypothesis_impact] = (counts[r.hypothesis_impact] || 0) + 1; });
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as AnalyseIA['hypothesis_impact'];

    return {
      summary: results.map(r => r.summary).join(' '),
      answer: results.map(r => r.answer).join(' '),
      relevance_score: Math.round(avgRel * 100) / 100,
      hypothesis_impact: dominant,
      confidence_score: Math.round(avgConf * 100) / 100,
      entities: [...new Set(results.flatMap(r => r.entities))],
      topics: [...new Set(results.flatMap(r => r.topics))],
      provider: results[0].provider,
      fallback_used: results.some(r => r.fallback_used),
    };
  }

  fallbackScore(items: { title: string; content: string; score: number }[], hypothesisContent: string): RawAnalysisResult {
    const all = items.map(it => `${it.title} ${it.content}`).join(' ').toLowerCase();
    const mots = hypothesisContent.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const matched = mots.filter(w => all.includes(w));
    const ratio = mots.length > 0 ? matched.length / mots.length : 0;
    const avg = items.reduce((s, it) => s + it.score, 0) / items.length;
    const relevance = Math.min(Math.max(ratio * 1.5, avg * 0.5), 1.0);

    let impact = 'INCONCLUSIVE';
    if (relevance > 0.8) impact = 'SUPPORTED';
    else if (relevance > 0.6) impact = 'PARTIALLY_SUPPORTED';
    else if (relevance < 0.2 && items.length > 3) impact = 'CONTRADICTED';

    return {
      summary: `Analyse algorithmique de ${items.length} items. Overlap: ${(ratio * 100).toFixed(0)}%.`,
      answer: ratio > 0.5 ? 'Données liées à l\'hypothèse.' : 'Peu d\'éléments.',
      relevance_score: Math.round(relevance * 100) / 100,
      hypothesis_impact: impact,
      confidence_score: Math.min(0.3 + ratio * 0.4, 0.7),
      entities: [],
      topics: [],
    };
  }
}
