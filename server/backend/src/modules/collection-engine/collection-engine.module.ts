import { Module } from '@nestjs/common';
import { CollectionEngineService } from './collection-engine.service';
import { CollectionEngineController } from './collection-engine.controller';
import { WebConnectorService } from './connectors/web.connector';
import { RssConnectorService } from './connectors/rss.connector';
import { PdfConnectorService } from './connectors/pdf.connector';
import { FilterService } from './services/filter.service';
import { DeduplicationService } from './services/deduplication.service';
import { TextNormalizerService } from './services/text-normalizer.service';
import { WordAnalyzerService } from './services/word-analyzer.service';
import { RawItemService } from './services/raw-item.service';

@Module({
  imports: [],
  controllers: [CollectionEngineController],
  providers: [
    CollectionEngineService,
    WebConnectorService,
    RssConnectorService,
    PdfConnectorService,
    FilterService,
    DeduplicationService,
    TextNormalizerService,
    WordAnalyzerService,
    RawItemService,
  ],
  exports: [CollectionEngineService],
})
export class CollectionEngineModule {}
