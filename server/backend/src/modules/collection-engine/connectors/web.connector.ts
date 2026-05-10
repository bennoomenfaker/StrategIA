import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { IConnector, CollectedData } from './connector.interface';

@Injectable()
export class WebConnectorService implements IConnector {
  private readonly logger = new Logger(WebConnectorService.name);
  private readonly MAX_PAGES = 5;
  private readonly TIMEOUT = 30000;
  private readonly MAX_RETRIES = 3;
  private readonly CRAWL_DELAY = 500;

  async fetch(url: string): Promise<CollectedData[]> {
    return this.scrape(url);
  }

  private async fetchWithRetry(url: string, attempt = 1): Promise<string | null> {
    try {
      const { data } = await axios.get(url, {
        timeout: this.TIMEOUT,
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'fr,en;q=0.9',
        },
        maxRedirects: 5,
      });
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      if (attempt < this.MAX_RETRIES) {
        this.logger.warn(`Retry ${attempt}/${this.MAX_RETRIES} for ${url}`);
        await new Promise(r => setTimeout(r, 1000 * attempt));
        return this.fetchWithRetry(url, attempt + 1);
      }
      this.logger.error(`Failed to fetch ${url}: ${error.message}`);
      return null;
    }
  }

  private extractPublishDate($: cheerio.CheerioAPI): Date | undefined {
    const selectors = [
      'meta[property="article:published_time"]',
      'meta[name="pubdate"]',
      'meta[name="publishdate"]',
      'meta[name="date"]',
      'meta[itemprop="datePublished"]',
      'time[datetime]',
      'time[pubdate]',
    ];
    for (const sel of selectors) {
      const el = $(sel).first();
      const content = el.attr('content') || el.attr('datetime') || el.text();
      if (content) {
        const d = new Date(content.trim());
        if (!isNaN(d.getTime())) return d;
      }
    }
    return undefined;
  }

  private isSameDomain(base: string, target: string): boolean {
    try {
      return new URL(base).hostname === new URL(target).hostname;
    } catch {
      return false;
    }
  }

  private shouldSkipUrl(path: string): boolean {
    const skip = [
      /\/tag\//, /\/tags\//, /\/category\//, /\/categories\//,
      /\/author\//, /\/authors\//, /\/page\/\d+/,
      /\/subscribe/, /\/newsletter/, /\/login/, /\/register/,
      /\/search/, /\/about/, /\/contact/, /\/privacy/, /\/terms/,
      /\/wp-/, /\/feed\//, /\/rss\//, /\/atom\//,
      /\/comments?\//, /\/cdn-cgi\//, /#/, /javascript:/,
    ];
    return skip.some(p => p.test(path));
  }

  async scrape(url: string): Promise<CollectedData[]> {
    this.logger.log(`Scraping web pages from: ${url}`);

    const visited = new Set<string>();
    const items: CollectedData[] = [];
    const queue: string[] = [url];
    let pageCount = 0;

    while (queue.length > 0 && pageCount < this.MAX_PAGES) {
      const currentUrl = queue.shift()!;
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);

      const html = await this.fetchWithRetry(currentUrl);
      if (!html) continue;

      pageCount++;
      const $ = cheerio.load(html);
      $('script, style, nav, header, footer, aside, noscript, iframe, form, button, svg, canvas, [class*="sidebar" i], [class*="comment" i], [class*="advertisement" i], [class*="social" i], [class*="share" i], [class*="cookie" i], [class*="popup" i], [class*="modal" i], [class*="banner" i], [class*="sponsor" i]').remove();

      const title = $('title').text().trim() || $('h1').first().text().trim();
      const content = $('body').text().replace(/\s+/g, ' ').trim();
      const publishedAt = this.extractPublishDate($);

      if (!content) {
        this.logger.warn(`No content at ${currentUrl}`);
        continue;
      }

      this.logger.log(`Page ${pageCount}/${this.MAX_PAGES}: ${currentUrl} (${content.length} chars)`);

      items.push({
        sourceUrl: currentUrl,
        sourceType: 'WEB',
        title,
        description: content.substring(0, 200),
        content,
        contentRaw: content,
        publishedAt,
      });

      if (pageCount < this.MAX_PAGES) {
        const links: string[] = [];
        $('a[href]').each((_, el) => {
          const href = $(el).attr('href');
          if (!href) return;
          if (!href.startsWith('http') && !href.startsWith('/')) return;
          try {
            const absolute = href.startsWith('http') ? href : new URL(href, currentUrl).href;
            const path = new URL(absolute).pathname;
            if (!visited.has(absolute) && this.isSameDomain(url, absolute) && !this.shouldSkipUrl(path)) {
              links.push(absolute);
            }
          } catch {}
        });
        queue.push(...links.slice(0, 10));
        await new Promise(r => setTimeout(r, this.CRAWL_DELAY));
      }
    }

    this.logger.log(`Web: scraped ${items.length} pages`);
    return items;
  }
}
