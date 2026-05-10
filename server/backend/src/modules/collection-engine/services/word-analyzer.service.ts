import { Injectable, Logger } from '@nestjs/common';

const STOPWORDS = new Set([
  'le','la','les','un','une','des','de','du','et','est','en','que','qui','dans','ce','ci',
  'ne','pas','plus','par','au','sur','se','sont','avec','je','tu','il','elle','nous','vous',
  'ils','elles','à','y','a','été','être','avoir','fait','faire','peut','pouvoir','comme',
  'mais','donc','car','ou','si','quand','pour','son','ses','leur','leurs','tout','tous',
  'cette','cet','ces','mon','ma','mes','ton','ta','tes','notre','votre','the','and','or',
  'is','are','was','were','be','to','of','in','for','on','with','at','by','from','as','an',
  'it','its','that','this','these','those','a','i','me','my','we','our','you','your','he',
  'him','his','she','her','they','them','their','but','not','no','so','if','than','aux',
  'ont','ont','été','sont','cette','leurs','tout','dans','plus',
]);

@Injectable()
export class WordAnalyzerService {
  private readonly logger = new Logger(WordAnalyzerService.name);

  getTopWords(text: string, limit = 20): { text: string; value: number }[] {
    if (!text) return [];
    const words = text.toLowerCase().replace(/[^\w\sÀ-ÿ]/g, ' ').split(/\s+/);
    const filtered = words.filter(w => w.length > 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
    const counts: Record<string, number> = {};
    for (const w of filtered) counts[w] = (counts[w] || 0) + 1;
    const result = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([text, value]) => ({ text, value }));
    this.logger.log(`Word analysis: ${Object.keys(counts).length} unique words, top ${result.length}`);
    return result;
  }

  aggregateWordCloud(items: any[]): { text: string; value: number }[] {
    const all: Record<string, number> = {};
    for (const item of items) {
      const stats = item.wordStats || item.word_stats || [];
      if (Array.isArray(stats)) {
        for (const s of stats) {
          if (s?.text) all[s.text] = (all[s.text] || 0) + (s.value || 1);
        }
      }
    }
    return Object.entries(all)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([text, value]) => ({ text, value }));
  }
}
