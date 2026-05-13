import { SourceType } from '../enums/source-type.enum';

export interface CollectionResult {
  title: string;
  content: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt?: Date;
  sourceType: SourceType;
  metadata?: Record<string, unknown>;
}
