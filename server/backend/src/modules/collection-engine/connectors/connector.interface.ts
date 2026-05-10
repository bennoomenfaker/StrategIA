export interface CollectedData {
  sourceUrl: string;
  sourceType: string;
  title?: string;
  description?: string;
  content: string;
  contentRaw: string;
  publishedAt?: Date;
}

export interface IConnector {
  fetch(url: string): Promise<CollectedData[]>;
}
