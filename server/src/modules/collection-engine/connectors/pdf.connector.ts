/**
 * FICHIER: pdf.connector.ts
 *
 * RÔLE: Connecteur PDF qui extrait le texte de documents PDF (URL ou fichier local).
 *
 * RESPONSABILITÉS:
 * - Télécharger un PDF distant ou lire un fichier local
 * - Extraire le texte via pdf-parse
 * - Retourner le titre, le contenu et la date de création
 *
 * FLUX:
 * - CollectionEngineService → PdfConnectorService.fetch(url) → CollectedData[]
 *
 * EXEMPLE: Un rapport PDF hébergé sur un serveur est téléchargé et son texte extrait pour analyse.
 */
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { IConnector, CollectedData } from './connector.interface';

@Injectable()
export class PdfConnectorService implements IConnector {
  private readonly logger = new Logger(PdfConnectorService.name);
  private readonly TIMEOUT = 30000;

  async fetch(url: string): Promise<CollectedData[]> {
    try {
      let pdfBuffer: Buffer;
      if (url.startsWith('http')) {
        const response = await fetch(url, { signal: AbortSignal.timeout(this.TIMEOUT) });
        pdfBuffer = Buffer.from(await response.arrayBuffer());
      } else {
        pdfBuffer = fs.readFileSync(url);
      }

      const pdfParse = require('pdf-parse');
      const data = await pdfParse(pdfBuffer);

      this.logger.log(`PDF: extracted ${data.text.length} chars from ${path.basename(url)}`);

      return [{
        sourceUrl: url,
        sourceType: 'PDF',
        title: data.info?.Title || path.basename(url),
        description: data.text.substring(0, 200),
        contentRaw: data.text,
        publishedAt: data.info?.CreationDate ? new Date(data.info.CreationDate) : undefined,
      }];
    } catch (error: any) {
      this.logger.error(`PDF fetch failed for ${url}: ${error.message}`);
      return [];
    }
  }
}
