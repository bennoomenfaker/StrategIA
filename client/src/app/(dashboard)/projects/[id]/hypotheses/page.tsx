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
import {
  Plus, ArrowLeft, Lightbulb, Edit, Trash2, X, CheckCircle, XCircle, Clock,
  TrendingUp, AlertTriangle, Shield, BarChart3, Target, ChevronDown, ChevronUp,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import type { Hypothesis as HypothesisType, Axis as Axe, CollectionPlan } from "@/types";

interface Project {
  id: string;
  name: string;
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: "default" | "destructive" | "secondary" | "outline"; dot: string }> = {
    VALIDATED: { variant: "default", dot: "bg-green-500" },
    INVALIDATED: { variant: "destructive", dot: "bg-red-500" },
    IN_PROGRESS: { variant: "secondary", dot: "bg-blue-500" },
    PENDING_REVIEW: { variant: "outline", dot: "bg-amber-500" },
    OPEN: { variant: "outline", dot: "bg-gray-400" },
  };
  const v = variants[status] || variants.OPEN;
  return (
    <Badge variant={v.variant} className="flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${v.dot}`} />
      {status}
    </Badge>
  );
}

function ConfidenceBar({ label, value, color }: { label: string; value?: number | null; color: string }) {
  if (value === undefined || value === null) return null;
  const pct = Math.min(Math.max(value * 100, 0), 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function HypothesisCard({
  hypothesis,
  axes,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  hypothesis: HypothesisType;
  axes: Axe[];
  onEdit: (h: HypothesisType) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const hasAIData = hypothesis.validationScore !== undefined ||
    hypothesis.confidenceAfter !== undefined ||
    hypothesis.stabilityScore !== undefined ||
    hypothesis.scenario;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="overflow-hidden border-border/50 hover:border-primary/20 transition-all duration-300">
        <CardContent className="p-0">
          {/* Main row */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base leading-relaxed">{hypothesis.content}</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <StatusBadge status={hypothesis.status} />
                  <Badge variant="outline" className="text-xs">
                    P{hypothesis.priority}
                  </Badge>
                  {hypothesis.axis && (
                    <Badge variant="secondary" className="text-xs">
                      {hypothesis.axis.name}
                    </Badge>
                  )}
                  {hypothesis._count && (
                    <Badge variant="outline" className="text-xs">
                      {hypothesis._count.collectionPlans} plans
                    </Badge>
                  )}

                  {/* AI badges */}
                  {hypothesis.validationStatus && hypothesis.validationStatus !== "PENDING" && (
                    <Badge variant={
                      hypothesis.validationStatus === "SUPPORTED" ? "default" :
                      hypothesis.validationStatus === "CONTRADICTED" ? "destructive" : "secondary"
                    } className="text-xs">
                      {hypothesis.validationStatus === "SUPPORTED" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {hypothesis.validationStatus === "CONTRADICTED" && <XCircle className="h-3 w-3 mr-1" />}
                      {hypothesis.validationStatus === "UNCERTAIN" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {hypothesis.validationStatus}
                    </Badge>
                  )}
                  {hypothesis.evidenceCount !== undefined && hypothesis.evidenceCount > 0 && (
                    <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                      {hypothesis.evidenceCount} preuves
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpanded(!expanded)}>
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(hypothesis)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(hypothesis.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick AI score row */}
            {hasAIData && (
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
                {hypothesis.validationScore !== undefined && hypothesis.validationScore > 0 && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-primary">{(hypothesis.validationScore * 100).toFixed(0)}%</span>
                    <span className="text-muted-foreground text-xs">score</span>
                  </div>
                )}
                {hypothesis.confidenceAfter !== undefined && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <BarChart3 className="h-4 w-4 text-emerald-500" />
                    <span className="font-semibold text-emerald-500">{(hypothesis.confidenceAfter * 100).toFixed(0)}%</span>
                    <span className="text-muted-foreground text-xs">confiance</span>
                  </div>
                )}
                {hypothesis.evidenceCount !== undefined && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold">{hypothesis.evidenceCount}</span>
                    <span className="text-muted-foreground text-xs">preuves</span>
                  </div>
                )}
                {hypothesis.stabilityScore !== undefined && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="font-semibold text-purple-500">{(hypothesis.stabilityScore * 100).toFixed(0)}%</span>
                    <span className="text-muted-foreground text-xs">stable</span>
                  </div>
                )}
                <div className="ml-auto">
                  <select
                    value={hypothesis.status}
                    onChange={(e) => onStatusChange(hypothesis.id, e.target.value)}
                    className="text-xs h-7 rounded-md border border-input bg-background px-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                    <option value="VALIDATED">VALIDATED</option>
                    <option value="INVALIDATED">INVALIDATED</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Expanded AI analysis */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-border/50 bg-secondary/20 px-5 py-4 space-y-4">
                  {hypothesis.scenario && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        {t("hypotheses.scenario")}
                      </h4>
                      <p className="text-sm text-foreground/90 leading-relaxed">{hypothesis.scenario}</p>
                    </div>
                  )}

                  {hypothesis.timeframe && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t("hypotheses.timeframe")} :</span>
                      <span className="font-medium">{hypothesis.timeframe}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ConfidenceBar
                      label={t("hypotheses.confidence")}
                      value={hypothesis.confidenceAfter}
                      color="bg-emerald-500"
                    />
                    <ConfidenceBar
                      label={t("hypotheses.stability")}
                      value={hypothesis.stabilityScore}
                      color="bg-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-center">
                      <p className="text-2xl font-bold text-green-500">{hypothesis.evidenceCount ?? 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t("hypotheses.evidence")}</p>
                    </div>
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
                      <p className="text-2xl font-bold text-red-500">{hypothesis.contradictionCount ?? 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t("hypotheses.contradictions")}</p>
                    </div>
                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-center">
                      <p className="text-2xl font-bold text-blue-500">{hypothesis.supportCount ?? 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t("hypotheses.supports")}</p>
                    </div>
                  </div>

                  {/* Confidence evolution */}
                  {(hypothesis.confidenceBefore !== undefined || hypothesis.confidenceAfter !== undefined) && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Évolution de la confiance
                      </h4>
                      <div className="flex items-center gap-4">
                        {hypothesis.confidenceBefore !== undefined && (
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Avant</span>
                              <span>{(hypothesis.confidenceBefore * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full rounded-full bg-muted-foreground/40" style={{ width: `${hypothesis.confidenceBefore * 100}%` }} />
                            </div>
                          </div>
                        )}
                        {hypothesis.confidenceAfter !== undefined && (
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Après</span>
                              <span>{(hypothesis.confidenceAfter * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${hypothesis.confidenceAfter * 100}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {hypothesis.lastEvaluatedAt && (
                    <p className="text-xs text-muted-foreground">
                      Dernière évaluation : {new Date(hypothesis.lastEvaluatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ProjectHypothesesPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [hypotheses, setHypotheses] = useState<HypothesisType[]>([]);
  const [axes, setAxes] = useState<Axe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHypothesis, setEditingHypothesis] = useState<HypothesisType | null>(null);
  const [filterAxeId, setFilterAxeId] = useState<string>("");

  const [content, setContent] = useState("");
  const [priority, setPriority] = useState(1);
  const [selectedAxeId, setSelectedAxeId] = useState("");

  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { t } = useI18n();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchProject();
    fetchAxes();
    fetchHypotheses();
  }, [isAuthenticated, id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.data || res.data);
    } catch (err) {
      console.error("Failed to fetch project:", err);
    }
  };

  const fetchAxes = async () => {
    try {
      const res = await api.get(`/axes?projectId=${id}`);
      setAxes(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch axes:", err);
    }
  };

  const fetchHypotheses = async () => {
    try {
      const res = await api.get(`/hypotheses?projectId=${id}`);
      setHypotheses(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch hypotheses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { content, priority, axisId: selectedAxeId };
    if (!payload.content || !payload.axisId) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    try {
      if (editingHypothesis) {
        await api.patch(`/hypotheses/${editingHypothesis.id}`, payload);
      } else {
        await api.post("/hypotheses", payload);
      }
      resetForm();
      fetchHypotheses();
    } catch (err: any) {
      console.error("Failed to save hypothesis:", err);
      alert(`Erreur : ${err.response?.data?.message || err.message}`);
    }
  };

  const resetForm = () => {
    setContent("");
    setPriority(1);
    setSelectedAxeId("");
    setShowForm(false);
    setEditingHypothesis(null);
  };

  const handleEdit = (hypothesis: HypothesisType) => {
    setContent(hypothesis.content);
    setPriority(hypothesis.priority);
    setSelectedAxeId(hypothesis.axisId);
    setEditingHypothesis(hypothesis);
    setShowForm(true);
  };

  const handleDelete = async (hypId: string) => {
    if (!confirm(t("hypotheses.deleteConfirm"))) return;
    try {
      await api.delete(`/hypotheses/${hypId}`);
      fetchHypotheses();
    } catch (err) {
      console.error("Failed to delete hypothesis:", err);
    }
  };

  const handleStatusChange = async (hypId: string, newStatus: string) => {
    try {
      await api.patch(`/hypotheses/${hypId}`, { status: newStatus });
      fetchHypotheses();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const filteredHypotheses = filterAxeId
    ? hypotheses.filter((h) => h.axisId === filterAxeId)
    : hypotheses;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("common.back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{t("hypotheses.title")}</h1>
            {project && <p className="text-sm text-muted-foreground">{project.name}</p>}
          </div>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }} className="gap-2">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? t("common.cancel") : t("hypotheses.newHypothesis")}
        </Button>
      </div>

      {/* Create/Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  {editingHypothesis ? t("hypotheses.editHypothesis") : t("hypotheses.newHypothesis")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="axeId">{t("hypotheses.selectAxe")} *</Label>
                    <select
                      id="axeId"
                      value={selectedAxeId}
                      onChange={(e) => setSelectedAxeId(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      required
                    >
                      <option value="">-- {t("hypotheses.selectAxe")} --</option>
                      {axes.map((axe) => (
                        <option key={axe.id} value={axe.id}>
                          {axe.name}
                        </option>
                      ))}
                    </select>
                    {axes.length === 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("hypotheses.noAxes")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">{t("hypotheses.content")} *</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={t("hypotheses.content")}
                      required
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">{t("hypotheses.priority")}</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="1"
                      value={priority}
                      onChange={(e) => setPriority(+e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="gap-2">
                    <Plus className="h-4 w-4" />
                    {editingHypothesis ? t("common.save") : t("hypotheses.newHypothesis")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label className="text-sm text-muted-foreground">{t("hypotheses.filterByAxe")} :</Label>
        <select
          value={filterAxeId}
          onChange={(e) => setFilterAxeId(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{t("hypotheses.allAxes")}</option>
          {axes.map((axe) => (
            <option key={axe.id} value={axe.id}>{axe.name}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-card animate-pulse rounded-xl border border-border" />
          ))}
        </div>
      ) : filteredHypotheses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">{t("hypotheses.noHypotheses")}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Créez votre première hypothèse liée à un axe stratégique
            </p>
            <Button onClick={() => { resetForm(); setShowForm(true); }} className="mt-6 gap-2">
              <Plus className="h-4 w-4" />
              {t("hypotheses.newHypothesis")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredHypotheses.map((hypothesis) => (
            <HypothesisCard
              key={hypothesis.id}
              hypothesis={hypothesis}
              axes={axes}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
