export class ConnectorResultDto {
  title: string;
  content: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt?: Date;
  metadata?: Record<string, unknown>;
}
