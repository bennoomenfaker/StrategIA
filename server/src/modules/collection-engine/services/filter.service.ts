/**
 * FICHIER: filter.service.ts
 *
 * RÔLE: Filtre les contenus collectés par mots-clés INCLUDE/EXCLUDE avec tokenization et word-boundary matching.
 *
 * RESPONSABILITÉS:
 * - Matcher les mots-clés INCLUDE (un seul suffit pour passer)
 * - Bloquer les contenus contenant des mots-clés EXCLUDE
 * - Retourner la liste des mots-clés trouvés dans le texte
 *
 * FLUX:
 * - CollectionEngineService → FilterService.match() → items filtrés
 *
 * EXEMPLE: Keywords = ["guerre INCLUDE", "paix EXCLUDE"] → un article sur "guerre" passe, "paix dans le monde" est exclu.
 */

/**
 * EXEMPLE DE TEST — match():
 *
 * Input:
 *   - text: "La guerre économique fait rage entre les grandes puissances"
 *   - keywords: [{ keyword: "guerre", keywordType: "INCLUDE" },
 *                { keyword: "paix", keywordType: "EXCLUDE" }]
 *
 * Output attendu:
 *   - match() → true ("guerre" trouvé, "paix" absent)
 *
 * EXEMPLE DE TEST — getMatchedKeywords():
 *
 * Input:
 *   - text: "L'intelligence artificielle en médecine"
 *   - keywords: [{ keyword: "intelligence artificielle", keywordType: "INCLUDE" },
 *                { keyword: "sport", keywordType: "INCLUDE" }]
 *
 * Output attendu:
 *   - getMatchedKeywords() → ["intelligence artificielle"] (matché en bigramme)
 */
import { Injectable } from '@nestjs/common';
import { tokenize, genererBigrammes } from '../utils/text.utils';

@Injectable()
export class FilterService {
  private wordBoundaryMatch(kw: string, wordSet: Set<string>, bigrams: Set<string>, tokens: string[]): boolean {
    // Matching par mot unique (Set), bigramme (Set) ou séquence ordonnée pour les expressions longues
    const parts = kw.toLowerCase().split(/\s+/);
    if (parts.length === 1) return wordSet.has(parts[0]);
    if (parts.length === 2) return bigrams.has(parts.join(' '));
    let idx = 0;
    for (const t of tokens) { if (t === parts[idx]) idx++; if (idx === parts.length) return true; }
    return false;
  }

  match(text: string, keywords: { keyword: string; keywordType: string }[]): boolean {
    if (!text || !keywords?.length) return true;
    const tokens = tokenize(text);
    const wordSet = new Set(tokens);
    const bigrams = genererBigrammes(tokens);

    const includes = keywords.filter(k => k.keywordType === 'INCLUDE').map(k => k.keyword);
    const excludes = keywords.filter(k => k.keywordType === 'EXCLUDE').map(k => k.keyword);

    // EXCLUDE bloquant (prioritaire) : un seul mot exclu trouvé → rejet immédiat
    if (excludes.some(kw => this.wordBoundaryMatch(kw, wordSet, bigrams, tokens))) return false;
    // INCLUDE : un seul mot-clé suffit pour accepter le contenu
    if (includes.length > 0) return includes.some(kw => this.wordBoundaryMatch(kw, wordSet, bigrams, tokens));
    return true;
  }

  getMatchedKeywords(text: string, keywords: { keyword: string; keywordType: string }[]): string[] {
    if (!text || !keywords?.length) return [];
    const tokens = tokenize(text);
    const wordSet = new Set(tokens);
    const bigrams = genererBigrammes(tokens);
    return keywords.filter(k => k.keywordType === 'INCLUDE').filter(k => this.wordBoundaryMatch(k.keyword, wordSet, bigrams, tokens)).map(k => k.keyword);
  }
}
