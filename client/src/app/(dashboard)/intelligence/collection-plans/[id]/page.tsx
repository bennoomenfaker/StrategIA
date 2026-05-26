'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Rss, BarChart3, Activity, Brain, ArrowLeft, Play, Loader2, Globe,
  Shield, Target, AlertTriangle, CheckCircle, XCircle, Clock,
  TrendingUp, FileText, Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WordCloud from '@/components/WordCloud';
import StatsCards from '@/components/StatsCards';
import JobHistory from '@/components/JobHistory';
import { useAuthStore } from '@/stores/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import type { Hypothesis as HypothesisType } from '@/types';

interface CollectionPlan {
  id: string;
  question: string;
  frequency: string;
  isActive: boolean;
  sources?: Source[];
  keywords?: Keyword[];
  hypothesisId: string;
  lastRunAt?: string;
}

interface Source {
  id: string;
  sourceType: string;
  sourceLabel: string;
  sourceUrl: string;
  isActive: boolean;
}

interface Keyword {
  id: string;
  keyword: string;
  keywordType: string;
}

interface CollectionResult {
  items?: any[];
  wordCloud?: WordStat[];
  total?: number;
}

interface WordStat {
  text: string;
  value: number;
}

function ConfidenceBar({ label, value, color }: { label: string; value?: number | null; color: string }) {
  if (value === undefined || value === null) return null;
  const pct = Math.min(Math.max(value * 100, 0), 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function AIAnalysisPanel({ hypothesisId }: { hypothesisId: string }) {
  const [hypothesis, setHypothesis] = useState<HypothesisType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (!hypothesisId) {
      setLoading(false);
      setError("Aucune hypothèse liée à ce plan de collecte");
      return;
    }
    fetchHypothesis();
  }, [hypothesisId]);

  const fetchHypothesis = async () => {
    try {
      const res = await api.get(`/hypotheses/${hypothesisId}`);
      setHypothesis(res.data.data || res.data);
    } catch (err: any) {
      console.error("Failed to fetch hypothesis AI data:", err);
      setError(err.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 rounded-xl bg-card animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="py-8 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-3" />
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!hypothesis) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">{t("collectionPlans.aiAnalysis")}</h3>
          <p className="text-muted-foreground mt-2">Aucune analyse disponible</p>
        </CardContent>
      </Card>
    );
  }

  const hasAIData = hypothesis.validationScore !== undefined ||
    hypothesis.confidenceAfter !== undefined ||
    hypothesis.scenario ||
    hypothesis.validationStatus;

  if (!hasAIData) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">{t("collectionPlans.aiAnalysis")}</h3>
          <p className="text-muted-foreground mt-2">
            Lancez une collecte pour générer l'analyse IA
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{t("collectionPlans.aiAnalysis")}</h3>
              <p className="text-muted-foreground mt-1">{hypothesis.content}</p>
            </div>
            {hypothesis.validationStatus && (
              <Badge variant={
                hypothesis.validationStatus === "SUPPORTED" ? "default" :
                hypothesis.validationStatus === "CONTRADICTED" ? "destructive" : "secondary"
              } className="gap-1.5">
                {hypothesis.validationStatus === "SUPPORTED" && <CheckCircle className="h-3 w-3" />}
                {hypothesis.validationStatus === "CONTRADICTED" && <XCircle className="h-3 w-3" />}
                {hypothesis.validationStatus === "UNCERTAIN" && <AlertTriangle className="h-3 w-3" />}
                {hypothesis.validationStatus}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Score cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-green-500/20">
          <CardContent className="py-4 text-center">
            <Shield className="h-5 w-5 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-500">
              {hypothesis.validationScore !== undefined ? `${(hypothesis.validationScore * 100).toFixed(0)}%` : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Score</p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20">
          <CardContent className="py-4 text-center">
            <Target className="h-5 w-5 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-500">{hypothesis.evidenceCount ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Preuves</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/20">
          <CardContent className="py-4 text-center">
            <XCircle className="h-5 w-5 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-500">{hypothesis.contradictionCount ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Contradictions</p>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20">
          <CardContent className="py-4 text-center">
            <TrendingUp className="h-5 w-5 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-500">
              {hypothesis.stabilityScore !== undefined ? `${(hypothesis.stabilityScore * 100).toFixed(0)}%` : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Stabilité</p>
          </CardContent>
        </Card>
      </div>

      {/* Scenario */}
      {hypothesis.scenario && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {t("hypotheses.scenario")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/90">{hypothesis.scenario}</p>
          </CardContent>
        </Card>
      )}

      {/* Confidence evolution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Métriques de confiance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <ConfidenceBar label="Confiance après analyse" value={hypothesis.confidenceAfter} color="bg-emerald-500" />
              <ConfidenceBar label="Stabilité" value={hypothesis.stabilityScore} color="bg-purple-500" />
            </div>
            <div className="space-y-3">
              {hypothesis.confidenceBefore !== undefined && (
                <ConfidenceBar label="Confiance avant analyse" value={hypothesis.confidenceBefore} color="bg-muted-foreground/40" />
              )}
              {hypothesis.timeframe && (
                <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-secondary/50">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Horizon :</span>
                  <span className="font-medium">{hypothesis.timeframe}</span>
                </div>
              )}
            </div>
          </div>

          {/* Confidence comparison */}
          {(hypothesis.confidenceBefore !== undefined && hypothesis.confidenceAfter !== undefined) && (
            <div className="pt-4 border-t border-border/50">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Évolution
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Avant</span>
                    <span>{(hypothesis.confidenceBefore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-muted-foreground/40 transition-all" style={{ width: `${hypothesis.confidenceBefore * 100}%` }} />
                  </div>
                </div>
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Après</span>
                    <span>{(hypothesis.confidenceAfter * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${hypothesis.confidenceAfter * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evidence breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-center">
          <p className="text-3xl font-bold text-green-500">{hypothesis.evidenceCount ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Éléments de preuve</p>
        </div>
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-center">
          <p className="text-3xl font-bold text-red-500">{hypothesis.contradictionCount ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Éléments contradictoires</p>
        </div>
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 text-center">
          <p className="text-3xl font-bold text-blue-500">{hypothesis.supportCount ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Sources de support</p>
        </div>
      </div>

      {hypothesis.lastEvaluatedAt && (
        <p className="text-xs text-muted-foreground text-center">
          Dernière évaluation : {new Date(hypothesis.lastEvaluatedAt).toLocaleDateString('fr-FR', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
        </p>
      )}
    </div>
  );
}

export default function CollectionPlanDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<CollectionPlan | null>(null);
  const [results, setResults] = useState<CollectionResult | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'results' | 'jobs' | 'ai'>('details');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { t } = useI18n();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchPlan();
  }, [isAuthenticated, id]);

  const fetchPlan = async () => {
    try {
      const res = await api.get(`/collection-plans/${id}?include=sources,keywords`);
      setPlan(res.data.data || res.data);
    } catch (err) {
      console.error('Failed to fetch plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await api.get(`/collection-plans/${id}/results`);
      setResults(res.data.data || res.data || null);
    } catch (err) {
      console.error('Failed to fetch results:', err);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get(`/collection-plans/${id}/jobs`);
      setJobs(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  const handleTabChange = (tab: 'details' | 'results' | 'jobs' | 'ai') => {
    setActiveTab(tab);
    if (tab === 'results' && !results) fetchResults();
    if (tab === 'jobs' && jobs.length === 0) fetchJobs();
  };

  const handleRunNow = async () => {
    if (!plan) return;
    setRunning(true);
    try {
      const result = await api.post(`/collection-engine/run/${plan.id}`);
      const data = result.data;
      alert(`Collection terminée ! ${data.collected || 0} items collectés`);
      fetchResults();
      fetchJobs();
    } catch (err: any) {
      console.error('Failed to trigger collection:', err);
      alert(err.message || 'Échec du déclenchement de la collecte');
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 rounded-xl border border-border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  if (!plan) {
    return (
      <Card className="p-12 text-center">
        <h3 className="text-lg font-semibold">{t("collectionPlans.planNotFound")}</h3>
      </Card>
    );
  }

  const tabs = [
    { id: 'details' as const, label: t("collectionPlans.details"), icon: Rss },
    { id: 'results' as const, label: t("collectionPlans.results"), count: results?.total || 0, icon: BarChart3 },
    { id: 'jobs' as const, label: t("collectionPlans.jobs"), count: jobs.length, icon: Activity },
    { id: 'ai' as const, label: t("collectionPlans.aiAnalysis"), icon: Brain },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold truncate">{plan.question}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={plan.isActive ? 'default' : 'secondary'} className="gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${plan.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
              {plan.isActive ? t("collectionPlans.active") : t("collectionPlans.paused")}
            </Badge>
            <Badge variant="outline">{plan.frequency}</Badge>
          </div>
        </div>
        <Button
          onClick={handleRunNow}
          disabled={running}
          className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          {running ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("collectionPlans.collecting")}
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              {t("collectionPlans.runCollection")}
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-3 text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-secondary rounded-full text-xs font-medium">
                  {tab.count}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rss className="h-4 w-4 text-orange-400" />
                    {t("collectionPlans.sources")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(plan.sources || []).length === 0 ? (
                    <p className="text-muted-foreground text-sm">{t("collectionPlans.noSources")}</p>
                  ) : (
                    <div className="space-y-2">
                      {plan.sources?.map(source => (
                        <div key={source.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                          {source.sourceType === 'RSS' ? (
                            <Rss className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                          ) : (
                            <Globe className="h-3.5 w-3.5 text-green-400 shrink-0" />
                          )}
                          <span className="text-sm truncate flex-1">{source.sourceLabel}</span>
                          <Badge variant="outline" className="text-xs shrink-0">{source.sourceType}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    {t("collectionPlans.keywords")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(plan.keywords || []).length === 0 ? (
                    <p className="text-muted-foreground text-sm">{t("collectionPlans.noKeywords")}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {plan.keywords?.map(kw => (
                        <Badge key={kw.id} variant={kw.keywordType === 'EXCLUDE' ? 'destructive' : 'default'} className="text-xs gap-1">
                          {kw.keyword}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'results' && results && (
            <div className="space-y-6">
              <StatsCards results={results} plan={plan} />
              {results.wordCloud && <WordCloud wordCloud={results.wordCloud} />}
              {results.items && results.items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("collectionPlans.results")} ({results.items.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.items.map((item: any, index: number) => (
                        <div key={index} className="p-4 bg-card/50 rounded-xl border border-border hover:border-primary/20 transition-all">
                          <h4 className="text-sm font-medium text-white">{item.title || 'Sans titre'}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {item.contentRaw?.substring(0, 150)}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <span className="truncate">{item.sourceUrl}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'jobs' && <JobHistory jobs={jobs} />}
          {activeTab === 'ai' && <AIAnalysisPanel hypothesisId={plan.hypothesisId} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
