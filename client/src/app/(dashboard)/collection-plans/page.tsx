"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { Rss, Globe, Plus, ArrowLeft, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CollectionPlan {
  id: string;
  question: string;
  frequency: string;
  isActive: boolean;
  hypothesisId: string;
  sources?: Source[];
  keywords?: Keyword[];
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
  const { hypothesisId } = useParams();
  const [plans, setPlans] = useState<CollectionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSource, setShowAddSource] = useState<string | null>(null);
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (hypothesisId) {
      fetchPlans();
    }
  }, [isAuthenticated, hypothesisId]);

  const fetchPlans = async () => {
    try {
      const res = await api.get(`/collection-plans`, { params: { hypothesisId } });
      setPlans(res.data || []);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await api.delete(`/collection-plans/${id}`);
      fetchPlans();
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
      fetchPlans();
    } catch (err) {
      console.error("Failed to add source:", err);
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/hypotheses">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold">Collection Plans</h2>
              <p className="text-muted-foreground">Manage data collection plans</p>
            </div>
          </div>
          <Link href={`/collection-plans/new?hypothesisId=${hypothesisId}`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Plan
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <Card className="p-12 text-center">
            <Rss className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No collection plans yet</h3>
            <p className="text-muted-foreground mt-2">Create your first collection plan</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{plan.question}</h3>
                          <Badge variant={plan.isActive ? "default" : "secondary"}>
                            {plan.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">{plan.frequency}</Badge>
                        </div>
                        
                        {plan.sources && plan.sources.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium">Sources:</p>
                            {plan.sources.map((source) => (
                              <div key={source.id} className="flex items-center gap-2 text-sm">
                                {source.sourceType === "RSS" ? (
                                  <Rss className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Globe className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="text-muted-foreground">{source.sourceLabel}</span>
                                <span className="text-xs text-muted-foreground">{source.sourceUrl}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-4"
                          onClick={() => setShowAddSource(showAddSource === plan.id ? null : plan.id)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Source
                        </Button>

                        {showAddSource === plan.id && (
                          <div className="mt-4 p-4 border border-border rounded-lg space-y-4">
                            <div>
                              <Label>URL</Label>
                              <Input placeholder="https://example.com" id={`url-${plan.id}`} />
                            </div>
                            <div>
                              <Label>Type</Label>
                              <select className="w-full h-10 rounded-md border border-input px-3 text-sm" id={`type-${plan.id}`}>
                                <option value="web">Web</option>
                                <option value="rss">RSS</option>
                                <option value="api">API</option>
                              </select>
                            </div>
                            <div>
                              <Label>Label</Label>
                              <Input placeholder="Example Source" id={`label-${plan.id}`} />
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                const url = (document.getElementById(`url-${plan.id}`) as HTMLInputElement)?.value;
                                const type = (document.getElementById(`type-${plan.id}`) as HTMLSelectElement)?.value;
                                const label = (document.getElementById(`label-${plan.id}`) as HTMLInputElement)?.value;
                                if (url && type && label) {
                                  handleAddSource(plan.id, url, type, label);
                                }
                              }}
                            >
                              Add Source
                            </Button>
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(plan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
