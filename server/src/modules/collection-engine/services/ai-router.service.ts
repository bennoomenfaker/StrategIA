/**
 * FICHIER: ai-router.service.ts
 *
 * RÔLE: Routeur IA avec chaîne de fallback Mistral → Groq → Algorithmique, circuit-breaker et cache.
 *
 * RESPONSABILITÉS:
 - Router les requêtes d'analyse vers le provider disponible (Mistral en priorité)
 * - Implémenter le circuit-breaker (3 échecs = désactivation 60s)
 * - Mettre en cache les résultats (5 min, hash du contenu)
 * - Exponential backoff (2 tentatives maximum)
 *
 * FLUX:
 * - StrategicAnalyzerService → AIRouterService.analyser() → MistralProvider | GroqProvider | AlgorithmicEngine
 *
 * EXEMPLE: Si Mistral échoue 3 fois, Groq prend le relais ; si tout échoue, l'AlgorithmicEngine est utilisé.
 */
import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { AnalyseIA } from './ai-provider.interface';
import { MistralProvider } from './mistral-provider.service';
import { GroqProvider } from './groq-provider.service';
import { AlgorithmicEngine } from './algorithmic-engine.service';
import { CircuitBreaker } from './circuit-breaker';

const SEUIL_ECHECS = 3;
const RESET_MS = 60_000;
const MAX_RETRIES = 2;
const CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class AIRouterService {
  private readonly logger = new Logger(AIRouterService.name);
  private readonly providers: { provider: any; breaker: CircuitBreaker }[];
  private readonly cache = new Map<string, { resultat: AnalyseIA; timestamp: number }>();

  constructor(
    private mistral: MistralProvider,
    private groq: GroqProvider,
    private algorithmique: AlgorithmicEngine,
  ) {
    this.providers = [
      { provider: mistral, breaker: new CircuitBreaker(SEUIL_ECHECS, RESET_MS) },
      { provider: groq, breaker: new CircuitBreaker(SEUIL_ECHECS, RESET_MS) },
      { provider: algorithmique, breaker: new CircuitBreaker(SEUIL_ECHECS, RESET_MS) },
    ];
  }

  async analyser(hypothesis: string, contenu: string, scenario?: string | null): Promise<AnalyseIA> {
    const cle = createHash('sha256').update(`${hypothesis}|${contenu.substring(0, 500)}`).digest('hex').substring(0, 16);
    const enCache = this.cache.get(cle);
    if (enCache && Date.now() - enCache.timestamp < CACHE_TTL_MS) return enCache.resultat;

    let derniereErreur: string | null = null;

    for (const { provider, breaker } of this.providers) {
      if (!provider.disponible || !breaker.estDisponible) continue;

      for (let t = 0; t <= MAX_RETRIES; t++) {
        try {
          const debut = Date.now();
          const resultat = await provider.analyser(hypothesis, contenu, scenario);
          this.logger.log(`IA: provider=${provider.nom} latence=${Date.now() - debut}ms fallback=${resultat.fallback_used}`);
          breaker.enregistrerSucces();
          this.cache.set(cle, { resultat, timestamp: Date.now() });
          return resultat;
        } catch (error: any) {
          derniereErreur = error.message;
          this.logger.warn(`${provider.nom} tentative ${t+1}/${MAX_RETRIES+1}: ${error.message}`);
          if (t < MAX_RETRIES) await new Promise(r => setTimeout(r, Math.pow(2, t) * 1000));
        }
      }
      breaker.enregistrerEchec();
    }

    this.logger.warn(`Tous les providers IA ont échoué. Dernier: ${derniereErreur}`);
    const fallback = await this.algorithmique.analyser(hypothesis, contenu, scenario);
    this.cache.set(cle, { resultat: fallback, timestamp: Date.now() });
    return fallback;
  }
}
