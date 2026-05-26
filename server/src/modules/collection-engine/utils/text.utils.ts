/**
 * FICHIER: text.utils.ts
 *
 * RÔLE: Utilitaires de traitement de texte partagés par tous les services du moteur de collecte.
 *
 * RESPONSABILITÉS:
 * - Tokenization, nettoyage HTML, extraction de mots-clés et d'entités
 * - Génération de bigrammes, stopwords multilingues (FR/EN)
 *
 * FLUX:
 * - Utilisé par FilterService, WordAnalyzerService, RelevanceScoringService, InsightGeneratorService, SignalDetectionService
 *
 * EXEMPLE: tokenize("Bonjour le monde") → ["bonjour", "monde"] (stopword "le" exclu).
 */

const STOPWORDS = new Set([
  'alors','aucun','aussi','autre','avant','avec','avoir','bon','car','ceci','cela','celui',
  'certain','chaque','chez','combien','comme','comment','dans','depuis','dernier','devoir',
  'donc','dont','entre','environ','être','faire','force','hors','jamais','jusque','lequel',
  'leur','lorsque','maint','mais','même','monde','moins','nonobstant','notre','nul','où',
  'parfois','parmi','pendant','personne','peu','plupart','plusieurs','pourquoi','premier',
  'près','propre','puis','puisque','quand','quel','quelconque','quelque','quoique','sans',
  'sauf','selon','seul','sien','sinon','soudain','souvent','surtout','tandis','tant','tel',
  'tellement','tous','tout','toutefois','trop','très','vite','voici','voilà','vôtre','cet',
  'cette','aux','ont','été','sont','leurs','faite','faits','cela', 'cette', 'leurs',
  'the','and','or','is','are','was','were','be','to','of','in','for','on','with','at','by',
  'from','as','an','it','its','that','this','these','those','a','i','me','my','we','our',
  'you','your','he','him','his','she','her','they','them','their','but','not','no','so',
  'if','than','then','also','more','some','which','what','when','where','who','whom',
  'because','about','just','can','will','has','had','been','being','have','do','does','did',
  'would','could','should','may','might','shall','into','over','after','before','between',
  'under','up','down','out','off','only','very','too','much','many','each','every','own',
  'same','such','both','all','most','well','how','why','here','there','now','even',
  'still','yet','already','during','while','through','against','without','within',
  'along','around','among','upon','above','below', 'about', 'that', 'this', 'with', 'from',
  'have', 'been', 'were', 'they', 'their', 'which', 'what', 'when', 'where', 'will', 'would',
  'could', 'should', 'more', 'some', 'than', 'then', 'also', 'into', 'after',
  'before', 'between', 'other', 'such', 'only', 'very', 'just',
]);

const REGEX_NON_MOTS = /[^\w\sÀ-ÿœæ]/g;

/** Découpe un texte en tokens nettoyés */
export function tokenize(text: string, minLength = 2): string[] {
  return text.toLowerCase()
    .replace(REGEX_NON_MOTS, ' ')
    .split(/\s+/)
    .filter(w => w.length >= minLength && !STOPWORDS.has(w) && !/^\d+$/.test(w));
}

/** Extrait les tokens significatifs d'un texte (≥ 4 car, stopwords exclus) */
export function extraireMotsCles(texte: string): string[] {
  return tokenize(texte, 4);
}

/** Nettoie le HTML et les caractères spéciaux d'un texte brut */
export function nettoyerTexte(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(REGEX_NON_MOTS, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extrait les bigrammes d'un token array */
export function genererBigrammes(tokens: string[]): Set<string> {
  const bigrammes = new Set<string>();
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrammes.add(`${tokens[i]} ${tokens[i+1]}`);
  }
  return bigrammes;
}

/** Extrait les entités (noms propres) d'un texte, limité à 10 */
export function extraireEntites(items: { title?: string | null; contentCleaned?: string | null }[]): string[] {
  const entites = new Set<string>();
  for (const item of items) {
    const texte = `${item.title || ''} ${item.contentCleaned || ''}`;
    const matches = texte.match(/\b[A-Z][a-zéèêëàâîïôûùç]{2,}\s[A-Z][a-zéèêëàâîïôûùç]{2,}\b/g);
    if (matches) matches.forEach(m => entites.add(m));
  }
  return Array.from(entites).slice(0, 10);
}
