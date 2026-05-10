import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FilterService {
  private readonly logger = new Logger(FilterService.name);

  match(text: string, keywords: { keyword: string; keywordType: string }[]): boolean {
    if (!text || !keywords?.length) return true;

    const lower = text.toLowerCase();
    const includes = keywords.filter(k => k.keywordType === 'INCLUDE').map(k => k.keyword.toLowerCase());
    const excludes = keywords.filter(k => k.keywordType === 'EXCLUDE').map(k => k.keyword.toLowerCase());

    if (excludes.some(kw => lower.includes(kw))) return false;
    if (includes.length > 0) return includes.some(kw => lower.includes(kw));
    return true;
  }

  getMatchedKeywords(text: string, keywords: { keyword: string; keywordType: string }[]): string[] {
    if (!text || !keywords?.length) return [];
    const lower = text.toLowerCase();
    return keywords
      .filter(k => k.keywordType === 'INCLUDE' && lower.includes(k.keyword.toLowerCase()))
      .map(k => k.keyword);
  }
}
