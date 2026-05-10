'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Rss, BarChart3, Activity, Brain, ArrowLeft, Play, Loader2, Globe } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WordCloud from '@/components/WordCloud';
import StatsCards from '@/components/StatsCards';
import JobHistory from '@/components/JobHistory';
import { useAuthStore } from '@/stores/auth.store';

interface CollectionPlan {
  id: string;
  question: string;
  frequency: string;
  isActive: boolean;
  sources?: Source[];
  keywords?: Keyword[];
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

// Use any to avoid conflict with bullmq Job type
// Interface matching Prisma CollectionJob
// Using generic interface - will be used as any in component

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
        <h3 className="text-lg font-semibold">Plan non trouvé</h3>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{plan.question}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={plan.isActive ? 'default' : 'secondary'}>
              {plan.isActive ? 'Actif' : 'En pause'}
            </Badge>
            <Badge variant="outline">{plan.frequency}</Badge>
          </div>
        </div>
        <Button
          onClick={handleRunNow}
          disabled={running}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          {running ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Collecte en cours...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Lancer la collecte
            </>
          )}
        </Button>
      </div>

      <div className="flex gap-1 border-b border-border">
        {[
          { id: 'details', label: 'Détails', icon: Rss },
          { id: 'results', label: 'Résultats', count: results?.total || 0, icon: BarChart3 },
          { id: 'jobs', label: 'Jobs', count: jobs.length, icon: Activity },
          { id: 'ai', label: 'Analyse IA', icon: Brain },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as any)}
            className={`px-4 py-3 text-sm border-b-2 transition-all ${
              activeTab === tab.id
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 px-2 py-0.5 bg-card rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sources</CardTitle>
            </CardHeader>
            <CardContent>
              {(plan.sources || []).length === 0 ? (
                <p className="text-muted-foreground">Aucune source configurée</p>
              ) : (
                <div className="space-y-2">
                  {plan.sources?.map(source => (
                    <div key={source.id} className="flex items-center gap-2 text-sm">
                      {source.sourceType === 'RSS' ? (
                        <Rss className="h-3 w-3 text-orange-400" />
                      ) : (
                        <Globe className="h-3 w-3 text-green-400" />
                      )}
                      <span>{source.sourceLabel}</span>
                      <Badge variant="outline" className="text-xs">{source.sourceType}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mots-clés</CardTitle>
            </CardHeader>
            <CardContent>
              {(plan.keywords || []).length === 0 ? (
                <p className="text-muted-foreground">Aucun mot-clé configuré</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {plan.keywords?.map(kw => (
                    <Badge key={kw.id} variant={kw.keywordType === 'EXCLUDE' ? 'destructive' : 'default'} className="text-xs">
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
          {results.items && (
            <Card>
              <CardHeader>
                <CardTitle>Items collectés ({results.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.items.map((item: any, index: number) => (
                    <div key={index} className="p-4 bg-card/50 rounded-xl border border-border">
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
      {activeTab === 'ai' && (
        <Card className="p-12 text-center">
          <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Analyse IA</h3>
          <p className="text-muted-foreground mt-2">Fonctionnalité à venir...</p>
        </Card>
      )}
    </div>
  );
}
