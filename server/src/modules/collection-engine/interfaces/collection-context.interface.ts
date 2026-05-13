import { SourceType } from '../../../common/enums/source-type.enum';

export interface CollectionContext {
  planId: string;
  projectId: string;
  sourceType: SourceType;
  sourceUrl: string;
  keywords: string[];
  excludedKeywords: string[];
}
