/**
 * FICHIER: collection-engine.module.ts
 *
 * RÔLE: Module NestJS qui déclare et exporte le CollectionEngineService et tous ses providers/services.
 *
 * RESPONSABILITÉS:
 * - Enregistrer le contrôleur, le service principal, tous les sous-services et providers IA
 * - Exporter CollectionEngineService pour les autres modules
 *
 * FLUX:
 * - RootModule → CollectionEngineModule → CollectionEngineService + services internes
 *
 * EXEMPLE: Importé par AppModule pour rendre la collecte disponible dans l'application.
 */
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
import { RelevanceScoringService } from './services/relevance-scoring.service';
import { InsightGeneratorService } from './services/insight-generator.service';
import { StrategicAnalyzerService } from './services/strategic-analyzer.service';
import { AIValidatorService } from './services/ai-response-validator.service';
import { BatchBuilderService } from './services/batch-builder.service';
import { HypothesisUpdateEngine } from './services/hypothesis-update-engine.service';
import { SignalDetectionService } from './services/signal-detection.service';
import { MistralProvider } from './services/mistral-provider.service';
import { GroqProvider } from './services/groq-provider.service';
import { AlgorithmicEngine } from './services/algorithmic-engine.service';
import { AIRouterService } from './services/ai-router.service';

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
    RelevanceScoringService,
    InsightGeneratorService,
    StrategicAnalyzerService,
    AIValidatorService,
    BatchBuilderService,
    HypothesisUpdateEngine,
    SignalDetectionService,
    MistralProvider,
    GroqProvider,
    AlgorithmicEngine,
    AIRouterService,
  ],
  exports: [CollectionEngineService],
})
export class CollectionEngineModule {}
