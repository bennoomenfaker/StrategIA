/**
 * FICHIER: relevance-scoring.service.ts
 *
 * RÔLE: Calcule le score de pertinence algorithmique (sans IA) basé sur mots-clés, densité, fraîcheur et hypothèse.
 *
 * RESPONSABILITÉS:
 * - Calculer un score de pertinence (0-1) basé sur les mots-clés INCLUDE/EXCLUDE
 * - Pondérer par la densité des mots-clés, la fraîcheur de publication
 * - Bonus d'alignement avec le contenu de l'hypothèse
 * - Détecter les signaux faibles (score 0.3-0.5, moins de 14 jours)
 *
 * FLUX:
 * - CollectionEngineService → RelevanceScoringService.score() → classification RELEVANT/NOISE
 *
 * EXEMPLE: Article avec 3 mots-clés INCLUDE, publié il y a 2 jours → score ≈ 0.9.
 */

/**
 * EXEMPLE DE TEST — score():
 *
 * Input:
 *   - content: "L'intelligence artificielle révolutionne le diagnostic médical..."
 *   - keywords: [{ keyword: "ia", keywordType: "INCLUDE" }, { keyword: "diagnostic", keywordType: "INCLUDE" },
 *                { keyword: "sports", keywordType: "EXCLUDE" }]
 *   - hypothesisContent: "L'IA générative en médecine"
 *   - publishedAt: new Date(Date.now() - 2 * 86400000)
 *
 * Output attendu:
 *   - relevanceScore: ≈ 0.9 (2 INCLUDE × 0.25 = 0.5, densité > 0.01 → +0.1,
 *                             < 7 jours → +0.15, mots hypothèse matchés → +0.1)
 *   - matchedIncludes: ["ia", "diagnostic"]
 *   - matchedExcludes: []
 */
import { Injectable, Logger } from '@nestjs/common';
import { tokenize } from '../utils/text.utils';

interface Keyword { keyword: string; keywordType: string; }

interface ScoreResult {
  relevanceScore: number; matchedIncludes: string[]; matchedExcludes: string[];
  keywordDensity: number; signal: boolean;
}

@Injectable()
export class RelevanceScoringService {
  private readonly logger = new Logger(RelevanceScoringService.name);

  score(content: string, keywords: Keyword[], hypothesisContent?: string, publishedAt?: Date | null): ScoreResult {
    if (!content) return { relevanceScore: 0, matchedIncludes: [], matchedExcludes: [], keywordDensity: 0, signal: false };

    const tokens = tokenize(content, 3);
    if (!tokens.length) return { relevanceScore: 0, matchedIncludes: [], matchedExcludes: [], keywordDensity: 0, signal: false };

    const tokenSet = new Set(tokens);
    const includes = keywords.filter(k => k.keywordType === 'INCLUDE').map(k => k.keyword.toLowerCase());
    const excludes = keywords.filter(k => k.keywordType === 'EXCLUDE').map(k => k.keyword.toLowerCase());
    const matchedIncludes = includes.filter(kw => tokenSet.has(kw));
    const matchedExcludes = excludes.filter(kw => tokenSet.has(kw));

    // Score de base par mot-clé INCLUDE (0.25 chacun, plafonné à 0.6) + bonus par palier de densité
    let score = Math.min(matchedIncludes.length * 0.25, 0.6);
    const keywordDensity = matchedIncludes.length / tokens.length;
    if (keywordDensity > 0.01) score += 0.1;
    if (keywordDensity > 0.03) score += 0.1;

    if (publishedAt) {
      const days = (Date.now() - new Date(publishedAt).getTime()) / 86400000;
      if (days < 7) score += 0.15;
      else if (days < 30) score += 0.05;
    }

    // Alignement sémantique avec l'hypothèse : bonus pour chaque mot commun (max 0.2)
    if (hypothesisContent) {
      const motsHypo = hypothesisContent.toLowerCase().replace(/[^\w\sÀ-ÿœæ]/g, ' ').split(/\s+/).filter(w => w.length > 3);
      score += Math.min(motsHypo.filter(w => tokenSet.has(w)).length * 0.05, 0.2);
    }

    score -= matchedExcludes.length * 0.5;
    const relevanceScore = Math.max(0, Math.min(1, score));
    const signal = !!(relevanceScore >= 0.3 && relevanceScore < 0.5 && publishedAt && (Date.now() - new Date(publishedAt).getTime()) / 86400000 < 14);

    this.logger.debug(`Score=${relevanceScore.toFixed(2)} include=${matchedIncludes.length} exclude=${matchedExcludes.length}`);
    return { relevanceScore, matchedIncludes, matchedExcludes, keywordDensity, signal };
  }
}
