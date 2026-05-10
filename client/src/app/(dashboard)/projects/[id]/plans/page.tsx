"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeft, Edit, Trash2, X, Globe, Rss, FileText, Clock } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

interface CollectionPlan {
  id: string;
  name: string;
  status: string;
  frequency: string;
  startDate?: string;
  endDate?: string;
  sources?: Source[];
  keywords?: Keyword[];
  hypothesis?: { statement: string; axe?: { name: string } };
  _count?: { rawData: number };
}

interface Source {
  id: string;
  type: string;
  url: string;
  name?: string;
}

interface Keyword {
  id: string;
  term: string;
  type: string;
}

interface Hypothesis {
  id: string;
  statement: string;
  axe?: { name: string };
}

export default function ProjectPlansPage() {
  const { id } = useParams();
  const [plans, setPlans] = useState<CollectionPlan[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CollectionPlan | null>(null);
  const [filterHypothesisId, setFilterHypothesisId] = useState<string>("");
  const [form, setForm] = useState({
    question: "",
    hypothesisId: "",
    frequency: "WEEKLY",
    startDate: "",
    endDate: "",
  });
  const [sources, setSources] = useState<{ type: string; url: string; name: string }[]>([
    { type: "RSS", url: "", name: "" },
  ]);
  const [keywords, setKeywords] = useState<{ term: string; type: "INCLUDE" | "EXCLUDE" }[]>([
    { term: "", type: "INCLUDE" },
  ]);
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchPlans();
    fetchHypotheses();
  }, [isAuthenticated, id]);

  const fetchPlans = async () => {
    try {
      const res = await api.get(`/collection-plans?projectId=${id}`);
      setPlans(res.data || []);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHypotheses = async () => {
    try {
      const res = await api.get(`/hypotheses?projectId=${id}`);
      setHypotheses(res.data || []);
    } catch (err) {
      console.error("Failed to fetch hypotheses:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await api.patch(`/collection-plans/${editingPlan.id}`, form);
      } else {
        const payload = {
          question: form.question,
          hypothesisId: form.hypothesisId,
          frequency: form.frequency,
          collectionStartDate: form.startDate || undefined,
          collectionEndDate: form.endDate || undefined,
        };
        const res = await api.post("/collection-plans", payload);
        const planId = res.data.id;
        for (const source of sources) {
          if (source.url) {
            await api.post(`/collection-plans/${planId}/sources`, {
              sourceType: source.type,
              sourceUrl: source.url,
              sourceLabel: source.name || source.url,
            });
          }
        }
        for (const keyword of keywords) {
          if (keyword.term) {
            await api.post(`/collection-plans/${planId}/keywords`, {
              keyword: keyword.term,
              keywordType: keyword.type,
            });
          }
        }
      }
      setShowForm(false);
      setEditingPlan(null);
      resetForm();
      fetchPlans();
    } catch (err) {
      console.error("Failed to save plan:", err);
    }
  };

  const resetForm = () => {
    setForm({
      question: "",
      hypothesisId: "",
      frequency: "WEEKLY",
      startDate: "",
      endDate: "",
    });
    setSources([{ type: "RSS", url: "", name: "" }]);
    setKeywords([{ term: "", type: "INCLUDE" }]);
  };

  const handleEdit = (plan: CollectionPlan) => {
    setForm({
      question: plan.name,
      hypothesisId: plan.hypothesis ? "" : "",
      frequency: plan.frequency,
      startDate: plan.startDate || "",
      endDate: plan.endDate || "",
    });
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleDelete = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this collection plan?")) return;
    try {
      await api.delete(`/collection-plans/${planId}`);
      fetchPlans();
    } catch (err) {
      console.error("Failed to delete plan:", err);
    }
  };

  const addSource = () => {
    setSources([...sources, { type: "RSS", url: "", name: "" }]);
  };

  const updateSource = (index: number, field: string, value: string) => {
    const newSources = [...sources];
    newSources[index] = { ...newSources[index], [field]: value };
    setSources(newSources);
  };

  const removeSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  const addKeyword = () => {
    setKeywords([...keywords, { term: "", type: "INCLUDE" }]);
  };

  const updateKeyword = (index: number, field: string, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = { ...newKeywords[index], [field]: value };
    setKeywords(newKeywords);
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const getFrequencyBadge = (frequency: string) => {
    const freqConfig: Record<string, { label: string; color: string }> = {
      ON_DEMAND: { label: "On Demand", color: "bg-gray-100 text-gray-800" },
      DAILY: { label: "Daily", color: "bg-blue-100 text-blue-800" },
      WEEKLY: { label: "Weekly", color: "bg-green-100 text-green-800" },
      MONTHLY: { label: "Monthly", color: "bg-purple-100 text-purple-800" },
    };
    const config = freqConfig[frequency] || freqConfig.WEEKLY;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredPlans = filterHypothesisId
    ? plans.filter((p) => p.hypothesis && p.hypothesis.statement ? true : false)
    : plans;

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/projects/${id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Project
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Collection Plans</h1>
          </div>
          <Button onClick={() => {
            setShowForm(!showForm);
            setEditingPlan(null);
            resetForm();
          }}>
            {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {showForm ? "Cancel" : "New Plan"}
          </Button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{editingPlan ? "Edit Plan" : "Create New Collection Plan"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="question">Plan Question</Label>
                    <Input
                      id="question"
                      value={form.question}
                      onChange={(e) => setForm({ ...form, question: e.target.value })}
                      placeholder="e.g., What are the latest AI developments?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hypothesisId">Linked Hypothesis</Label>
                    <select
                      id="hypothesisId"
                      value={form.hypothesisId}
                      onChange={(e) => setForm({ ...form, hypothesisId: e.target.value })}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      required
                    >
                      <option value="">Select a hypothesis</option>
                      {hypotheses.map((hyp) => (
                        <option key={hyp.id} value={hyp.id}>
                          {hyp.statement.substring(0, 50)}... (Axe: {hyp.axe?.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <select
                        id="frequency"
                        value={form.frequency}
                        onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="ON_DEMAND">On Demand</option>
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date Range</Label>
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={form.startDate}
                          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                          placeholder="Start"
                        />
                        <Input
                          type="date"
                          value={form.endDate}
                          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                          placeholder="End"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Sources</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addSource}>
                        <Plus className="mr-2 h-3 w-3" />
                        Add Source
                      </Button>
                    </div>
                    {sources.map((source, index) => (
                      <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                        <select
                          value={source.type}
                          onChange={(e) => updateSource(index, "type", e.target.value)}
                          className="h-10 rounded-md border border-input bg-background px-3 text-sm w-32"
                        >
                          <option value="RSS">RSS Feed</option>
                          <option value="WEB">Website</option>
                          <option value="PDF">PDF</option>
                        </select>
                        <Input
                          placeholder="URL"
                          value={source.url}
                          onChange={(e) => updateSource(index, "url", e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Name (optional)"
                          value={source.name}
                          onChange={(e) => updateSource(index, "name", e.target.value)}
                          className="w-48"
                        />
                        {sources.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSource(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Keywords</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addKeyword}>
                        <Plus className="mr-2 h-3 w-3" />
                        Add Keyword
                      </Button>
                    </div>
                    {keywords.map((keyword, index) => (
                      <div key={index} className="flex gap-2 items-center p-3 border rounded-lg">
                        <select
                          value={keyword.type}
                          onChange={(e) => updateKeyword(index, "type", e.target.value)}
                          className="h-10 rounded-md border border-input bg-background px-3 text-sm w-32"
                        >
                          <option value="INCLUDE">Include</option>
                          <option value="EXCLUDE">Exclude</option>
                        </select>
                        <Input
                          placeholder="Keyword"
                          value={keyword.term}
                          onChange={(e) => updateKeyword(index, "term", e.target.value)}
                          className="flex-1"
                        />
                        {keywords.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeKeyword(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button type="submit">
                    {editingPlan ? "Update Plan" : "Create Plan"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="flex items-center gap-4">
          <Label htmlFor="filterHypothesis">Filter by Hypothesis:</Label>
          <select
            id="filterHypothesis"
            value={filterHypothesisId}
            onChange={(e) => setFilterHypothesisId(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All Hypotheses</option>
            {hypotheses.map((hyp) => (
              <option key={hyp.id} value={hyp.id}>
                {hyp.statement.substring(0, 40)}...
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-card animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredPlans.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No collection plans yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first collection plan linked to a hypothesis
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-lg">{plan.name}</h3>
                          {getFrequencyBadge(plan.frequency)}
                          <Badge variant={plan.status === "ACTIVE" ? "default" : "secondary"}>
                            {plan.status}
                          </Badge>
                        </div>
                        {plan.hypothesis && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Hypothesis: {plan.hypothesis.statement.substring(0, 60)}...
                          </p>
                        )}
                        {(plan.startDate || plan.endDate) && (
                          <p className="text-xs text-muted-foreground">
                            {plan.startDate && `From: ${new Date(plan.startDate).toLocaleDateString()}`}
                            {plan.startDate && plan.endDate && " - "}
                            {plan.endDate && `To: ${new Date(plan.endDate).toLocaleDateString()}`}
                          </p>
                        )}
                        {plan.sources && plan.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm font-medium mb-2">Sources:</p>
                            <div className="flex flex-wrap gap-2">
                              {plan.sources.map((source) => (
                                <Badge key={source.id} variant="outline" className="flex items-center gap-1">
                                  {source.type === "RSS" ? <Rss className="h-3 w-3" /> : 
                                   source.type === "WEB" ? <Globe className="h-3 w-3" /> :
                                   <FileText className="h-3 w-3" />}
                                  {source.name || source.url.substring(0, 30)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {plan._count && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {plan._count.rawData} data points collected
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(plan.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
  );
}
