/**
 * FICHIER: text-normalizer.service.ts
 *
 * RÔLE: Nettoie le texte brut collecté (HTML, entités, URLs) via l'utilitaire partagé.
 *
 * RESPONSABILITÉS:
 * - Déléguer le nettoyage à la fonction nettoyerTexte() dans text.utils
 *
 * FLUX:
 * - CollectionEngineService → TextNormalizerService.clean() → texte nettoyé
 *
 * EXEMPLE: Un article avec du HTML <p>Bonjour</p> est nettoyé en "Bonjour".
 */
import { Injectable } from '@nestjs/common';
import { nettoyerTexte } from '../utils/text.utils';

@Injectable()
export class TextNormalizerService {
  clean(text: string): string {
    return nettoyerTexte(text);
  }
}
