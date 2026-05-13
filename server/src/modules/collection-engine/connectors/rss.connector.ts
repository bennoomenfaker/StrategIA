import { Injectable, Logger } from '@nestjs/common';
import * as RssParser from 'rss-parser';
import { IConnector, CollectedData } from './connector.interface';

@Injectable()
export class RssConnectorService implements IConnector {
  private readonly logger = new Logger(RssConnectorService.name);
  private readonly MAX_ITEMS = 20;
  private readonly TIMEOUT = 30000;
  private parser: RssParser;

  constructor() {
    this.parser = new RssParser({
      timeout: this.TIMEOUT,
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
        content: item.content || item.contentSnippet || '',
        contentRaw: item.content || item.contentSnippet || '',
        publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
      }));
    } catch (error: any) {
      this.logger.error(`RSS fetch failed for ${url}: ${error.message}`);
      return [];
    }
  }
}
