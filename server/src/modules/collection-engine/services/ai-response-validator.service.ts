/**
 * FICHIER: ai-response-validator.service.ts
 *
 * RÔLE: Valide et corrige les réponses des providers IA (bornes, hallucinations, cohérence).
 *
 * RESPONSABILITÉS:
 * - Valider les scores (relevance, confidence) et les impacts d'hypothèse
 * - Détecter les hallucinations (confiance élevée sans contenu)
 * - Appliquer un fallback algorithmique si l'output est invalide
 * - Valider les insights et recommandations
 *
 * FLUX:
 * - StrategicAnalyzerService → AIValidatorService → validation des résultats IA
 *
 * EXEMPLE: Une réponse IA avec confidence=0.95 mais relevance=0.1 est détectée comme hallucination.
 */

/**
 * EXEMPLE DE TEST — validateHypothesisImpact:
 *
 * Input:
 *   - raw: { summary: "L'IA transforme le diagnostic...", answer: "...", relevance_score: 0.82,
 *            hypothesis_impact: "SUPPORTED", confidence_score: 0.88,
 *            entities: ["radiologie", "IA"], topics: ["santé", "technologie"] }
 *   - fallback: { summary: "Fallback", answer: "", relevance_score: 0.5,
 *                 hypothesis_impact: "INCONCLUSIVE", confidence_score: 0.5,
 *                 entities: [], topics: [] }
 *
 * Output attendu:
 *   - result.relevance_score = 0.82
 *   - result.hypothesis_impact = "SUPPORTED"
 *   - validation.valid = true
 *
 * Cas d'hallucination (confidence > 0.9 ET relevance < 0.2):
 *   - raw: { ..., relevance_score: 0.1, confidence_score: 0.95 }
 *   → validation.valid: false, confidence_score réduit à 0.5
 */
import { Injectable, Logger } from '@nestjs/common';

export interface RawAnalysisResult {
  summary: string;
  answer: string;
  relevance_score: number;
  hypothesis_impact: string;
  confidence_score: number;
  entities: string[];
  topics: string[];
}

export interface RawInsightResult {
  title: string;
  content: string;
  type: string;
  confidence: number;
  impactScore: number;
  urgencyScore: number;
  tags: string[];
}

export interface RawRecommendationResult {
  title: string;
  content: string;
  priority: string;
  expectedImpact: string;
  resourcesNeeded: string;
  risks: string;
}

export interface ValidatedAnalysis {
  valid: boolean;
  errors: string[];
  usedFallback: boolean;
}

const IMPACTS = ['SUPPORTED', 'CONTRADICTED', 'PARTIALLY_SUPPORTED', 'INCONCLUSIVE'];
const TYPES_INSIGHT = ['OPPORTUNITY', 'THREAT', 'TREND', 'SIGNAL_FAIBLE', 'CONFIRMATION', 'ALERT', 'INFORMATION'];
const PRIORITES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

@Injectable()
export class AIValidatorService {
  private readonly logger = new Logger(AIValidatorService.name);

  validateHypothesisImpact(raw: unknown, fallback: RawAnalysisResult): {
    result: RawAnalysisResult;
    validation: ValidatedAnalysis;
  } {
    const errors: string[] = [];
    const result = this.normalizeAnalysis(raw, fallback);

    if (typeof result.relevance_score !== 'number' || result.relevance_score < 0 || result.relevance_score > 1) {
      errors.push('Score pertinence invalide → fallback');
      result.relevance_score = fallback.relevance_score;
    }
    if (typeof result.confidence_score !== 'number' || result.confidence_score < 0 || result.confidence_score > 1) {
      errors.push('Score confiance invalide → fallback');
      result.confidence_score = fallback.confidence_score;
    }
    if (!result.hypothesis_impact || !IMPACTS.includes(result.hypothesis_impact)) {
      errors.push('Impact invalide → fallback');
      result.hypothesis_impact = fallback.hypothesis_impact;
    }
    if (!result.summary || result.summary.trim().length < 10) {
      errors.push('Résumé trop court → fallback');
      result.summary = fallback.summary;
    }
    if (!Array.isArray(result.entities)) {
      errors.push('Entités non tableau');
      result.entities = fallback.entities || [];
    }
    if (!Array.isArray(result.topics)) {
      errors.push('Topics non tableau');
      result.topics = fallback.topics || [];
    }

    // Hallucinations : confiance élevée sans contenu cohérent
    if (result.confidence_score > 0.9 && result.relevance_score < 0.2) {
      errors.push('Hallucination : confiance élevée / pertinence faible');
      result.confidence_score = Math.min(result.confidence_score, 0.5);
    }
    // Hallucination : score élevé sans entités extraites = contenu générique suspect
    if (result.confidence_score > 0.85 && result.relevance_score > 0.5 && !result.entities.length && !result.topics.length) {
      errors.push('Hallucination : confiance élevée sans entités');
      result.confidence_score *= 0.7;
    }
    // Incohérence : SUPPORTED sans pertinence suffisante → rétrogradation prudente
    if (result.hypothesis_impact === 'SUPPORTED' && result.relevance_score < 0.5) {
      errors.push('Incohérence : SUPPORTED avec pertinence < 0.5');
      result.hypothesis_impact = fallback.hypothesis_impact || 'PARTIALLY_SUPPORTED';
    }

    if (errors.length) this.logger.warn(`Validation: ${errors.join('; ')}`);
    return { result, validation: { valid: errors.length === 0, errors, usedFallback: false } };
  }

  validateInsight(raw: unknown, fallback?: Partial<RawInsightResult>): {
    result: RawInsightResult;
    validation: ValidatedAnalysis;
  } {
    const errors: string[] = [];
    const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const result: RawInsightResult = {
      title: typeof r.title === 'string' && r.title.trim().length > 0 ? r.title : (fallback?.title || 'Insight auto'),
      content: typeof r.content === 'string' && r.content.trim().length > 0 ? r.content : (fallback?.content || ''),
      type: typeof r.type === 'string' && TYPES_INSIGHT.includes(r.type) ? r.type : (fallback?.type || 'INFORMATION'),
      confidence: typeof r.confidence === 'number' && r.confidence >= 0 && r.confidence <= 1 ? r.confidence : (fallback?.confidence ?? 0.5),
      impactScore: typeof r.impactScore === 'number' && r.impactScore >= 0 && r.impactScore <= 1 ? r.impactScore : (fallback?.impactScore ?? 0.5),
      urgencyScore: typeof r.urgencyScore === 'number' && r.urgencyScore >= 0 && r.urgencyScore <= 1 ? r.urgencyScore : (fallback?.urgencyScore ?? 0.5),
      tags: Array.isArray(r.tags) ? r.tags.filter((t: any) => typeof t === 'string') : (fallback?.tags || []),
    };
    if (!r.title || typeof r.title !== 'string' || !r.title.trim().length) errors.push('Titre insight manquant');
    if (!TYPES_INSIGHT.includes(result.type)) errors.push(`Type insight invalide: ${result.type}`);
    return { result, validation: { valid: errors.length === 0, errors, usedFallback: false } };
  }

  validateRecommendation(raw: unknown, fallback?: Partial<RawRecommendationResult>): {
    result: RawRecommendationResult;
    validation: ValidatedAnalysis;
  } {
    const errors: string[] = [];
    const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const result: RawRecommendationResult = {
      title: typeof r.title === 'string' && r.title.trim().length > 0 ? r.title : (fallback?.title || 'Recommandation auto'),
      content: typeof r.content === 'string' && r.content.trim().length > 0 ? r.content : (fallback?.content || ''),
      priority: typeof r.priority === 'string' && PRIORITES.includes(r.priority) ? r.priority : (fallback?.priority || 'MEDIUM'),
      expectedImpact: typeof r.expectedImpact === 'string' ? r.expectedImpact : (fallback?.expectedImpact || ''),
      resourcesNeeded: typeof r.resourcesNeeded === 'string' ? r.resourcesNeeded : (fallback?.resourcesNeeded || ''),
      risks: typeof r.risks === 'string' ? r.risks : (fallback?.risks || ''),
    };
    if (!r.title || typeof r.title !== 'string' || !r.title.trim().length) errors.push('Titre recommandation manquant');
    if (!PRIORITES.includes(result.priority)) errors.push(`Priorité invalide: ${result.priority}`);
    return { result, validation: { valid: errors.length === 0, errors, usedFallback: false } };
  }

  private normalizeAnalysis(raw: unknown, fallback: RawAnalysisResult): RawAnalysisResult {
    if (!raw || typeof raw !== 'object') return { ...fallback };
    const r = raw as Record<string, unknown>;
    return {
      summary: typeof r.summary === 'string' ? r.summary : fallback.summary,
      answer: typeof r.answer === 'string' ? r.answer : (fallback.answer || ''),
      relevance_score: typeof r.relevance_score === 'number' ? r.relevance_score : fallback.relevance_score,
      hypothesis_impact: typeof r.hypothesis_impact === 'string' ? r.hypothesis_impact : fallback.hypothesis_impact,
      confidence_score: typeof r.confidence_score === 'number' ? r.confidence_score : fallback.confidence_score,
      entities: Array.isArray(r.entities) ? r.entities.filter(e => typeof e === 'string') : (fallback.entities || []),
      topics: Array.isArray(r.topics) ? r.topics.filter(t => typeof t === 'string') : (fallback.topics || []),
    };
  }
}
