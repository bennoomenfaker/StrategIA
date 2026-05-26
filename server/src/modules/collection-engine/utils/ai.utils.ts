/**
 * FICHIER: ai.utils.ts
 *
 * RÔLE: Utilitaires partagés entre les providers IA (Mistral, Groq) pour le parsing JSON et le prompt système.
 *
 * RESPONSABILITÉS:
 * - Définir le prompt système standardisé pour l'analyse IA
 * - Construire le prompt utilisateur avec hypothèse et contenu
 * - Parser et valider la réponse JSON des API IA
 *
 * FLUX:
 * - Utilisé par MistralProvider et GroqProvider pour construire les appels API et parser les réponses
 *
 * EXEMPLE: parserReponseIA('{"summary": "...", ...}', 'mistral') → objet AnalyseIA typé.
 */

import { AnalyseIA } from '../services/ai-provider.interface';

const IMPACTS_VALIDES = ['SUPPORTED', 'CONTRADICTED', 'PARTIALLY_SUPPORTED', 'INCONCLUSIVE'];

export const PROMPT_SYSTEME_IA = `Tu es un analyste expert en intelligence stratégique.

Analyse le contenu suivant par rapport à l'hypothèse stratégique.

Retourne UNIQUEMENT un JSON valide sans markdown :
{
  "summary": "résumé court (2-3 phrases)",
  "answer": "analyse stratégique directe",
  "relevance_score": 0.0,
  "hypothesis_impact": "SUPPORTED | CONTRADICTED | PARTIALLY_SUPPORTED | INCONCLUSIVE",
  "confidence_score": 0.0,
  "entities": ["entité1", "entité2"],
  "topics": ["sujet1", "sujet2"]
}`;

export function construirePromptIA(hypothesis: string, contenu: string, scenario?: string | null): string {
  return `HYPOTHÈSE:
${hypothesis}${scenario ? `\nSCÉNARIO: ${scenario}` : ''}

CONTENU:
${contenu.substring(0, 3000)}`;
}

export function parserReponseIA(raw: string, provider: string): AnalyseIA {
  const nettoye = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const r = JSON.parse(nettoye);

  return {
    summary: typeof r.summary === 'string' ? r.summary : '',
    answer: typeof r.answer === 'string' ? r.answer : '',
    relevance_score: typeof r.relevance_score === 'number' ? r.relevance_score : 0,
    hypothesis_impact: validerImpact(r.hypothesis_impact),
    confidence_score: typeof r.confidence_score === 'number' ? r.confidence_score : 0,
    entities: Array.isArray(r.entities) ? r.entities.filter((e: any) => typeof e === 'string') : [],
    topics: Array.isArray(r.topics) ? r.topics.filter((t: any) => typeof t === 'string') : [],
    provider,
    fallback_used: false,
  };
}

function validerImpact(impact: string): AnalyseIA['hypothesis_impact'] {
  return IMPACTS_VALIDES.includes(impact) ? impact as AnalyseIA['hypothesis_impact'] : 'INCONCLUSIVE';
}
