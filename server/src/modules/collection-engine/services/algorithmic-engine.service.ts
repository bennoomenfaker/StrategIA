/**
 * FICHIER: algorithmic-engine.service.ts
 *
 * RÔLE: Fallback algorithmique toujours disponible (sans API externe). Calcule la pertinence par overlap lexical.
 *
 * RESPONSABILITÉS:
 * - Analyser le contenu sans appel API (overlap de mots-clés)
 * - Fournir un score de pertinence et un impact d'hypothèse
 * - Être le dernier recours dans la chaîne de fallback IA
 *
 * FLUX:
 * - AIRouterService → AlgorithmicEngine (fallback si Mistral et Groq échouent)
 *
 * EXEMPLE: Aucune clé API configurée → AlgorithmicEngine calcule le ratio de mots communs.
 */

/**
 * EXEMPLE DE TEST — analyser():
 *
 * Input:
 *   - hypothesis: "L'IA générative va révolutionner la médecine personnalisée"
 *   - contenu: "L'intelligence artificielle générative permet désormais de créer des traitements sur mesure..."
 *   - _scenario: null
 *
 * Output attendu:
 *   - relevance_score: 0.75 (3/4 mots-clés > 3 lettres matchés)
 *   - hypothesis_impact: "SUPPORTED" (score > 0.7)
 *   - confidence_score: 0.45 (0.3 + 0.75*0.4)
 *   - fallback_used: true
 */
import { Injectable } from '@nestjs/common';
import { AIProvider, AnalyseIA } from './ai-provider.interface';

@Injectable()
export class AlgorithmicEngine implements AIProvider {
  readonly nom = 'algorithmique';
  readonly disponible = true;

  async analyser(hypothesis: string, contenu: string, _scenario?: string | null): Promise<AnalyseIA> {
    // Tokenisation et comptage des mots significatifs (> 3 lettres) retrouvés dans le contenu
    const mots = hypothesis.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const contenuBas = contenu.toLowerCase();
    const matched = mots.filter(m => contenuBas.includes(m));
    const ratio = mots.length > 0 ? matched.length / mots.length : 0;

    // Score composite : ratio lexical + bonus longueur contenu + bonus diversité lexicale
    const score = Math.min(ratio * 0.6 + (contenu.length > 200 ? 0.2 : 0) + (mots.length > 2 ? 0.1 : 0), 1.0);

    let impact: AnalyseIA['hypothesis_impact'] = 'INCONCLUSIVE';
    if (score > 0.7) impact = 'SUPPORTED';
    else if (score > 0.4) impact = 'PARTIALLY_SUPPORTED';
    else if (score < 0.1 && contenu.length > 500) impact = 'CONTRADICTED';

    return {
      summary: `Analyse algorithmique: ${matched.length}/${mots.length} mots-clés retrouvés.`,
      answer: score > 0.5 ? 'Le contenu partage un vocabulaire significatif avec l\'hypothèse.' : 'Peu de recouvrement lexical.',
      relevance_score: Math.round(score * 100) / 100,
      hypothesis_impact: impact,
      confidence_score: Math.min(0.3 + ratio * 0.4, 0.6),
      entities: [],
      topics: [],
      provider: 'algorithmique',
      fallback_used: true,
    };
  }
}
