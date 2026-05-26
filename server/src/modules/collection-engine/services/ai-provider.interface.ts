/**
 * FICHIER: ai-provider.interface.ts
 *
 * RÔLE: Définit le contrat standardisé que tous les providers IA (Mistral, Groq, Algorithmique) doivent implémenter.
 *
 * RESPONSABILITÉS:
 * - Déclarer l'interface AnalyseIA (résultat d'analyse)
 * - Déclarer l'interface AIProvider (contrat d'implémentation)
 *
 * FLUX:
 * - Les providers concrets implémentent AIProvider → AIRouterService utilise le polymorphisme
 *
 * EXEMPLE: MistralProvider implements AIProvider avec analyser(hypothesis, contenu, scenario).
 */
export interface AnalyseIA {
  summary: string;
  answer: string;
  relevance_score: number;
  hypothesis_impact: 'SUPPORTED' | 'CONTRADICTED' | 'PARTIALLY_SUPPORTED' | 'INCONCLUSIVE';
  confidence_score: number;
  entities: string[];
  topics: string[];
  provider: string;
  fallback_used: boolean;
}

export interface AIProvider {
  readonly nom: string;
  readonly disponible: boolean;
  analyser(
    hypothesis: string,
    contenu: string,
    scenario?: string | null,
  ): Promise<AnalyseIA>;
}
