/**
 * FICHIER: rss.connector.ts
 *
 * RÔLE: Connecteur RSS qui parse les flux RSS/Atom et extrait les articles (20 max par flux).
 *
 * RESPONSABILITÉS:
 * - Parser les flux RSS/Atom avec rss-parser
 * - Extraire titre, description, contenu brut, date de publication
 * - Limiter à 20 items par flux
 *
 * FLUX:
 * - CollectionEngineService → RssConnectorService.fetch(url) → CollectedData[]
 *
 * EXEMPLE: Un flux RSS d'actualités est parsé → 20 articles extraits avec titre et contenu.
 */
import { Injectable, Logger } from '@nestjs/common';
import * as RssParser from 'rss-parser';
import { IConnector, CollectedData } from './connector.interface';

@Injectable()
export class RssConnectorService implements IConnector {
  private readonly logger = new Logger(RssConnectorService.name);
  private readonly MAX_ITEMS = 20;
  private parser: RssParser;

  constructor() {
    this.parser = new RssParser({
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StrategIA-Collector/1.0)',
        Accept: 'application/rss+xml, application/atom+xml, application/xml',
      },
    });
  }

  async fetch(url: string): Promise<CollectedData[]> {
    try {
      const feed = await this.parser.parseURL(url);
      this.logger.log(`RSS: ${feed.items.length} items from ${url}`);
      return feed.items.slice(0, this.MAX_ITEMS).map(item => ({
        sourceUrl: item.link || url,
        sourceType: 'RSS',
        title: item.title || '',
        description: (item.contentSnippet || item.content || '').substring(0, 300),
        contentRaw: item.content || item.contentSnippet || '',
        publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
      }));
    } catch (error: any) {
      this.logger.error(`RSS fetch failed for ${url}: ${error.message}`);
      return [];
    }
  }
}
