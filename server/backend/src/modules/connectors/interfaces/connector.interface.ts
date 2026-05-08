import { SourceType } from '../../../common/enums/source-type.enum';
import { CollectionResult } from '../../../common/interfaces/collection-result.interface';

export interface ConnectorConfig {
  url: string;
  keywords?: string[];
  excludedKeywords?: string[];
  maxItems?: number;
  headers?: Record<string, string>;
}

export interface IConnector {
  type: SourceType;
  collect(config: ConnectorConfig): Promise<CollectionResult[]>;
  validate(url: string): boolean;
}
