/**
 * FICHIER: groq-provider.service.ts
 *
 * RÔLE: Provider Groq AI (fallback secondaire). Appelle l'API llama-3.3-70b-versatile.
 *
 * RESPONSABILITÉS:
 * - Appeler l'API Groq avec le prompt système et le contenu à analyser
 * - Parser la réponse JSON et retourner une AnalyseIA structurée
 * - Gérer les timeouts (15s) et les erreurs HTTP
 *
 * FLUX:
 * - AIRouterService → GroqProvider.analyser() (utilisé si Mistral échoue)
 *
 * EXEMPLE: Mistral est indisponible → Groq analyse le contenu avec llama-3.3-70b.
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider, AnalyseIA } from './ai-provider.interface';
import { PROMPT_SYSTEME_IA, construirePromptIA, parserReponseIA } from '../utils/ai.utils';

@Injectable()
export class GroqProvider implements AIProvider {
  private readonly logger = new Logger(GroqProvider.name);
  private readonly apiKey: string;
  private readonly model: string;
  readonly nom = 'groq';

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('app.groqApiKey') || '';
    this.model = config.get<string>('app.groqModel') || 'llama-3.3-70b-versatile';
  }

  get disponible(): boolean {
    return !!this.apiKey;
  }

  async analyser(hypothesis: string, contenu: string, scenario?: string | null): Promise<AnalyseIA> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: PROMPT_SYSTEME_IA },
          { role: 'user', content: construirePromptIA(hypothesis, contenu, scenario) },
        ],
        temperature: 0.1,
        max_tokens: 1024,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) throw new Error(`Groq ${response.status}: ${await response.text()}`);
    const raw = (await response.json()).choices?.[0]?.message?.content;
    if (!raw) throw new Error('Réponse Groq vide');

    return parserReponseIA(raw, 'groq');
  }
}
