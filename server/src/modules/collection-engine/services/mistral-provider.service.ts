/**
 * FICHIER: mistral-provider.service.ts
 *
 * RÔLE: Provider Mistral AI (principal). Appelle l'API mistral-large-latest pour l'analyse stratégique.
 *
 * RESPONSABILITÉS:
 * - Appeler l'API Mistral avec le prompt système et le contenu à analyser
 * - Parser la réponse JSON et retourner une AnalyseIA structurée
 * - Gérer les timeouts (15s) et les erreurs HTTP
 *
 * FLUX:
 * - AIRouterService → MistralProvider.analyser() (premier provider tenté)
 *
 * EXEMPLE: Un lot d'items est envoyé à Mistral pour analyser son impact sur une hypothèse.
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider, AnalyseIA } from './ai-provider.interface';
import { PROMPT_SYSTEME_IA, construirePromptIA, parserReponseIA } from '../utils/ai.utils';

@Injectable()
export class MistralProvider implements AIProvider {
  private readonly logger = new Logger(MistralProvider.name);
  private readonly apiKey: string;
  private readonly model: string;
  readonly nom = 'mistral';

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('app.mistralApiKey') || '';
    this.model = config.get<string>('app.mistralModel') || 'mistral-large-latest';
  }

  get disponible(): boolean {
    return !!this.apiKey;
  }

  async analyser(hypothesis: string, contenu: string, scenario?: string | null): Promise<AnalyseIA> {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
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

    if (!response.ok) throw new Error(`Mistral ${response.status}: ${await response.text()}`);
    const raw = (await response.json()).choices?.[0]?.message?.content;
    if (!raw) throw new Error('Réponse Mistral vide');

    return parserReponseIA(raw, 'mistral');
  }
}
