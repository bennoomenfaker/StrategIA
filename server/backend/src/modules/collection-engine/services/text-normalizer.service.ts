import { Injectable } from '@nestjs/common';

@Injectable()
export class TextNormalizerService {
  clean(text: string): string {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&[a-z]+;/g, ' ')
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
