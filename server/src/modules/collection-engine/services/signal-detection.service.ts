/**
 * FICHIER: signal-detection.service.ts
 *
 * RÔLE: Détecte les signaux faibles et tendances émergentes par analyse des 200 derniers items (burst detection).
 *
 * RESPONSABILITÉS:
 * - Analyser les 200 derniers items collectés pour détecter des bursts de mots
 * - Classifier les signaux (FAIBLE, EMERGENT, CONFIRME, TENDANCE)
 * - Sauvegarder ou mettre à jour les signaux en base
 *
 * FLUX:
 * - CollectionEngineService → SignalDetectionService.detecterSignaux() → sauvegarde signaux + tendances
 *
 * EXEMPLE: Le mot "guerre" apparaît 15× sur 3 sources en 2 jours → signal EMERGENT créé.
 */

/**
 * EXEMPLE DE TEST — detecterSignaux():
 *
 * Input:
 *   - projectId: "proj-123"
 *   - Base de données avec 5 articles récents sur "guerre économique" de 3 sources différentes
 *
 * Output attendu:
 *   - signaux: [{ titre: "guerre", occurrences: 5, sources: 3, type_signal: "CONFIRME" },
 *               { titre: "économique", occurrences: 4, sources: 2, type_signal: "EMERGENT" }]
 *   - resume: { total_signaux: 2, total_tendances: 0, sources_analysees: 3 }
 */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { SignalStrength } from '@prisma/client';
import { extraireMotsCles, extraireEntites } from '../utils/text.utils';

export interface DetectedSignal {
  titre: string;
  description: string;
  force: SignalStrength;
  score_confiance: number;
  nombre_sources: number;
  nombre_occurrences: number;
  source_urls: string[];
  entites: string[];
  mots_cles: string[];
  date_premiere_detection: Date;
  type_signal: 'FAIBLE' | 'EMERGENT' | 'CONFIRME' | 'TENDANCE';
}

export interface AnalyseSignauxResult {
  signaux: DetectedSignal[];
  tendances: DetectedSignal[];
  resume: { total_signaux: number; total_tendances: number; sources_analysees: number };
}

@Injectable()
export class SignalDetectionService {
  private readonly logger = new Logger(SignalDetectionService.name);

  constructor(private prisma: PrismaService) {}

  async detecterSignaux(projectId: string): Promise<AnalyseSignauxResult> {
    const items = await this.prisma.rawItem.findMany({
      where: { projectId, isDuplicate: false },
      orderBy: { fetchedAt: 'desc' },
      take: 200,
      select: { id: true, title: true, contentCleaned: true, sourceUrl: true, sourceType: true, publishedAt: true, fetchedAt: true, classification: true, sentimentScore: true, entities: true },
    });

    if (!items.length) return { signaux: [], tendances: [], resume: { total_signaux: 0, total_tendances: 0, sources_analysees: 0 } };

    this.logger.log(`Analyse de ${items.length} items (projet ${projectId})`);

    const motsParItem = items.map(item => ({ ...item, mots: extraireMotsCles(item.contentCleaned || item.title || '') }));
    const occ = new Map<string, { count: number; sources: Set<string>; items: any[]; premier: Date; dernier: Date }>();

    for (const item of motsParItem) {
      const vus = new Set<string>();
      for (const mot of item.mots) {
        if (vus.has(mot)) continue;
        vus.add(mot);
        if (!occ.has(mot)) occ.set(mot, { count: 0, sources: new Set(), items: [], premier: item.fetchedAt, dernier: item.fetchedAt });
        const e = occ.get(mot)!;
        e.count++; e.sources.add(item.sourceUrl); e.items.push(item);
        if (item.fetchedAt < e.premier) e.premier = item.fetchedAt;
        if (item.fetchedAt > e.dernier) e.dernier = item.fetchedAt;
      }
    }

    const maintenant = new Date();
    const signaux: DetectedSignal[] = [];
    const tendances: DetectedSignal[] = [];

    // Analyse de chaque mot : seuil minimal 3 occurrences, calcul d'intensité et détection de burst
    for (const [mot, data] of occ) {
      if (data.count < 3) continue;
      const joursDepuis = (maintenant.getTime() - data.premier.getTime()) / 86400000;
      const dureeJours = Math.max(1, (data.dernier.getTime() - data.premier.getTime()) / 86400000);
      const intensite = data.count / dureeJours;
      const multiSource = data.sources.size >= 2;
      const recent = joursDepuis < 14;
      const burst = intensite > 2 && data.count >= 5;

      const scoreConfiance = Math.min((data.count / 10) * 0.4 + (data.sources.size / 5) * 0.3 + (recent ? 0.2 : 0) + (burst ? 0.1 : 0), 1.0);

      let typeSignal: DetectedSignal['type_signal'];
      let force: SignalStrength;
      // Classification par seuils : TENDANCE > CONFIRME > EMERGENT > FAIBLE
      if (burst && multiSource && recent) { typeSignal = 'TENDANCE'; force = 'FORT'; }
      else if (multiSource && data.count >= 10) { typeSignal = 'CONFIRME'; force = 'MOYEN'; }
      else if (burst && !multiSource) { typeSignal = 'EMERGENT'; force = 'FAIBLE'; }
      else { typeSignal = 'FAIBLE'; force = 'FAIBLE'; }

      const signal: DetectedSignal = {
        titre: mot,
        description: `Détecté ${data.count}× sur ${data.sources.size} source(s) en ${Math.round(dureeJours)}j`,
        force, score_confiance: Math.round(scoreConfiance * 100) / 100, nombre_sources: data.sources.size,
        nombre_occurrences: data.count, source_urls: Array.from(data.sources).slice(0, 5),
        entites: extraireEntites(data.items), mots_cles: [mot], date_premiere_detection: data.premier, type_signal: typeSignal,
      };

      if (typeSignal === 'TENDANCE' || typeSignal === 'CONFIRME') tendances.push(signal);
      else signaux.push(signal);
    }

    signaux.sort((a, b) => b.score_confiance - a.score_confiance);
    tendances.sort((a, b) => b.score_confiance - a.score_confiance);

    this.logger.log(`${signaux.length} signaux, ${tendances.length} tendances`);
    return {
      signaux: signaux.slice(0, 20), tendances: tendances.slice(0, 10),
      resume: { total_signaux: signaux.length, total_tendances: tendances.length, sources_analysees: new Set(items.map(i => i.sourceUrl)).size },
    };
  }

  async sauvegarderSignaux(projectId: string, signaux: DetectedSignal[]): Promise<void> {
    for (const signal of signaux) {
      const existant = await this.prisma.signal.findFirst({ where: { projectId, title: signal.titre } });
      if (existant) {
        await this.prisma.signal.update({
          where: { id: existant.id },
          data: { strength: signal.force, lastDetected: new Date(), detectionCount: { increment: signal.nombre_occurrences }, description: signal.description },
        });
      } else {
        await this.prisma.signal.create({
          data: {
            title: signal.titre, description: signal.description, strength: signal.force, projectId,
            category: signal.type_signal === 'TENDANCE' ? 'TENDANCE' : 'SIGNAL_AUTOMATIQUE',
            tags: signal.mots_cles,
            metadata: { score_confiance: signal.score_confiance, nombre_sources: signal.nombre_sources, nombre_occurrences: signal.nombre_occurrences, entites: signal.entites, type_signal: signal.type_signal },
          },
        });
      }
    }
  }
}
