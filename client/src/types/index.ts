export interface User {
  id: string;
  email: string;
  nom: string;
  type: "INDIVIDUEL" | "ORGANISATION";
  status: "ACTIF" | "INACTIF" | "SUSPENDU";
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  logo?: string;
  website?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  slug: string;
  veilleType: 'TECHNOLOGIQUE' | 'CONCURRENTIELLE' | 'COMMERCIALE' | 'REGLEMENTAIRE' | 'STRATEGIQUE' | 'E_REPUTATION' | 'SCIENTIFIQUE' | 'GEOPOLITIQUE' | 'ENVIRONNEMENTALE' | 'SECURITAIRE' | 'SOCIETALE' | 'CUSTOM';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  problematic?: string;
  context?: string;
  expectedDecision?: string;
  startDate?: string;
  endDate?: string;
  closedAt?: string;
  organizationId?: string;
  ownerUserId?: string;
  deletedAt?: string;
  createdAt: string;
}

export interface Objective {
  id: string;
  content: string;
  priority: number;
  projectId: string;
  createdAt: string;
}

export interface Axis {
  id: string;
  name: string;
  description?: string;
  priority: number;
  objectiveId: string;
  createdAt: string;
  objective?: Objective;
}

export interface Hypothesis {
  id: string;
  content: string;
  priority: number;
  status: "OPEN" | "IN_PROGRESS" | "VALIDATED" | "INVALIDATED" | "PENDING_REVIEW";
  validationScore?: number;
  validatedAt?: string;
  axisId: string;
  createdBy?: string;
  createdAt: string;

  // Strategic enrichment (AI pipeline)
  scenario?: string;
  timeframe?: string;
  confidenceBefore?: number;
  confidenceAfter?: number;
  evidenceCount?: number;
  contradictionCount?: number;
  supportCount?: number;
  lastEvaluatedAt?: string;
  stabilityScore?: number;
  validationStatus?: "PENDING" | "SUPPORTED" | "CONTRADICTED" | "UNCERTAIN";

  // Relations
  axis?: Axis;
  axe?: Axis;
  perimeters?: HypothesisPerimeter[];
  collectionPlans?: CollectionPlan[];
  _count?: { collectionPlans: number };
}

export interface HypothesisPerimeter {
  id: string;
  hypothesisId: string;
  perimeterId: string;
  perimeter?: Perimeter;
}

export interface CollectionPlan {
  id: string;
  question: string;
  frequency: "ON_DEMAND" | "DAILY" | "WEEKLY" | "MONTHLY";
  cronExpression?: string;
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  hypothesisId: string;
  createdAt: string;
}

export interface RawItem {
  id: string;
  title?: string;
  contentRaw?: string;
  contentCleaned?: string;
  summary?: string;
  sourceType: string;
  sourceUrl: string;
  sourceName?: string;
  publishedAt?: string;
  fetchedAt: string;
  isDuplicate: boolean;
  language?: string;
  wordCount?: number;
  projectId: string;
  classification?: string;
  sentimentScore?: number;
  entities?: Record<string, unknown>;
  createdAt: string;
}

export interface Insight {
  id: string;
  title: string;
  content: string;
  type: 'OPPORTUNITY' | 'THREAT' | 'TREND' | 'SIGNAL_FAIBLE' | 'CONFIRMATION' | 'ALERT' | 'INFORMATION';
  confidence?: number;
  projectId: string;
  hypothesisId?: string;
  sourceItemId?: string;
  impactScore?: number;
  urgencyScore?: number;
  tags: string[];
  createdBy?: string;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  title: string;
  content: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'DRAFT' | 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED';
  insightId: string;
  projectId: string;
  decisionId?: string;
  expectedImpact?: string;
  resourcesNeeded?: string;
  risks?: string;
  deadline?: string;
  tags: string[];
  createdBy?: string;
  createdAt: string;
}

export interface StrategicDecision {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'TAKEN' | 'DEFERRED' | 'CANCELLED';
  projectId: string;
  options?: Record<string, unknown>;
  selectedOption?: string;
  rationale?: string;
  expectedOutcome?: string;
  actualOutcome?: string;
  decisionDate?: string;
  tags: string[];
  createdBy?: string;
  createdAt: string;
}

export interface Signal {
  id: string;
  title: string;
  description: string;
  strength: 'FAIBLE' | 'MOYEN' | 'FORT' | 'CONFIRME';
  projectId: string;
  hypothesisId?: string;
  sourceItemId?: string;
  category?: string;
  sourceUrl?: string;
  firstDetected: string;
  lastDetected: string;
  detectionCount: number;
  tags: string[];
  createdAt: string;
}

export interface Trend {
  id: string;
  name: string;
  description: string;
  direction?: string;
  momentum?: number;
  projectId: string;
  category?: string;
  keywords: string[];
  confidence?: number;
  firstDetected: string;
  lastDetected: string;
  tags: string[];
  createdAt: string;
}

export interface Perimeter {
  id: string;
  name: string;
  description?: string;
  type: 'GEOGRAPHIC' | 'SECTORIAL' | 'TEMPORAL' | 'ORGANIZATIONAL' | 'TECHNOLOGICAL';
  projectId: string;
  parentId?: string;
  children?: Perimeter[];
  createdAt: string;
}

export interface AnalyseIA {
  summary: string;
  answer: string;
  relevance_score: number;
  hypothesis_impact: 'SUPPORTED' | 'CONTRADICTED' | 'PARTIALLY_SUPPORTED' | 'INCONCLUSIVE';
  confidence_score: number;
  entities: string[];
  topics: string[];
  provider: string;
  fallback_used: boolean;
}

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
}
