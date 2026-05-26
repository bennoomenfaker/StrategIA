/**
 * FICHIER: word-analyzer.service.ts
 *
 * RÔLE: Analyse les mots les plus fréquents dans les textes collectés avec pondération des mots-clés INCLUDE (×5).
 *
 * RESPONSABILITÉS:
 * - Extraire le top N mots les plus fréquents d'un texte
 * - Pondérer les mots-clés INCLUDE (×5) pour le nuage de mots
 * - Aggréger les nuages de mots de plusieurs items
 *
 * FLUX:
 * - CollectionEngineService → WordAnalyzerService.getTopWords() / aggregateWordCloud()
 *
 * EXEMPLE: Un article contient 3× "pétrole" et 2× "énergie" (mot-clé INCLUDE ×5) → "énergie" remonte en premier.
 */
import { Injectable, Logger } from '@nestjs/common';
import { tokenize } from '../utils/text.utils';

@Injectable()
export class WordAnalyzerService {
  private readonly logger = new Logger(WordAnalyzerService.name);

  getTopWords(text: string, keywords?: { keyword: string; keywordType: string }[], limit = 20): { text: string; value: number }[] {
    if (!text) return [];

    const includeSet = new Set((keywords || []).filter(k => k.keywordType === 'INCLUDE').map(k => k.keyword.toLowerCase()));
    const tokens = tokenize(text, 3);

    const counts: Record<string, number> = {};
    for (const w of tokens) counts[w] = (counts[w] || 0) + (includeSet.has(w) ? 5 : 1);

    const result = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([text, value]) => ({ text, value }));
    this.logger.log(`${Object.keys(counts).length} mots uniques, top ${result.length}`);
    return result;
  }

  aggregateWordCloud(items: any[]): { text: string; value: number }[] {
    const all: Record<string, number> = {};
    for (const item of items) {
      const stats = item.wordStats || item.word_stats || [];
      if (Array.isArray(stats)) for (const s of stats) if (s?.text) all[s.text] = (all[s.text] || 0) + (s.value || 1);
    }
    return Object.entries(all).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([text, value]) => ({ text, value }));
  }
}
