/**
 * FICHIER: circuit-breaker.ts
 *
 * RÔLE: Implémente un coupe-circuit : désactive un provider après 3 échecs, le réactive après 60s.
 *
 * RESPONSABILITÉS:
 * - Compter les échecs consécutifs d'un provider
 * - Désactiver le provider après le seuil (3 échecs)
 * - Réactiver automatiquement après la durée de reset (60s)
 *
 * FLUX:
 * - AIRouterService utilise CircuitBreaker pour chaque provider
 *
 * EXEMPLE: Mistral échoue 3 fois → circuit ouvert → plus d'appels pendant 60s.
 */
export class CircuitBreaker {
  private echecs = 0;
  private dernierEchecMs = 0;

  constructor(private readonly seuil: number, private readonly dureeResetMs: number) {}

  get estDisponible(): boolean {
    if (this.echecs < this.seuil) return true;
    if (Date.now() - this.dernierEchecMs > this.dureeResetMs) {
      this.echecs = 0;
      return true;
    }
    return false;
  }

  enregistrerEchec(): void {
    this.echecs++;
    this.dernierEchecMs = Date.now();
  }

  enregistrerSucces(): void {
    this.echecs = 0;
  }
}
