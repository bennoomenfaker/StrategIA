"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList, AlertTriangle, TrendingUp, CheckCircle, Clock,
  Target, Sparkles, ChevronRight, Filter,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Recommendation, Project } from "@/types";

function PriorityBadge({ priority }: { priority: string }) {
  const variants: Record<string, string> = {
    CRITICAL: "bg-red-500/10 text-red-500 border-red-500/30",
    HIGH: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    MEDIUM: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    LOW: "bg-muted text-muted-foreground border-muted",
  };
  return <Badge variant="outline" className={variants[priority] || variants.LOW}>{priority}</Badge>;
}

const statusColors: Record<string, string> = {
  DRAFT: "border-border bg-card",
  PROPOSED: "border-blue-500/30 bg-blue-500/5",
  APPROVED: "border-green-500/30 bg-green-500/5",
  REJECTED: "border-red-500/30 bg-red-500/5",
  IMPLEMENTED: "border-emerald-500/30 bg-emerald-500/5",
};

export default function RecommendationsPage() {
  const { t } = useI18n();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const projectsRes = await api.get("/projects");
      const projects: Project[] = projectsRes.data.data || projectsRes.data || [];
      const all: Recommendation[] = [];
      await Promise.all(
        projects.slice(0, 5).map(async (project) => {
          try {
            const res = await api.get(`/recommendations/project/${project.id}`);
            const data = res.data.data || res.data || [];
            all.push(...(Array.isArray(data) ? data : data.data || []));
          } catch { /* skip */ }
        })
      );
      setRecommendations(all);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filterStatus === "all"
    ? recommendations
    : recommendations.filter((r) => r.status === filterStatus);

  const statuses = [...new Set(recommendations.map((r) => r.status))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("recommendations.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{recommendations.length} recommandation{recommendations.length > 1 ? 's' : ''}</p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          IA
        </Badge>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
            filterStatus === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"
          }`}
        >
          Tous
        </button>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
              filterStatus === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">{t("recommendations.noRecommendations")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className={`overflow-hidden transition-all hover:shadow-md border ${statusColors[rec.status] || statusColors.DRAFT}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <PriorityBadge priority={rec.priority} />
                        <Badge variant="outline" className="text-xs">{rec.status}</Badge>
                      </div>
                      <h3 className="font-semibold">{rec.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{rec.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                        {rec.expectedImpact && (
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {rec.expectedImpact.substring(0, 60)}...
                          </span>
                        )}
                        {rec.deadline && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(rec.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {rec.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {rec.tags.map((tag, j) => (
                            <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2" />
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
