export class CollectionJobDto {
  planId: string;
  sourceType: string;
  sourceUrl: string;
  keywords?: string[];
  excludedKeywords?: string[];
}
