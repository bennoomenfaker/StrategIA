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
  veilleType: string;
  startDate?: string;
  endDate?: string;
  organizationId?: string;
  ownerUserId?: string;
  isArchived: boolean;
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
}

export interface Hypothesis {
  id: string;
  content: string;
  priority: number;
  status: "OPEN" | "VALIDATED" | "INVALIDATED" | "IN_PROGRESS";
  validationScore?: number;
  validatedAt?: string;
  axisId: string;
  createdBy?: string;
  createdAt: string;
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

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
}
