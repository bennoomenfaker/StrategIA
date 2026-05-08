"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Rss, Plus, Play, Loader2, Clock, Calendar, Trash2, Globe, Tags, Eye } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CollectionPlan {
  id: string;
  question: string;
  frequency: string;
  isActive: boolean;
  hypothesisId: string;
  hypothesis?: { content: string; axis?: { objective?: { project?: { name: string } } } };
  sources?: Source[];
  keywords?: Keyword[];
  lastRunAt?: string;
  nextRunAt?: string;
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

export default function CollectionPlansPage() {
  const [plans, setPlans] = useState<CollectionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningPlanId, setRunningPlanId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showAddSource, setShowAddSource] = useState<string | null>(null);
  const [showAddKeyword, setShowAddKeyword] = useState<string | null>(null);
  const [hypotheses, setHypotheses] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    question: "",
    frequency: "DAILY",
    hypothesisId: "",
  });
  
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [plansRes, hypRes] = await Promise.all([
        api.get("/collection-plans?include=hypothesis.sources,hypothesis.keywords"),
        api.get("/hypotheses"),
      ]);
      
      const plansData = plansRes.data.data || plansRes.data || [];
      const hypData = hypRes.data.data || hypRes.data || [];
      
      setPlans(plansData);
      setHypotheses(hypData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/collection-plans", form);
      setShowForm(false);
      setForm({ question: "", frequency: "DAILY", hypothesisId: "" });
      fetchData();
    } catch (err) {
      console.error("Failed to create plan:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await api.delete(`/collection-plans/${id}`);
      fetchData();
    } catch (err) {
      console.error("Failed to delete plan:", err);
    }
  };

  const handleAddSource = async (planId: string, url: string, type: string, label: string) => {
    try {
      await api.post(`/collection-plans/${planId}/sources`, {
        sourceType: type,
        sourceLabel: label,
        sourceUrl: url,
      });
      setShowAddSource(null);
      fetchData();
    } catch (err) {
      console.error("Failed to add source:", err);
    }
  };

  const handleAddKeyword = async (planId: string, keyword: string, type: string) => {
    try {
      await api.post(`/collection-plans/${planId}/keywords`, {
        keyword,
        keywordType: type,
      });
      setShowAddKeyword(null);
      fetchData();
    } catch (err) {
      console.error("Failed to add keyword:", err);
    }
  };

  const handleToggleActive = async (plan: CollectionPlan) => {
    try {
      await api.patch(`/collection-plans/${plan.id}`, { isActive: !plan.isActive });
      fetchData();
    } catch (err) {
      console.error("Failed to update plan:", err);
    }
  };

  const handleRunNow = async (id: string) => {
    setRunningPlanId(id);
    try {
      // Fetch plan details first
      const planRes = await api.get(`/collection-plans/${id}?include=sources,keywords`);
      const plan = planRes.data.data || planRes.data;
      
      if (!plan.sources || plan.sources.length === 0) {
        alert("No sources configured for this plan. Please add sources first.");
        setRunningPlanId(null);
        return;
      }
      
      // Transform sources to match Python API format
      const sources = (plan.sources || [])
        .filter((s: any) => s.isActive)
        .map((s: any) => ({
          url: s.sourceUrl,
          type: s.sourceType.toLowerCase(),
          label: s.sourceLabel,
        }));
      
      // Call Python collector engine directly
      const response = await fetch(`http://localhost:8000/collect?sync=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: id,
          sources,
          keywords: (plan.keywords || []).map((k: any) => ({ word: k.keyword, type: k.keywordType })),
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error("Python API error:", error);
        throw new Error(JSON.stringify(error.detail) || 'Failed');
      }
      
      const result = await response.json();
      alert(`Collection completed! Items found: ${result.itemsFound || 0}, Stored: ${result.itemsStored || 0}`);
      
      // Refresh the list
      fetchData();
    } catch (err: any) {
      console.error("Failed to trigger collection:", err);
      alert(err.message || "Failed to trigger collection. Make sure Python collector is running on port 8000");
    } finally {
      setRunningPlanId(null);
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Manage your data collection strategies</p>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            {showForm ? "Cancel" : "New Collection Plan"}
          </Button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Create Collection Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question">Research Question</Label>
                    <Textarea
                      id="question"
                      value={form.question}
                      onChange={(e) => setForm({ ...form, question: e.target.value })}
                      placeholder="What do you want to collect data about?"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={form.frequency}
                      onValueChange={(value) => setForm({ ...form, frequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ON_DEMAND">On Demand</SelectItem>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hypothesis">Linked Hypothesis</Label>
                    <Select
                      value={form.hypothesisId}
                      onValueChange={(value) => setForm({ ...form, hypothesisId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a hypothesis" />
                      </SelectTrigger>
                      <SelectContent>
                        {hypotheses.map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {h.content.substring(0, 50)}...
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit">Create Plan</Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <Card className="p-12 text-center">
            <Rss className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No collection plans yet</h3>
            <p className="text-muted-foreground mt-2">Create your first collection plan from a hypothesis</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Rss className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">{plan.question}</h3>
                      <Badge variant={plan.isActive ? "default" : "secondary"}>
                        {plan.isActive ? "Active" : "Paused"}
                      </Badge>
                      <Badge variant="outline">{plan.frequency}</Badge>
                    </div>
                    
                    {plan.hypothesis && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Hypothesis: {plan.hypothesis.content.substring(0, 60)}...
                      </p>
                    )}

                    {(plan.sources || []).length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Sources ({(plan.sources || []).length})
                        </p>
                        {(plan.sources || []).map((source) => (
                          <div key={source.id} className="flex items-center gap-2 text-sm ml-6">
                            {source.sourceType === "RSS" ? (
                              <Rss className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <Globe className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="text-muted-foreground">{source.sourceLabel}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {(plan.keywords || []).length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Tags className="h-4 w-4" />
                          Keywords ({(plan.keywords || []).length})
                        </p>
                        <div className="flex flex-wrap gap-2 ml-6">
                          {(plan.keywords || []).map((kw) => (
                            <Badge key={kw.id} variant="outline" className="text-xs">
                              {kw.keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddSource(showAddSource === plan.id ? null : plan.id)}
                      >
                        <Plus className="mr-2 h-3 w-3" />
                        Add Source
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddKeyword(showAddKeyword === plan.id ? null : plan.id)}
                      >
                        <Plus className="mr-2 h-3 w-3" />
                        Add Keyword
                      </Button>
                    </div>

                    {showAddSource === plan.id && (
                      <AddSourceForm
                        planId={plan.id}
                        onAdd={handleAddSource}
                        onCancel={() => setShowAddSource(null)}
                      />
                    )}

                    {showAddKeyword === plan.id && (
                      <AddKeywordForm
                        planId={plan.id}
                        onAdd={handleAddKeyword}
                        onCancel={() => setShowAddKeyword(null)}
                      />
                    )}
                  </div>

                   <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant={plan.isActive ? "secondary" : "default"}
                      onClick={() => handleToggleActive(plan)}
                    >
                      {plan.isActive ? "Pause" : "Activate"}
                    </Button>
                    <Link href={`/intelligence/collection-plans/${plan.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="mr-2 h-3 w-3" />
                        Détails
                      </Button>
                    </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRunNow(plan.id)}
                        disabled={runningPlanId === plan.id}
                      >
                        {runningPlanId === plan.id ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-3 w-3" />
                            Run Now
                          </>
                        )}
                      </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(plan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {(plan.lastRunAt || plan.nextRunAt) && (
                  <div className="mt-4 flex items-center gap-6 border-t border-border pt-4 text-xs text-muted-foreground">
                    {plan.lastRunAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last run: {new Date(plan.lastRunAt).toLocaleDateString()}
                      </span>
                    )}
                    {plan.nextRunAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Next run: {new Date(plan.nextRunAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
  );
}

function AddSourceForm({ planId, onAdd, onCancel }: any) {
  const [url, setUrl] = useState("");
  const [type, setType] = useState("WEB");
  const [label, setLabel] = useState("");

  const typeMap: Record<string, string> = {
    web: "WEB",
    rss: "RSS",
    api: "API",
    pdf: "PDF",
  };

  return (
    <div className="mt-4 p-4 border border-border rounded-lg space-y-4">
      <div className="space-y-2">
        <Label>URL</Label>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" />
      </div>
      <div className="space-y-2">
        <Label>Type</Label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full h-10 rounded-md border border-input px-3 text-sm"
        >
          <option value="WEB">Web</option>
          <option value="RSS">RSS</option>
          <option value="API">API</option>
          <option value="PDF">PDF</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label>Label</Label>
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Source name" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => { if (url && label) onAdd(planId, url, type, label); }}>
          Add Source
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function AddKeywordForm({ planId, onAdd, onCancel }: any) {
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("INCLUDE");

  return (
    <div className="mt-4 p-4 border border-border rounded-lg space-y-4">
      <div className="space-y-2">
        <Label>Keyword</Label>
        <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g., AI, Machine Learning" />
      </div>
      <div className="space-y-2">
        <Label>Type</Label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full h-10 rounded-md border border-input px-3 text-sm"
        >
          <option value="INCLUDE">Include</option>
          <option value="EXCLUDE">Exclude</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => { if (keyword) onAdd(planId, keyword, type); }}>
          Add Keyword
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
